/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { apiCall, handleApiError } from '@/utils/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
}

export function useApi<T = any>(
  url: string,
  options?: UseApiOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (requestOptions?: RequestInit) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall<T>(url, requestOptions);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      if (options?.showErrorToast !== false) {
        handleApiError(error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return { execute, loading, error, data };
}