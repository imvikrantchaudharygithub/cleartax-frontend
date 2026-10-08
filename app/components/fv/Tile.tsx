import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from './IconTile';
import IconTileByName from './IconTileByName';
import { fvColorVars, type FvColor } from '@/app/lib/fv/colors';

interface TileProps {
  title: string;
  text?: string;
  href?: string;
  external?: boolean;
  iconName?: string;
  icon?: LucideIcon;
  color?: FvColor;
  meta?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export default function Tile({ title, text, href, external, iconName, icon, color = 'blue', meta, className, ariaLabel }: TileProps) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const body = (
    <>
      {icon ? <IconTile icon={icon} color={color} /> : <IconTileByName name={iconName} color={color} />}
      <h3 className="mt-4 block text-base font-bold leading-snug text-fv-navy">{title}</h3>
      {text && <span className="mt-1.5 block text-sm leading-relaxed text-fv-slate line-clamp-3">{text}</span>}
      {meta && <span className="mt-auto block pr-10 pt-4 text-[13px] text-fv-slate">{meta}</span>}
      {href && (
        <span
          aria-hidden="true"
          style={fvColorVars(color) as CSSProperties}
          className="absolute bottom-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-[var(--cb)] text-[var(--c)] transition-transform motion-safe:group-hover:translate-x-0.5"
        >
          <Arrow className="h-4 w-4" />
        </span>
      )}
    </>
  );
  const cls = clsx(
    'group fv-card relative flex h-full flex-col p-5 transition duration-200',
    href && 'min-h-[150px] hover:border-[#CFE2F2] hover:shadow-fv-raised motion-safe:hover:-translate-y-0.5',
    href && !meta && 'pb-14',
    className,
  );
  if (!href) return <div className={cls}>{body}</div>;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={cls}>
      {body}
    </Link>
  );
}
