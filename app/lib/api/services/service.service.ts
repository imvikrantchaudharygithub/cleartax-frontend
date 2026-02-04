import { apiGet, apiPost, apiPut, apiDelete, apiRequest } from '../axios';
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
      // Backend returns { success, data: Service[], category?, subcategories? }; ensure we return the array
      const raw = response?.data;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
      return [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Get category with subcategories and itemsCount (single source of truth for home page counts).
   * Call GET /services/:categoryType (e.g. ipo) once; backend returns subcategories with itemsCount.
   */
  getCategoryWithSubcategories: async (categoryType: string): Promise<{
    category: any;
    subcategories: Array<{ _id: string; slug: string; title: string; shortDescription?: string; iconName?: string; itemsCount: number }>;
  } | null> => {
    try {
      const response = await apiGet<any>(`/services/${categoryType}`) as { category?: any; subcategories?: any[] };
      const subcategories = response?.subcategories;
      if (response?.category && Array.isArray(subcategories) && subcategories.length > 0) {
        return {
          category: response.category,
          subcategories: subcategories.map((sub: any) => ({
            _id: sub._id || sub.id,
            slug: sub.slug,
            title: sub.title,
            shortDescription: sub.shortDescription ?? sub.description,
            iconName: sub.iconName,
            itemsCount: typeof sub.itemsCount === 'number' ? sub.itemsCount : 0,
          })),
        };
      }
      return null;
    } catch (error) {
      return null;
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

  /**
   * Draft: Create service draft
   */
  createDraft: async (data: Partial<CreateServiceDto>): Promise<Service> => {
    const response = await apiRequest<Service>({
      method: 'POST',
      url: '/services/draft',
      data,
    });
    return response.data;
  },

  /**
   * Draft: Update service draft
   */
  updateDraft: async (id: string, data: Partial<CreateServiceDto>): Promise<Service> => {
    const response = await apiPut<Service>(`/services/draft/${id}`, data);
    return response.data;
  },

  /**
   * Draft: Get service draft by ID
   */
  getDraftById: async (id: string): Promise<Service | null> => {
    try {
      const response = await apiGet<Service>(`/services/draft/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Draft: List drafts (optional category filter)
   */
  getDrafts: async (params?: { category?: string }): Promise<Service[]> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    const queryString = queryParams.toString();
    const endpoint = `/services/drafts${queryString ? `?${queryString}` : ''}`;
    try {
      const response = await apiGet<Service[]>(endpoint);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Draft: Publish a draft
   */
  publishDraft: async (id: string): Promise<Service> => {
    const response = await apiPost<Service>(`/services/publish/${id}`);
    return response.data;
  },

  /**
   * Draft: Delete a draft
   */
  deleteDraft: async (id: string): Promise<void> => {
    await apiDelete(`/services/draft/${id}`);
  },
};

