import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from '@/app/components/fv/IconTile';

/**
 * Presentational pieces shared by the five calculator result columns (theme rule 2/4:
 * fv tokens only; fv-blue only on ≥22px bold values). No calculation logic here.
 */
type Tone = 'navy' | 'blue' | 'green';

const VALUE_TONES: Record<Tone, string> = {
  navy: 'text-fv-navy',
  blue: 'text-fv-blue',
  green: 'text-fv-green-d',
};

/** Label + big value (summary grids). `lg` = the calculator's headline figure. */
export function ResultStat({
  label,
  tone = 'navy',
  size = 'md',
  children,
}: {
  label: string;
  tone?: Tone;
  size?: 'md' | 'lg';
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-sm text-fv-slate">{label}</p>
      <p
        className={clsx(
          'break-words font-extrabold tracking-tight',
          size === 'lg' ? 'text-[26px] leading-tight sm:text-3xl' : 'text-[22px] leading-tight sm:text-2xl',
          VALUE_TONES[tone],
        )}
      >
        {children}
      </p>
    </div>
  );
}

/** Grid wrapper for ResultStat items. */
export function ResultStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6">{children}</div>;
}

/** Soft line item: label left, amount right. */
export function ResultRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] bg-fv-wash px-4 py-3">
      <span className="text-fv-slate">{label}</span>
      <span className="font-semibold text-fv-navy">{children}</span>
    </div>
  );
}

/** Highlighted total line (blue = amount due / total, green = exemption / saving). */
export function ResultTotal({
  label,
  tone = 'blue',
  className,
  children,
}: {
  label: string;
  tone?: 'blue' | 'green';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-3 rounded-[12px] border px-4 py-4',
        tone === 'green' ? 'border-fv-green/30 bg-fv-green-50' : 'border-fv-blue/25 bg-fv-blue-50',
        className,
      )}
    >
      <span className="min-w-0 text-base font-bold text-fv-navy md:text-lg">{label}</span>
      <span
        className={clsx(
          'flex-none text-[22px] font-extrabold tracking-tight sm:text-2xl',
          tone === 'green' ? 'text-fv-green-d' : 'text-fv-blue-d',
        )}
      >
        {children}
      </span>
    </div>
  );
}

/** Placeholder shown in the result column before the first calculation. */
export function ResultEmpty({ icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <>
      <IconTile icon={icon} size="lg" className="mb-4" />
      <p className="mx-auto max-w-[380px] text-fv-slate">{children}</p>
    </>
  );
}
