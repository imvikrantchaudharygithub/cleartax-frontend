import Link from 'next/link';
import IntentLink from './IntentLink';
import { isIntentOnlyHref } from '@/app/lib/fv/intent';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface SectionHeadProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  action?: { label: string; href: string };
  id?: string;
  className?: string;
}

export default function SectionHead({ title, subtitle, align = 'left', action, id, className }: SectionHeadProps) {
  const centered = align === 'center';
  // /services* pulls a heavy icon chunk: prefetch on intent only.
  const ActionLink = action && isIntentOnlyHref(action.href) ? IntentLink : Link;
  return (
    <div
      className={clsx(
        'mb-10 md:mb-12',
        centered ? 'mx-auto max-w-[720px] text-center' : 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={centered ? undefined : 'max-w-[680px]'}>
        <h2 id={id} className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-fv-navy md:text-[36px]">
          {title}
        </h2>
        {subtitle && <p className="mt-3 text-base leading-relaxed text-fv-slate md:text-[17px]">{subtitle}</p>}
      </div>
      {action && (
        <ActionLink
          href={action.href}
          className={clsx(
            'inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold text-fv-blue-d hover:text-fv-blue-dd',
            centered && 'mt-5',
          )}
        >
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ActionLink>
      )}
    </div>
  );
}
