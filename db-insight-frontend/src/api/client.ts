import axios from 'axios';
import { TOKEN_KEY, USER_KEY } from '../constants';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.hash.replace(/^#/, '') || '/';
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        window.location.hash = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
