import { apiGet, apiPost, apiPut, apiDelete } from '../axios';
import { Service, ServiceCategory, CreateServiceDto, UpdateServiceDto, PaginatedResponse } from '../types';

/**
 * Service API Service
 */
export const serviceService = {
  /**
   * Get all services
   */
  getAll: async (params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<PaginatedResponse<Service>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/services${queryString ? `?${queryString}` : ''}`;
    const response = await apiGet<Service[]>(endpoint);
    return response as PaginatedResponse<Service>;
  },

  /**
   * Get all service categories
   */
  getCategories: async (): Promise<ServiceCategory[]> => {
    try {
      const response = await apiGet<ServiceCategory[]>('/services/categories');
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Get services by category
   */
  getByCategory: async (category: string): Promise<Service[]> => {
    try {
      const response = await apiGet<Service[]>(`/services/${category}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Get service category by ID
   */
  getCategoryById: async (id: string): Promise<ServiceCategory | null> => {
    try {
      const response = await apiGet<ServiceCategory>(`/services/categories/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get service category by slug
   */
  getCategoryBySlug: async (slug: string): Promise<ServiceCategory | null> => {
    try {
      const response = await apiGet<ServiceCategory[]>('/services/categories');
      const categories = response.data || [];
      const category = categories.find((cat: any) => cat.slug === slug || cat.id === slug);
      return category || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get service by category and slug (for simple categories)
   */
  getByCategoryAndSlug: async (category: string, slug: string): Promise<Service | null> => {
    try {
      const response = await apiGet<Service>(`/services/${category}/${slug}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get service by category, subcategory and slug (for complex categories)
   */
  getByCategorySubcategoryAndSlug: async (category: string, subcategory: string, slug: string): Promise<Service | null> => {
    try {
      const response = await apiGet<Service>(`/services/${category}/${subcategory}/${slug}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Create service category (Admin only)
   */
  createCategory: async (data: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const response = await apiPost<ServiceCategory>('/services/categories', data);
    return response.data;
  },

  /**
   * Create service (Admin only)
   */
  create: async (data: CreateServiceDto): Promise<Service> => {
    const response = await apiPost<Service>('/services', data);
    return response.data;
  },

  /**
   * Update service (Admin only)
   */
  update: async (id: string, data: UpdateServiceDto): Promise<Service> => {
    const response = await apiPut<Service>(`/services/${id}`, data);
    return response.data;
  },

  /**
   * Delete service (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiDelete(`/services/${id}`);
  },
};

