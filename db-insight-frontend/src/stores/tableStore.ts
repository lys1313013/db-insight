import { create } from 'zustand';
import { TableInfo } from '../types';
import { schemaApi } from '../api/schemaApi';
import { useConnectionStore } from './connectionStore';

interface TableState {
  tables: TableInfo[];
  tableSearchQuery: string;
  loading: boolean;
  error: string | null;
  fetchTables: () => Promise<void>;
  fetchRowCounts: () => Promise<void>;
  setTableSearchQuery: (query: string) => void;
}

export const useTableStore = create<TableState>((set, get) => ({
  tables: [],
  tableSearchQuery: '',
  loading: false,
  error: null,

  fetchTables: async () => {
    const { connectionId } = useConnectionStore.getState();
    if (!connectionId) return;

    set({ loading: true, error: null });
    try {
      const { data } = await schemaApi.getTables(connectionId);
      set({ tables: data.data, loading: false });
      // 异步加载行数
      get().fetchRowCounts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取表列表失败';
      set({ loading: false, error: message });
    }
  },

  fetchRowCounts: async () => {
    const { tables } = get();
    const { connectionId } = useConnectionStore.getState();
    if (!connectionId || tables.length === 0) return;

    // 标记所有表为加载中
    set({
      tables: tables.map((t) => ({ ...t, rowCountLoading: true })),
    });

    try {
      const tableNames = tables.map((t) => t.tableName);
      const { data } = await schemaApi.getRowCounts(connectionId, tableNames);
      const rowCounts: Record<string, number> = data.data;
      set({
        tables: get().tables.map((t) => ({
          ...t,
          rowCount: rowCounts[t.tableName],
          rowCountLoading: false,
        })),
      });
    } catch {
      set({
        tables: get().tables.map((t) => ({ ...t, rowCountLoading: false })),
      });
    }
  },

  setTableSearchQuery: (query) => set({ tableSearchQuery: query }),
}));
