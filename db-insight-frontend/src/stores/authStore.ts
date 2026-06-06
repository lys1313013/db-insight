import { create } from 'zustand';
import { authApi } from '../api/authApi';

const TOKEN_KEY = 'db-insight-token';
const USER_KEY = 'db-insight-user';

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

function loadInitial(): Pick<AuthState, 'token' | 'user'> {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (!token || !userRaw) return { token: null, user: null };
    return { token, user: JSON.parse(userRaw) as AuthUser };
  } catch {
    return { token: null, user: null };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitial(),
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.login(username, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      set({ token: data.token, user: data.user, loading: false });
    } catch (err: unknown) {
      const message = extractMessage(err, '登录失败');
      set({ loading: false, error: message });
      throw err;
    }
  },

  register: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.register(username, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      set({ token: data.token, user: data.user, loading: false });
    } catch (err: unknown) {
      const message = extractMessage(err, '注册失败');
      set({ loading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
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
