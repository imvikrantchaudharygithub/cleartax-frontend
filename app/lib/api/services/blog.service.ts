import { apiGet, apiPost, apiPut, apiDelete } from '../axios';
import { BlogPost, CreateBlogDto, UpdateBlogDto, PaginatedResponse } from '../types';

export interface BlogListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Blog API Service
 */
export const blogService = {
  /**
   * Get all blogs with pagination and filters
   */
  getAll: async (params?: BlogListParams): Promise<PaginatedResponse<BlogPost>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = `/blog${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<BlogPost[]>(endpoint);
    return response as PaginatedResponse<BlogPost>;
  },

  /**
   * Get featured blog
   */
  getFeatured: async (): Promise<BlogPost | null> => {
    try {
      const response = await apiGet<BlogPost>('/blog/featured');
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get recent blogs
   */
  getRecent: async (limit: number = 6): Promise<BlogPost[]> => {
    try {
      const response = await apiGet<BlogPost[]>(`/blog/recent?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Get blog by slug
   */
  getBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      const response = await apiGet<BlogPost>(`/blog/${slug}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get related blogs
   */
  getRelated: async (slug: string, limit: number = 3): Promise<BlogPost[]> => {
    try {
      const response = await apiGet<BlogPost[]>(`/blog/${slug}/related?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  /**
   * Create blog (Admin only)
   */
  create: async (data: CreateBlogDto): Promise<BlogPost> => {
    const response = await apiPost<BlogPost>('/blog', data);
    return response.data;
  },

  /**
   * Update blog (Admin only)
   */
  update: async (id: string, data: UpdateBlogDto): Promise<BlogPost> => {
    const response = await apiPut<BlogPost>(`/blog/${id}`, data);
    return response.data;
  },

  /**
   * Delete blog (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiDelete(`/blog/${id}`);
  },
};

