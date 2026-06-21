import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          Cookies.set('access_token', data.data.accessToken, { expires: 1/96 }); // 15min
          Cookies.set('refresh_token', data.data.refreshToken, { expires: 7 });
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  exportKey: (password: string) =>
    api.post('/auth/export-key', { password }),
};

// Translations
export const translationApi = {
  create: (data: {
    sourceText: string;
    targetLanguage: string;
    sourceLanguage?: string;
    domain?: string;
    documentType?: string;
  }) => api.post('/translations', data),
  get: (id: string) => api.get(`/translations/${id}`),
  list: (page = 1, limit = 20) =>
    api.get(`/translations?page=${page}&limit=${limit}`),
  audit: (page = 1, limit = 50) =>
    api.get(`/translations/audit?page=${page}&limit=${limit}`),
};
