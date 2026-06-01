import client from './client';

export const schemaApi = {
  getTables: (connectionId: string) =>
    client.get(`/connections/${connectionId}/tables`),

  getTableDetail: (connectionId: string, tableName: string) =>
    client.get(`/connections/${connectionId}/tables/${tableName}`),

  exportMarkdown: (connectionId: string) =>
    client.get(`/connections/${connectionId}/export/markdown`),
};
