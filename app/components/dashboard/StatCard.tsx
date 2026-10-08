'use client';

import CounterAnimation from '../animations/CounterAnimation';
import { LucideIcon } from 'lucide-react';
import IconTile from '../fv/IconTile';
import type { FvColor } from '@/app/lib/fv/colors';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

// Variant → category colour of the icon tile (theme rule 6).
const VARIANT_COLOR: Record<NonNullable<StatCardProps['variant']>, FvColor> = {
  success: 'green',
  warning: 'yellow',
  error: 'red',
  info: 'blue',
};

export default function StatCard({ icon: Icon, value, label, variant = 'info' }: StatCardProps) {
  return (
    <div className="fv-card flex min-w-0 items-center gap-4 p-5">
      <IconTile icon={Icon} color={VARIANT_COLOR[variant]} size="lg" />
      <div className="min-w-0">
        <div className="text-[28px] font-extrabold leading-tight tracking-tight text-fv-navy tabular-nums">
          <CounterAnimation end={value} format="number" />
        </div>
        <p className="text-sm font-medium text-fv-slate">{label}</p>
      </div>
    </div>
  );
}
