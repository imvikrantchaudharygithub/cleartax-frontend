'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Linkedin, Loader2 } from 'lucide-react';
import { teamService } from '@/app/lib/api';
import { TeamMember } from '@/app/lib/api/types';

type TeamMemberPageProps = {
  params: Promise<{ id: string }>;
};

export default function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { id } = use(params);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const memberData = await teamService.getById(id);
        if (!memberData) {
          notFound();
        }
        setMember(memberData);
      } catch (error) {
        console.error('Error fetching team member:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to team
          </Link>
          <Link
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8 md:p-10 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8 md:items-center">
            <div className="flex-shrink-0">
              <div
                className={`w-28 h-28 rounded-full bg-gradient-to-br ${member.accent ?? 'from-sky-500 to-indigo-500'} text-white font-semibold text-2xl flex items-center justify-center shadow-md ring-8 ring-white`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  member.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Team member
              </p>
              <h1 className="font-heading font-bold text-3xl md:text-4xl text-gray-900">
                {member.name}
              </h1>
              <p className="text-lg text-gray-700 font-medium">{member.role}</p>
              <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
                {member.description}
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
              <h2 className="font-heading font-semibold text-lg text-gray-900 mb-3">
                What they focus on
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Driving product quality, customer trust, and execution velocity across squads.
                Partnering with design, engineering, and success to ship delightful, compliant experiences.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
              <h2 className="font-heading font-semibold text-lg text-gray-900 mb-3">
                Connect
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Want to collaborate or have questions about their work? Reach out below.
              </p>
              <Link
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

