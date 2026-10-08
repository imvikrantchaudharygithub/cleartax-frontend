'use client';

import { useState, useEffect, useMemo } from 'react';
import TeamCard from '@/app/components/team/TeamCard';
import { teamService } from '@/app/lib/api';
import { TeamMember } from '@/app/lib/api/types';
import { Loader2 } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import Section from '@/app/components/fv/Section';
import Select from '@/app/components/fv/Select';

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
      <div className="min-h-screen bg-white py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fv-blue" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="The people building FinVidhi"
        subtitle="A multidisciplinary team of engineers, designers, and domain experts focused on making taxes and compliance seamless."
      />
      <Section soft>

        {/* Category (role) filter — client-side */}
        {teamMembers.length > 0 && roleOptions.length > 2 && (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <label htmlFor="team-category" className="text-sm font-semibold text-fv-navy">
              Filter by category
            </label>
            <div className="w-full max-w-[260px]">
              <Select
                id="team-category"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                options={roleOptions.map((role) => ({ value: role, label: role }))}
                className="py-2.5"
              />
            </div>
          </div>
        )}

        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-fv-slate">No team members found.</p>
          </div>
        ) : visibleMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMembers.map((member) => (
              <TeamCard key={member._id} member={member} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-fv-slate">No team members in “{selectedRole}”.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[15px] text-fv-slate">
            Want to build with us?{' '}
            <a
              href="/contact"
              className="font-semibold text-fv-blue-d transition-colors hover:text-fv-blue-dd hover:underline underline-offset-4"
            >
              Get in touch
            </a>
          </p>
        </div>
      </Section>
    </div>
  );
}
