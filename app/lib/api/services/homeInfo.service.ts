import { apiGet, apiPut } from '../axios';
import { API_CONFIG } from '../config';
import { HomeInfo, UpdateHomeInfoDto } from '../types';

/** Read the admin JWT from the non-httpOnly cookie (same source as the axios interceptor). */
function getAdminToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_token_access=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Home Info API Service
 */
export const homeInfoService = {
  /**
   * Get home info
   */
  get: async (): Promise<HomeInfo | null> => {
    try {
      const response = await apiGet<HomeInfo>('/home-info');
      return response.data || null;
    } catch (error) {
      console.error('Error fetching home info:', error);
      return null;
    }
  },

  /**
   * Update home info (Admin only)
   * Supports both JSON (with URLs) and FormData (with file uploads)
   */
  update: async (data: UpdateHomeInfoDto | FormData): Promise<HomeInfo> => {
    if (data instanceof FormData) {
      // Handle FormData for file uploads
      // Note: FormData sends all values as strings, backend should parse them
      const token = getAdminToken() || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
      const response = await fetch(`${API_CONFIG.BASE_URL}/home-info`, {
        method: 'PUT',
        body: data,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      let result: any;
      try {
        result = await response.json();
      } catch {
        throw new Error(`Failed to update home info (HTTP ${response.status})`);
      }
      if (!result.success) {
        const error: any = new Error(result.message || 'Failed to update home info');
        error.errors = result.errors;
        throw error;
      }
      return result.data;
    } else {
      // Handle JSON
      const response = await apiPut<HomeInfo>('/home-info', data);
      return response.data;
    }
  },
};
