'use client';

import { useState, useEffect, useMemo } from 'react';
import TeamCard from '@/app/components/team/TeamCard';
import { teamService } from '@/app/lib/api';
import { TeamMember } from '@/app/lib/api/types';
import { Loader2 } from 'lucide-react';

const ALL_CATEGORIES = 'All categories';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>(ALL_CATEGORIES);

  // Distinct roles present, used to populate the client-side filter dropdown.
  const roleOptions = useMemo(() => {
    const roles = Array.from(
      new Set(teamMembers.map((m) => m.role?.trim()).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b));
    return [ALL_CATEGORIES, ...roles];
  }, [teamMembers]);

  // Members after applying the selected category (role). Order is preserved from
  // the server (displayOrder), so filtering doesn't disturb the chosen order.
  const visibleMembers = useMemo(() => {
    if (selectedRole === ALL_CATEGORIES) return teamMembers;
    return teamMembers.filter((m) => m.role === selectedRole);
  }, [teamMembers, selectedRole]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const members = await teamService.getAll();
        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
            Our Team
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            The people building FinVidhi
          </h1>
          <p className="text-lg text-gray-600">
            A multidisciplinary team of engineers, designers, and domain experts
            focused on making taxes and compliance seamless.
          </p>
        </div>

        {/* Category (role) filter — client-side */}
        {teamMembers.length > 0 && roleOptions.length > 2 && (
          <div className="mb-10 flex items-center justify-center gap-3">
            <label htmlFor="team-category" className="text-sm font-medium text-gray-600">
              Filter by category
            </label>
            <select
              id="team-category"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        )}

        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No team members found.</p>
          </div>
        ) : visibleMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {visibleMembers.map((member) => (
              <TeamCard key={member._id} member={member} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No team members in “{selectedRole}”.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Want to build with us?{' '}
            <a
              href="/contact"
              className="text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

