import client from './client';
import { ConnectionConfig, ConnectionView } from '../types';

export const connectionApi = {
  test: (config: ConnectionConfig) =>
    client.post('/connections/test', config),

  create: (config: ConnectionConfig) =>
    client.post<{ connectionId: string }>('/connections', config),

  list: () =>
    client.get<ConnectionView[]>('/connections'),

  // Close the live JDBC connection but keep the row in DB
  closeJdbc: (connectionId: string) =>
    client.post(`/connections/${connectionId}/disconnect`),

  // Actually delete the row from DB
  remove: (connectionId: string) =>
    client.delete(`/connections/${connectionId}`),

  update: (connectionId: string, config: ConnectionConfig) =>
    client.put(`/connections/${connectionId}`, config),
};
