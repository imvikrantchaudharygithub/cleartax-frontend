import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { fvColorVars, type FvColor } from '@/app/lib/fv/colors';

// Static icons only. DB/admin icon NAMES go through IconTileByName, which owns the resolver
// (it imports the whole lucide namespace, so it must stay out of shared client code).

const SIZES = {
  sm: 'h-[34px] w-[34px] rounded-[9px] [&>svg]:h-4 [&>svg]:w-4',
  md: 'h-[46px] w-[46px] rounded-[11px] [&>svg]:h-[22px] [&>svg]:w-[22px]',
  lg: 'h-14 w-14 rounded-[14px] [&>svg]:h-[26px] [&>svg]:w-[26px]',
  xl: 'h-[72px] w-[72px] rounded-[20px] [&>svg]:h-[34px] [&>svg]:w-[34px]',
} as const;

export interface IconTileFrameProps {
  color?: FvColor;
  size?: keyof typeof SIZES;
  /** Gradient tile with a white icon (solution rail, heroes). */
  solid?: boolean;
  className?: string;
}

/** The tinted tile around an already-rendered icon element (e.g. one resolved on the server). */
export function IconTileFrame({
  color = 'blue',
  size = 'md',
  solid = false,
  className,
  children,
}: IconTileFrameProps & { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      style={fvColorVars(color) as CSSProperties}
      className={clsx(
        'inline-grid flex-none place-items-center',
        SIZES[size],
        solid
          ? 'bg-[linear-gradient(150deg,color-mix(in_srgb,var(--c)_68%,white),var(--c))] text-white shadow-[0_10px_22px_-10px_var(--c)]'
          : 'bg-[var(--cb)] text-[var(--c)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface IconTileProps extends IconTileFrameProps {
  /** Static lucide icon component. Falls back to FileText, like the name resolver. */
  icon?: LucideIcon;
}

export default function IconTile({ icon: Icon = FileText, ...frame }: IconTileProps) {
  return (
    <IconTileFrame {...frame}>
      <Icon strokeWidth={1.9} />
    </IconTileFrame>
  );
}
