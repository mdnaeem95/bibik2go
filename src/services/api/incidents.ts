import { apiClient } from './base';
import { Incident, NewIncident, MediaFile } from '@/types';

export const incidentsApi = {
  async getAll(helperId?: string): Promise<Incident[]> {
    const query = helperId ? `?helperId=${helperId}` : '';
    return apiClient.get<Incident[]>(`/incidents${query}`);
  },

  async getById(id: string): Promise<Incident> {
    return apiClient.get<Incident>(`/incidents/${id}`);
  },

  async create(data: NewIncident): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>('/incidents', data);
  },

  async update(id: string, data: Partial<NewIncident>): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/incidents/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/incidents/${id}`);
  },

  async getMedia(incidentId: string): Promise<{ mediaFiles: MediaFile[] }> {
    return apiClient.get<{ mediaFiles: MediaFile[] }>(`/incidents/${incidentId}/media`);
  },
};