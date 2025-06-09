import { apiClient } from './base';
import { SessionUser } from '@/lib/session';

export const authApi = {
  async login(username: string, password: string): Promise<{ message: string; role: string }> {
    return apiClient.post<{ message: string; role: string }>('/login', {
      username,
      password,
    });
  },

  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/logout');
  },

  async checkSession(): Promise<{ valid: boolean; user?: Partial<SessionUser> }> {
    return apiClient.get<{ valid: boolean; user?: Partial<SessionUser> }>('/session/check');
  },

  async updateSessionSettings(sessionTimeout: number): Promise<{ message: string; sessionTimeout: number }> {
    return apiClient.put<{ message: string; sessionTimeout: number }>('/session/settings', {
      sessionTimeout,
    });
  },
};