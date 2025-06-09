/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from 'react-hot-toast';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiCall<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new ApiError(response.status, error.error || error.message || 'Request failed');
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Network error');
  }
}

export const handleApiError = (error: unknown, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    if (error.status === 401) {
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
      return;
    }
    if (error.status === 403) {
      toast.error('You don\'t have permission to perform this action.');
      return;
    }
    toast.error(error.message);
    return;
  }
  
  toast.error(error instanceof Error ? error.message : defaultMessage);
};