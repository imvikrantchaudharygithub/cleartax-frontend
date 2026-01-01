import { apiGet, apiPost, apiPut, apiDelete } from '../axios';
import { Inquiry, CreateInquiryDto, InquiryStats, PaginatedResponse } from '../types';

export interface InquiryListParams {
  page?: number;
  limit?: number;
  type?: 'callback' | 'query';
  status?: 'pending' | 'contacted' | 'resolved' | 'archived';
  sourcePage?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Inquiry API Service
 */
export const inquiryService = {
  /**
   * Create inquiry/callback request
   */
  create: async (data: CreateInquiryDto): Promise<Inquiry> => {
    const response = await apiPost<Inquiry>('/inquiries', data);
    return response.data;
  },

  /**
   * Get all inquiries (Admin only)
   */
  getAll: async (params?: InquiryListParams): Promise<PaginatedResponse<Inquiry>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sourcePage) queryParams.append('sourcePage', params.sourcePage);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/inquiries${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<Inquiry[]>(endpoint);
    return response as PaginatedResponse<Inquiry>;
  },

  /**
   * Get inquiry statistics (Admin only)
   */
  getStats: async (): Promise<InquiryStats> => {
    const response = await apiGet<InquiryStats>('/inquiries/stats');
    return response.data;
  },

  /**
   * Get inquiry by ID (Admin only)
   */
  getById: async (id: string): Promise<Inquiry | null> => {
    try {
      const response = await apiGet<Inquiry>(`/inquiries/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Update inquiry (Admin only)
   */
  update: async (id: string, data: Partial<Inquiry>): Promise<Inquiry> => {
    const response = await apiPut<Inquiry>(`/inquiries/${id}`, data);
    return response.data;
  },

  /**
   * Delete inquiry (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiDelete(`/inquiries/${id}`);
  },

  /**
   * Export inquiries to Excel (Admin only)
   */
  export: async (params?: InquiryListParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sourcePage) queryParams.append('sourcePage', params.sourcePage);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/inquiries/export${queryString ? `?${queryString}` : ''}`;
    
    // For file downloads, we need to handle blob response
    const axios = (await import('../axios')).default;
    const response = await axios.get(endpoint, {
      responseType: 'blob',
    });
    
    return response.data;
  },
};

