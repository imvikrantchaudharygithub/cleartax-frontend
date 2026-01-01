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
  const accent = member.accent ?? 'from-sky-500 to-indigo-500';

  const handleCardClick = () => {
    router.push(`/team/${member.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className={clsx(
        'h-full flex flex-col gap-4 border border-gray-100 bg-white/90 backdrop-blur text-center',
        'hover:shadow-lg transition-shadow duration-200',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={clsx(
            'w-20 h-20 rounded-full bg-gradient-to-br text-white font-semibold text-xl',
            'flex items-center justify-center shadow-md ring-4 ring-white',
            accent
          )}
        >
          {member.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(member.name)
          )}
        </div>
        <div>
          <p className="font-heading font-semibold text-xl text-gray-900">
            {member.name}
          </p>
          <p className="text-sm text-primary font-medium">{member.role}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {member.description}
      </p>

      <div className="flex items-center justify-center gap-3 pt-2 mt-auto">
        <Link
          href={member.linkedin}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </Link>
        <span className="text-gray-300">•</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
        >
          View profile
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

