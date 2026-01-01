'use client';

import { useState, useEffect } from 'react';
import TeamCard from '@/app/components/team/TeamCard';
import { teamService } from '@/app/lib/api';
import { TeamMember } from '@/app/lib/api/types';
import { Loader2 } from 'lucide-react';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

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
            The people building ClearTax
          </h1>
          <p className="text-lg text-gray-600">
            A multidisciplinary team of engineers, designers, and domain experts
            focused on making taxes and compliance seamless.
          </p>
        </div>

        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member) => (
              <TeamCard key={member._id} member={member} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No team members found.</p>
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

