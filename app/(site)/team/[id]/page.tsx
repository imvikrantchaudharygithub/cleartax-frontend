'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Handshake, Linkedin, Loader2, Target } from 'lucide-react';
import IconTile from '@/app/components/fv/IconTile';
import { LIGHT_HERO_BG } from '@/app/components/fv/LightHero';
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
      <div className="min-h-screen bg-white py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fv-blue" aria-hidden="true" />
      </div>
    );
  }

  if (!member) {
    notFound();
  }

  const smallLink =
    'inline-flex items-center gap-2 text-sm font-semibold text-fv-blue-d transition-colors hover:text-fv-blue-dd';

  return (
    <div className={`min-h-screen py-14 md:py-[88px] ${LIGHT_HERO_BG}`}>
      <div className="fv-wrap max-w-[1024px]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/team" className={smallLink}>
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to team
          </Link>
          <Link
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            className={smallLink}
          >
            <Linkedin className="w-4 h-4" aria-hidden="true" />
            LinkedIn
          </Link>
        </div>

        <div className="fv-card p-6 sm:p-8 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex-shrink-0">
              <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-fv-blue to-fv-blue-d text-2xl font-bold text-white ring-8 ring-fv-blue-50">
                {member.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
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

            <div className="min-w-0 space-y-3">
              <p className="text-sm font-semibold tracking-wide text-fv-blue-d">
                Team member
              </p>
              <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-fv-navy md:text-[40px]">
                {member.name}
              </h1>
              <p className="inline-flex rounded-full bg-fv-blue-50 px-3 py-1 text-[15px] font-semibold text-fv-blue-d">
                {member.role}
              </p>
              <p className="max-w-2xl text-justify text-base leading-relaxed text-fv-slate">
                {member.description}
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {member.focusOn && (
              <div className="rounded-xl border border-fv-line bg-fv-wash p-6">
                <IconTile icon={Target} color="green" size="sm" className="mb-4" />
                <h2 className="mb-2 text-lg font-bold tracking-tight text-fv-navy">
                  What they focus on
                </h2>
                <p className="text-sm leading-relaxed text-fv-slate">
                  {member.focusOn}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-fv-line bg-fv-wash p-6">
              <IconTile icon={Handshake} color="blue" size="sm" className="mb-4" />
              <h2 className="mb-2 text-lg font-bold tracking-tight text-fv-navy">
                Connect
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-fv-slate">
                Want to collaborate or have questions about their work? Reach out below.
              </p>
              <Link
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className={smallLink}
              >
                <Linkedin className="w-4 h-4" aria-hidden="true" />
                LinkedIn Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
