'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Linkedin } from 'lucide-react';
import Card from '../ui/Card';
import type { TeamMember } from '@/app/lib/api/types';
import { clsx } from 'clsx';

type TeamCardProps = {
  member: TeamMember;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamCard({ member, className }: TeamCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/team/${member.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className={clsx(
        'flex h-full flex-col gap-4 text-center motion-reduce:transition-none',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="grid h-20 w-20 flex-none place-items-center overflow-hidden rounded-full bg-gradient-to-br from-fv-blue to-fv-blue-d text-xl font-bold text-white ring-4 ring-fv-blue-50">
          {member.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatar}
              alt={member.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitials(member.name)
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-bold leading-snug tracking-tight text-fv-navy">
            {member.name}
          </h2>
          <span className="inline-flex rounded-full bg-fv-blue-50 px-3 py-1 text-[13px] font-semibold text-fv-blue-d">
            {member.role}
          </span>
        </div>
      </div>

      {/* Bio excerpt — justified (owner preference for team bios). */}
      <p className="min-h-[4.25rem] text-justify text-sm leading-relaxed text-fv-slate line-clamp-3">
        {member.description}
      </p>

      <div className="mt-auto flex items-center justify-center gap-3 border-t border-fv-line pt-4">
        <Link
          href={member.linkedin}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-fv-blue-d transition-colors hover:text-fv-blue-dd"
        >
          <Linkedin className="h-4 w-4" aria-hidden="true" />
          LinkedIn
        </Link>
        <span className="text-fv-muted" aria-hidden="true">•</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-fv-navy transition-colors hover:text-fv-blue-d"
        >
          View profile
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </Card>
  );
}
