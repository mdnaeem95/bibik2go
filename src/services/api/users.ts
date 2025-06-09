import { apiClient } from './base';
import { User, NewUser, UserRole, UserStatus } from '@/types';

export const usersApi = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  },

  async create(data: Omit<NewUser, 'createdBy'>): Promise<User> {
    return apiClient.post<User>('/users', data);
  },

  async updateStatus(id: string, status: UserStatus): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/users/${id}`, { status });
  },

  async updateRole(id: string, role: UserRole): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/users/${id}`, { role });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>('/users/profile');
  },

  async updateProfile(data: { email: string }): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>('/users/profile', data);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string; logout?: boolean }> {
    return apiClient.post<{ message: string; logout?: boolean }>('/users/change-password', {
      currentPassword,
      newPassword,
    });
  },
};