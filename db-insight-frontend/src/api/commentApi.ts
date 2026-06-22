import client from './client';

export const commentApi = {
  updateTableComment: (connectionId: string, tableName: string, comment: string) =>
    client.patch(`/connections/${connectionId}/tables/${tableName}/comment`, { comment }),

  updateColumnComment: (connectionId: string, tableName: string, columnName: string, comment: string) =>
    client.patch(`/connections/${connectionId}/tables/${tableName}/columns/${encodeURIComponent(columnName)}/comment`, { comment }),
};
