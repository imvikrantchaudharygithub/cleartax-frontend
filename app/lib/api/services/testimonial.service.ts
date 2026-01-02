import { apiGet, apiPost, apiPut, apiDelete } from '../axios';
import { API_CONFIG } from '../config';
import { Testimonial, CreateTestimonialDto, UpdateTestimonialDto } from '../types';

/**
 * Testimonial API Service
 */
export const testimonialService = {
  /**
   * Get all testimonials
   */
  getAll: async (): Promise<Testimonial[]> => {
    const response = await apiGet<Testimonial[]>('/testimonials');
    return response.data || [];
  },

  /**
   * Get featured testimonials
   */
  getFeatured: async (): Promise<Testimonial[]> => {
    const response = await apiGet<Testimonial[]>('/testimonials/featured');
    return response.data || [];
  },

  /**
   * Get testimonial by ID (MongoDB _id)
   */
  getById: async (id: string): Promise<Testimonial | null> => {
    try {
      const response = await apiGet<Testimonial>(`/testimonials/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Create testimonial (Admin only)
   * Supports both JSON (with URLs) and FormData (with file uploads)
   */
  create: async (data: CreateTestimonialDto | FormData): Promise<Testimonial> => {
    if (data instanceof FormData) {
      // Handle FormData for file uploads
      // Note: FormData sends all values as strings, backend should parse them
      const response = await fetch(`${API_CONFIG.BASE_URL}/testimonials`, {
        method: 'POST',
        body: data,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create testimonial');
      }
      return result.data;
    } else {
      // Handle JSON
      const response = await apiPost<Testimonial>('/testimonials', data);
      return response.data;
    }
  },

  /**
   * Update testimonial (Admin only)
   * Supports both JSON (with URLs) and FormData (with file uploads)
   */
  update: async (id: string, data: UpdateTestimonialDto | FormData): Promise<Testimonial> => {
    if (data instanceof FormData) {
      // Handle FormData for file uploads
      // Note: FormData sends all values as strings, backend should parse them
      const response = await fetch(`${API_CONFIG.BASE_URL}/testimonials/${id}`, {
        method: 'PUT',
        body: data,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update testimonial');
      }
      return result.data;
    } else {
      // Handle JSON
      const response = await apiPut<Testimonial>(`/testimonials/${id}`, data);
      return response.data;
    }
  },

  /**
   * Delete testimonial (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiDelete(`/testimonials/${id}`);
  },
};

