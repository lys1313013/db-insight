import { create } from 'zustand';
import { ConnectionConfig } from '../types';
import { connectionApi } from '../api/connectionApi';
import { schemaApi } from '../api/schemaApi';

const STORAGE_KEY = 'db-insight-connection';
const SAVED_KEY = 'db-insight-saved-connections';

export interface SavedConnection {
  id: string;
  name: string;
  config: ConnectionConfig;
  createdAt: number;
}

interface StoredConnection {
  connectionId: string;
  config: ConnectionConfig;
  dbType: string;
  database: string;
}

function loadSavedConnections(): SavedConnection[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedConnection[];
  } catch {
    return [];
  }
}

function saveSavedConnections(list: SavedConnection[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

function loadFromStorage(): StoredConnection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredConnection;
  } catch {
    return null;
  }
}

function saveToStorage(data: StoredConnection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

interface ConnectionState {
  connectionId: string | null;
  isConnected: boolean;
  dbType: 'mysql' | 'postgresql' | null;
  database: string | null;
  config: ConnectionConfig | null;
  loading: boolean;
  error: string | null;
  savedConnections: SavedConnection[];
  connect: (config: ConnectionConfig) => Promise<void>;
  disconnect: () => Promise<void>;
  restoreConnection: () => Promise<void>;
  clearError: () => void;
  saveConnection: (name: string, config: ConnectionConfig) => void;
  deleteSavedConnection: (id: string) => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connectionId: null,
  isConnected: false,
  dbType: null,
  database: null,
  config: null,
  loading: false,
  error: null,
  savedConnections: loadSavedConnections(),

  connect: async (config: ConnectionConfig) => {
    set({ loading: true, error: null });
    try {
      await connectionApi.test(config);
      const { data } = await connectionApi.create(config);
      const state = {
        connectionId: data.connectionId,
        isConnected: true,
        dbType: config.type,
        database: config.database,
        config,
      };
      set({ ...state, loading: false });
      saveToStorage({
        connectionId: data.connectionId,
        config,
        dbType: config.type,
        database: config.database,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '连接失败';
      set({ loading: false, error: message });
      throw err;
    }
  },

  disconnect: async () => {
    const { connectionId } = get();
    if (connectionId) {
      try {
        await connectionApi.disconnect(connectionId);
      } catch {
        // ignore disconnect error
      }
    }
    clearStorage();
    set({
      connectionId: null,
      isConnected: false,
      dbType: null,
      database: null,
      config: null,
    });
  },

  restoreConnection: async () => {
    const stored = loadFromStorage();
    if (!stored) return;

    set({ loading: true });
    try {
      await schemaApi.getTables(stored.connectionId);
      set({
        connectionId: stored.connectionId,
        isConnected: true,
        dbType: stored.dbType as 'mysql' | 'postgresql',
        database: stored.database,
        config: stored.config,
        loading: false,
      });
    } catch {
      clearStorage();
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),

  saveConnection: (name, config) => {
    const saved: SavedConnection = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      config,
      createdAt: Date.now(),
    };
    const list = [...get().savedConnections, saved];
    saveSavedConnections(list);
    set({ savedConnections: list });
  },

  deleteSavedConnection: (id) => {
    const list = get().savedConnections.filter((c) => c.id !== id);
    saveSavedConnections(list);
    set({ savedConnections: list });
  },
}));
