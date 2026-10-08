import { apiDelete, apiGet, apiPut, apiRequest } from '../axios';
import type { SolutionAdminDetail, SolutionAdminRow, SolutionInput } from '../types';

/** Admin API for solutions (JWT added by the axios interceptor). Public reads live in lib/solutions/publicApi.ts. */
export const solutionService = {
  listAdmin: async (): Promise<SolutionAdminRow[]> => (await apiGet<SolutionAdminRow[]>('/solutions/admin/all')).data ?? [],

  getAdmin: async (id: string): Promise<SolutionAdminDetail> => (await apiGet<SolutionAdminDetail>(`/solutions/admin/${id}`)).data,

  // apiRequest, not apiPost: apiPost toasts every error, but the editor maps field errors inline.
  create: async (input: SolutionInput): Promise<SolutionAdminDetail> =>
    (await apiRequest<SolutionAdminDetail>({ method: 'POST', url: '/solutions/admin', data: input })).data,

  update: async (id: string, patch: Partial<SolutionInput>): Promise<SolutionAdminDetail> =>
    (await apiPut<SolutionAdminDetail>(`/solutions/admin/${id}`, patch)).data,

  remove: async (id: string): Promise<void> => {
    await apiDelete(`/solutions/admin/${id}`);
  },

  reorder: async (ids: string[]): Promise<SolutionAdminRow[]> =>
    (await apiPut<SolutionAdminRow[]>('/solutions/admin/reorder', { ids })).data ?? [],
};
