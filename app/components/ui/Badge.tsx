'use client';

import type { CSSProperties } from 'react';
import { clsx } from 'clsx';
import { fvColorVars } from '@/app/lib/fv/colors';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

// Public-only (admin does not import it) — themed in place: fv tokens, category colours for
// warning (yellow) / error (red) with the text darkened so 12px labels stay ≥4.5:1.
const TINTED =
  'border-[color-mix(in_srgb,var(--c)_30%,transparent)] bg-[var(--cb)] text-[color-mix(in_srgb,var(--c)_55%,#000)]';

const variantStyles = {
  success: 'border-fv-green/30 bg-fv-green-50 text-fv-green-d',
  warning: TINTED,
  error: TINTED,
  info: 'border-fv-blue/20 bg-fv-blue-50 text-fv-blue-d',
  default: 'border-fv-line bg-fv-wash text-fv-slate',
};

const variantVars: Partial<Record<keyof typeof variantStyles, CSSProperties>> = {
  warning: fvColorVars('yellow') as CSSProperties,
  error: fvColorVars('red') as CSSProperties,
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      style={variantVars[variant]}
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
