import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  plan: string;
  emailVerified: boolean;
  preferredLanguage: string;
  wallet?: { address: string };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ address: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          Cookies.set('access_token', data.data.accessToken, { expires: 1/96, secure: true, sameSite: 'strict' });
          Cookies.set('refresh_token', data.data.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
          set({ user: { ...data.data.user, wallet: data.data.wallet } });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register({ email, password, fullName });
          Cookies.set('access_token', data.data.accessToken, { expires: 1/96, secure: true, sameSite: 'strict' });
          Cookies.set('refresh_token', data.data.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
          set({ user: { ...data.data.user, wallet: data.data.wallet } });
          return data.data.wallet;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ user: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data.data });
        } catch {
          set({ user: null });
        }
      },
    }),
    { name: 'linguara-auth', partialize: (s) => ({ user: s.user }) }
  )
);
