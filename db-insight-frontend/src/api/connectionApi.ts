import client from './client';
import { ConnectionConfig } from '../types';

export const connectionApi = {
  test: (config: ConnectionConfig) =>
    client.post('/connections/test', config),

  create: (config: ConnectionConfig) =>
    client.post('/connections', config),

  disconnect: (connectionId: string) =>
    client.delete(`/connections/${connectionId}`),
};
