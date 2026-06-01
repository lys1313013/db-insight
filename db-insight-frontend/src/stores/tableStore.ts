import { create } from 'zustand';
import { TableInfo } from '../types';
import { schemaApi } from '../api/schemaApi';
import { useConnectionStore } from './connectionStore';

interface TableState {
  tables: TableInfo[];
  tableSearchQuery: string;
  columnSearchQuery: string;
  loading: boolean;
  error: string | null;
  fetchTables: () => Promise<void>;
  setTableSearchQuery: (query: string) => void;
  setColumnSearchQuery: (query: string) => void;
}

export const useTableStore = create<TableState>((set) => ({
  tables: [],
  tableSearchQuery: '',
  columnSearchQuery: '',
  loading: false,
  error: null,

  fetchTables: async () => {
    const { connectionId } = useConnectionStore.getState();
    if (!connectionId) return;

    set({ loading: true, error: null });
    try {
      const { data } = await schemaApi.getTables(connectionId);
      set({ tables: data.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取表列表失败';
      set({ loading: false, error: message });
    }
  },

  setTableSearchQuery: (query) => set({ tableSearchQuery: query }),
  setColumnSearchQuery: (query) => set({ columnSearchQuery: query }),
}));
