'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Plus, Loader2, X, User, Briefcase, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService } from '@/app/lib/api';
import { TeamMember, CreateTeamMemberDto } from '@/app/lib/api/types';
import { API_CONFIG } from '@/app/lib/api/config';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import TextArea from '@/app/components/ui/TextArea';

export default function AdminTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTeamMemberDto>({
    id: '',
    name: '',
    role: '',
    description: '',
    linkedin: '',
    avatar: '',
    accent: '#00A3E0',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const members = await teamService.getAll();
      setTeamMembers(members);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members. Please try again.');
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return teamMembers;
    }
    const query = searchQuery.toLowerCase();
    return teamMembers.filter(
      (member) =>
        member.name?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query) ||
        member.description?.toLowerCase().includes(query)
    );
  }, [teamMembers, searchQuery]);

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      await teamService.delete(memberId);
      setTeamMembers(teamMembers.filter((m) => m._id !== memberId));
      toast.success('Team member deleted successfully!');
    } catch (err) {
      console.error('Error deleting team member:', err);
      toast.error('Failed to delete team member. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.name || !formData.role || !formData.description || !formData.linkedin) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      if (avatarFile) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('id', formData.id);
        formDataToSend.append('name', formData.name);
        formDataToSend.append('role', formData.role);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('linkedin', formData.linkedin);
        if (formData.accent) {
          formDataToSend.append('accent', formData.accent);
        }
        formDataToSend.append('file', avatarFile);

        // Use fetch directly for FormData
        const response = await fetch(`${API_CONFIG.BASE_URL}/team`, {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create team member');
        }

        const data = await response.json();
        if (data.success) {
          toast.success('Team member created successfully!');
          setIsAddModalOpen(false);
          resetForm();
          fetchTeamMembers();
        }
      } else if (formData.avatar) {
        // Use JSON with avatar URL
        await teamService.create(formData);
        toast.success('Team member created successfully!');
        setIsAddModalOpen(false);
        resetForm();
        fetchTeamMembers();
      } else {
        toast.error('Please provide either an avatar URL or upload an image');
        return;
      }
    } catch (err: any) {
      console.error('Error creating team member:', err);
      toast.error(err.message || 'Failed to create team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      role: '',
      description: '',
      linkedin: '',
      avatar: '',
      accent: '#00A3E0',
    });
    setAvatarFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setFormData({ ...formData, avatar: '' }); // Clear URL if file is selected
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-gray-400">Manage your team members</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, role, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member._id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{
                      backgroundColor: member.accent || '#00A3E0',
                    }}
                  >
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      member.name?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {member.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(member._id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-300 mb-4 line-clamp-3">{member.description}</p>

              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  LinkedIn Profile
                </a>
              )}

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  ID: <span className="font-mono">{member.id}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">No team members found</p>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Add Team Member</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    ID (unique, lowercase) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                    }
                    placeholder="e.g., john-doe"
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Accent Color
                  </label>
                  <Input
                    type="color"
                    value={formData.accent}
                    onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                    className="h-10 bg-gray-900 border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Role <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., CEO, CTO"
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Team member description"
                  rows={4}
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  LinkedIn URL <span className="text-red-400">*</span>
                </label>
                <Input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Avatar URL (or upload file below)
                </label>
                <Input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => {
                    setFormData({ ...formData, avatar: e.target.value });
                    setAvatarFile(null);
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={!!avatarFile}
                  className="bg-gray-900 border-gray-700 text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Or Upload Avatar Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!!formData.avatar}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
                />
                {avatarFile && (
                  <p className="mt-2 text-sm text-gray-400">Selected: {avatarFile.name}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Team Member'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

