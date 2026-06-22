import { create } from 'zustand';
import { ConnectionConfig, ConnectionView } from '../types';
import { connectionApi } from '../api/connectionApi';
import { schemaApi } from '../api/schemaApi';

const STORAGE_KEY = 'db-insight-connection';
const LEGACY_SAVED_KEY = 'db-insight-saved-connections';

interface StoredConnection {
  connectionId: string;
  dbType: string;
  database: string;
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

// One-time cleanup of the old localStorage key (from the pre-backend era)
localStorage.removeItem(LEGACY_SAVED_KEY);

interface ConnectionState {
  connectionId: string | null;
  isConnected: boolean;
  dbType: 'mysql' | 'postgresql' | null;
  database: string | null;
  connections: ConnectionView[];
  loading: boolean;
  loadingConnections: boolean;
  error: string | null;
  connect: (config: ConnectionConfig) => Promise<void>;
  connectToView: (view: ConnectionView) => Promise<void>;
  disconnect: () => Promise<void>;
  restoreConnection: () => Promise<void>;
  loadConnections: () => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  updateConnection: (id: string, config: ConnectionConfig) => Promise<void>;
  clearError: () => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connectionId: null,
  isConnected: false,
  dbType: null,
  database: null,
  connections: [],
  loading: false,
  loadingConnections: false,
  error: null,

  connect: async (config) => {
    set({ loading: true, error: null });
    try {
      await connectionApi.test(config);
      const { data } = await connectionApi.create(config);
      set({
        connectionId: data.connectionId,
        isConnected: true,
        dbType: config.type,
        database: config.database,
        loading: false,
      });
      saveToStorage({
        connectionId: data.connectionId,
        dbType: config.type,
        database: config.database,
      });
      get().loadConnections();
    } catch (err: unknown) {
      set({ loading: false, error: extractMessage(err, '连接失败') });
      throw err;
    }
  },

  connectToView: async (view) => {
    set({ loading: true, error: null });
    try {
      await schemaApi.getTables(view.id);
      set({
        connectionId: view.id,
        isConnected: true,
        dbType: view.dbType,
        database: view.database,
        loading: false,
      });
      saveToStorage({
        connectionId: view.id,
        dbType: view.dbType,
        database: view.database,
      });
    } catch (err: unknown) {
      set({ loading: false, error: extractMessage(err, '无法连接到目标库,请确认数据库是否可达') });
      throw err;
    }
  },

  disconnect: async () => {
    const { connectionId } = get();
    if (connectionId) {
      try {
        await connectionApi.closeJdbc(connectionId);
      } catch {
        // ignore
      }
    }
    clearStorage();
    set({
      connectionId: null,
      isConnected: false,
      dbType: null,
      database: null,
    });
    get().loadConnections();
  },

  restoreConnection: async () => {
    const stored = loadFromStorage();
    if (!stored) return;
    set({
      connectionId: stored.connectionId,
      dbType: stored.dbType as 'mysql' | 'postgresql',
      database: stored.database,
      isConnected: true,
    });
    try {
      await schemaApi.getTables(stored.connectionId);
      set({ loading: false });
    } catch {
      // Backend rejected the saved connection (e.g. JDBC died, DB down).
      // Keep the saved id/dbType/database so the user can pick from the
      // Sidebar and reconnect — don't nuke localStorage on a transient error.
      set({ isConnected: false, loading: false });
    }
  },

  loadConnections: async () => {
    set({ loadingConnections: true });
    try {
      const { data } = await connectionApi.list();
      set({ connections: data, loadingConnections: false });
    } catch {
      set({ loadingConnections: false });
    }
  },

  deleteConnection: async (id) => {
    try {
      await connectionApi.remove(id);
      set({ connections: get().connections.filter((c) => c.id !== id) });
      const { connectionId } = get();
      if (connectionId === id) {
        clearStorage();
        set({ connectionId: null, isConnected: false, dbType: null, database: null });
      }
    } catch (err: unknown) {
      set({ error: extractMessage(err, '删除连接失败') });
      throw err;
    }
  },

  updateConnection: async (id, config) => {
    await connectionApi.update(id, config);
    set({
      connections: get().connections.map((c) =>
        c.id === id
          ? { ...c, name: config.name, dbType: config.type, host: config.host, port: config.port, database: config.database, username: config.username }
          : c
      ),
    });
    const { connectionId } = get();
    if (connectionId === id) {
      saveToStorage({ connectionId: id, dbType: config.type, database: config.database });
      set({ dbType: config.type, database: config.database });
    }
  },

  clearError: () => set({ error: null }),
}));

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? fallback;
  }
  return fallback;
}
