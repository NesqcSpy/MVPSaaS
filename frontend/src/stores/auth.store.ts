'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, clearTokens, setTokens } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  organizationId?: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  setUser: (u: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, organizationName?: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle',

      setUser: (u) => set({ user: u, status: u ? 'authenticated' : 'unauthenticated' }),

      async login(email, password) {
        set({ status: 'loading' });
        const res = await api.post<{
          user: AuthUser;
          tokens: { accessToken: string; refreshToken: string };
        }>('/auth/login', { email, password });
        setTokens(res.tokens.accessToken, res.tokens.refreshToken);
        set({ user: res.user, status: 'authenticated' });
      },

      async register(email, password, name, organizationName) {
        set({ status: 'loading' });
        const res = await api.post<{
          user: AuthUser;
          tokens: { accessToken: string; refreshToken: string };
        }>('/auth/register', { email, password, name, organizationName });
        setTokens(res.tokens.accessToken, res.tokens.refreshToken);
        set({ user: res.user, status: 'authenticated' });
      },

      async logout() {
        try {
          const refreshToken = window.localStorage.getItem('dataclean.refresh');
          if (refreshToken) await api.post('/auth/logout', { refreshToken });
        } catch {
          /* ignore — clear anyway */
        }
        clearTokens();
        set({ user: null, status: 'unauthenticated' });
      },

      async bootstrap() {
        try {
          const me = await api.post<AuthUser>('/auth/me');
          set({ user: me, status: 'authenticated' });
        } catch {
          set({ user: null, status: 'unauthenticated' });
        }
      },
    }),
    {
      name: 'dataclean-auth',
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
