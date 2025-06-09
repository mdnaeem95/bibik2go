import { apiClient } from './base';
import { Helper, NewHelper } from '@/types';

export const helpersApi = {
  async getAll(): Promise<Helper[]> {
    return apiClient.get<Helper[]>('/helpers');
  },

  async getById(id: string): Promise<Helper> {
    return apiClient.get<Helper>(`/helpers/${id}`);
  },

  async create(data: NewHelper): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>('/helpers', data);
  },

  async update(id: string, data: Partial<NewHelper>): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/helpers/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/helpers/${id}`);
  },
};