import { apiGet, apiPost, apiPut, apiDelete } from '../axios';
import { TeamMember, CreateTeamMemberDto, UpdateTeamMemberDto } from '../types';

/**
 * Team API Service
 */
export const teamService = {
  /**
   * Get all team members
   */
  getAll: async (): Promise<TeamMember[]> => {
    const response = await apiGet<TeamMember[]>('/team');
    return response.data || [];
  },

  /**
   * Get team member by ID
   */
  getById: async (id: string): Promise<TeamMember | null> => {
    try {
      const response = await apiGet<TeamMember>(`/team/${id}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Create team member (Admin only)
   */
  create: async (data: CreateTeamMemberDto): Promise<TeamMember> => {
    const response = await apiPost<TeamMember>('/team', data);
    return response.data;
  },

  /**
   * Update team member (Admin only)
   */
  update: async (id: string, data: UpdateTeamMemberDto): Promise<TeamMember> => {
    const response = await apiPut<TeamMember>(`/team/${id}`, data);
    return response.data;
  },

  /**
   * Delete team member (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiDelete(`/team/${id}`);
  },
};

