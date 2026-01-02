import { apiGet, apiPut } from '../axios';
import { ContactInfo } from '../types';

/**
 * Contact Information API Service
 */
export const contactService = {
  /**
   * Get contact information
   */
  get: async (): Promise<ContactInfo | null> => {
    try {
      const response = await apiGet<ContactInfo>('/contact');
      // apiGet returns ApiResponse<T> which has { success: true, data: T }
      return response.data || null;
    } catch (error: any) {
      // If 404, return null (contact info doesn't exist yet)
      if (error?.response?.status === 404) {
        return null;
      }
      // If endpoint doesn't exist yet, return null
      if (process.env.NODE_ENV === 'development') {
        console.warn('Contact API not available:', error);
      }
      return null;
    }
  },

  /**
   * Update contact information (Admin only)
   * Uses PUT method - creates if doesn't exist, updates if exists
   */
  update: async (data: ContactInfo): Promise<ContactInfo> => {
    const response = await apiPut<ContactInfo>('/contact', data);
    // apiPut returns ApiResponse<T> which has { success: true, data: T }
    return response.data;
  },
};

