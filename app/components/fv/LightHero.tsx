import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';
import { clsx } from 'clsx';
import Breadcrumb from '@/app/components/common/Breadcrumb';
import IconTile from './IconTile';
import type { FvColor } from '@/app/lib/fv/colors';

export interface LightHeroProps {
  title: string;
  /** Optional second line, rendered in brand blue. */
  titleLine2?: string;
  subtitle?: string;
  badge?: string;
  breadcrumb?: { label: string; href?: string }[];
  /** Static icon only — the hero is imported by client pages, so it never resolves DB names. */
  icon?: LucideIcon;
  iconColor?: FvColor;
  align?: 'left' | 'center';
  /** Right-hand column (stats, price card…). Forces left alignment. */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const LIGHT_HERO_BG =
  'bg-[radial-gradient(720px_340px_at_85%_0%,#DCEFFA,transparent_70%),linear-gradient(180deg,#F3F9FD,#ffffff)]';

export default function LightHero({
  title,
  titleLine2,
  subtitle,
  badge,
  breadcrumb,
  icon,
  iconColor = 'blue',
  align = 'center',
  aside,
  children,
  className,
}: LightHeroProps) {
  const centered = align === 'center' && !aside;
  return (
    <section className={clsx('relative overflow-hidden border-b border-fv-line', LIGHT_HERO_BG, className)}>
      <div className={clsx('fv-wrap py-12 md:py-16', aside && 'grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]')}>
        <div className={clsx('min-w-0', centered && 'mx-auto max-w-[780px] text-center')}>
          {breadcrumb && <Breadcrumb items={breadcrumb} className={clsx('mb-6', centered && '[&>ol]:justify-center')} />}
          {icon && <IconTile icon={icon} color={iconColor} size="lg" solid className="mb-5" />}
          {badge && (
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#CFE2F2] bg-white px-3 py-1.5 text-[13px] font-semibold text-fv-blue-d">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {badge}
            </span>
          )}
          <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] text-fv-navy md:text-[48px]">
            {title}
            {titleLine2 && (
              <>
                <br />
                <span className="text-fv-blue">{titleLine2}</span>
              </>
            )}
          </h1>
          {subtitle && (
            <p className={clsx('mt-4 max-w-[640px] text-base leading-relaxed text-fv-slate md:text-lg', centered && 'mx-auto')}>
              {subtitle}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </section>
  );
}
