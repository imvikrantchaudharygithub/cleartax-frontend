import { apiGet, apiPost, apiPut, apiDelete } from '../axios';
import {
  ComplianceDeadline,
  ComplianceDocument,
  ComplianceStats,
  PaginatedResponse,
} from '../types';

/**
 * Compliance API Service
 */
export const complianceService = {
  /**
   * Get compliance deadlines
   */
  getDeadlines: async (params?: { page?: number; limit?: number; status?: 'urgent' | 'upcoming' | 'completed'; category?: 'GST' | 'Income Tax' | 'TDS' | 'Other' }): Promise<PaginatedResponse<ComplianceDeadline>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);

    const queryString = queryParams.toString();
    const endpoint = `/compliance/deadlines${queryString ? `?${queryString}` : ''}`;
    const response = await apiGet<ComplianceDeadline[]>(endpoint);
    return response as PaginatedResponse<ComplianceDeadline>;
  },

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines: async (limit?: number): Promise<ComplianceDeadline[]> => {
    const endpoint = limit ? `/compliance/deadlines/upcoming?limit=${limit}` : '/compliance/deadlines/upcoming';
    const response = await apiGet<ComplianceDeadline[]>(endpoint);
    return response.data || [];
  },

  /**
   * Create deadline (Admin only)
   */
  createDeadline: async (data: Partial<ComplianceDeadline>): Promise<ComplianceDeadline> => {
    const response = await apiPost<ComplianceDeadline>('/compliance/deadlines', data);
    return response.data;
  },

  /**
   * Update deadline (Admin only)
   */
  updateDeadline: async (id: string, data: Partial<ComplianceDeadline>): Promise<ComplianceDeadline> => {
    const response = await apiPut<ComplianceDeadline>(`/compliance/deadlines/${id}`, data);
    return response.data;
  },

  /**
   * Delete deadline (Admin only)
   */
  deleteDeadline: async (id: string): Promise<void> => {
    await apiDelete(`/compliance/deadlines/${id}`);
  },

  /**
   * Get compliance documents
   */
  getDocuments: async (params?: { page?: number; limit?: number; status?: 'verified' | 'pending' | 'rejected' }): Promise<PaginatedResponse<ComplianceDocument>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/compliance/documents${queryString ? `?${queryString}` : ''}`;
    const response = await apiGet<ComplianceDocument[]>(endpoint);
    return response as PaginatedResponse<ComplianceDocument>;
  },

  /**
   * Upload document
   */
  uploadDocument: async (file: File, data: Partial<ComplianceDocument>): Promise<ComplianceDocument> => {
    const formData = new FormData();
    formData.append('document', file);
    if (data.name) formData.append('name', data.name);
    if (data.type) formData.append('type', data.type);
    if (data.uploadDate) formData.append('uploadDate', data.uploadDate);
    if (data.userId) formData.append('userId', data.userId);

    const axios = (await import('../axios')).default;
    const response = await axios.post('/compliance/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * Update document status (Admin only)
   */
  updateDocument: async (id: string, data: Partial<ComplianceDocument>): Promise<ComplianceDocument> => {
    const response = await apiPut<ComplianceDocument>(`/compliance/documents/${id}`, data);
    return response.data;
  },

  /**
   * Delete document (Admin only)
   */
  deleteDocument: async (id: string): Promise<void> => {
    await apiDelete(`/compliance/documents/${id}`);
  },

  /**
   * Get compliance statistics
   */
  getStats: async (): Promise<ComplianceStats> => {
    const response = await apiGet<ComplianceStats>('/compliance/stats');
    return response.data;
  },
};

