import client from './client';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export const authApi = {
  register: (username: string, password: string) =>
    client.post<AuthResponse>('/auth/register', { username, password }),

  login: (username: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { username, password }),
};
