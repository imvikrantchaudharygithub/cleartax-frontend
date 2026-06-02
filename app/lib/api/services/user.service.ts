import { apiGet, apiPost } from '../axios';

export interface AdminUserRecord {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: 'admin' | 'user';
  search?: string;
}

/**
 * Users API service (admin only).
 * The shared axios instance attaches the admin JWT from the `admin_token_access`
 * cookie, so these calls reach the admin-guarded backend `/users` routes.
 */
export const userService = {
  getAll: async (params?: UserListParams): Promise<AdminUserRecord[]> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString();
    const response = await apiGet<AdminUserRecord[]>(`/users${qs ? `?${qs}` : ''}`);
    return response.data;
  },

  create: async (payload: CreateUserPayload): Promise<AdminUserRecord> => {
    const response = await apiPost<AdminUserRecord>('/users', payload);
    return response.data;
  },
};
