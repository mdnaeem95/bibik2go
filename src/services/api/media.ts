/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './base';
import { MediaFile } from '@/types';

export const mediaApi = {
  async upload(
    file: File,
    metadata: {
      incidentId?: string;
      helperName?: string;
      helperCurrentEmployer?: string;
      description?: string;
    },
    onProgress?: (progress: number) => void
  ): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    return apiClient.upload<MediaFile>('/media/upload', formData, onProgress);
  },

  async getFileInfo(fileId: string): Promise<any> {
    return apiClient.get<any>(`/media/${fileId}`);
  },

  async deleteFile(fileId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/media/${fileId}`);
  },
};