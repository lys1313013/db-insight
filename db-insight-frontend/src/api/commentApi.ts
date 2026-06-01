import client from './client';

export const commentApi = {
  updateTableComment: (connectionId: string, tableName: string, comment: string) =>
    client.patch(`/connections/${connectionId}/tables/${tableName}/comment`, { comment }),
};
