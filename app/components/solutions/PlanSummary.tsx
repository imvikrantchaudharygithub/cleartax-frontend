'use client';

import { useState, type MouseEvent } from 'react';
import { ChevronUp, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import Button from '@/app/components/fv/Button';
import { formatFromPrice, formatINR, plural } from '@/app/lib/fv/text';
import type { SolutionServiceItem } from '@/app/lib/api/types';

interface PlanSummaryProps {
  items: SolutionServiceItem[];
  total: number;
  onRequest: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * `card`: the sticky right-hand column from lg up (design 3 `.plan`).
   * `bar`: the sticky bottom bar below lg (`.mplan`) that expands into the list. The planner
   * renders it AFTER its grid, inside a wrapper that ends with the planner: a sticky element only
   * moves inside its parent, so the bar rides the viewport bottom while the steps scroll and
   * settles in place above the footer at the end (it never covers it).
   */
  variant: 'card' | 'bar';
}

export default function PlanSummary({ items, total, onRequest, variant }: PlanSummaryProps) {
  const [open, setOpen] = useState(false);
  const empty = items.length === 0;
  // `expanded` (below) is derived, but `open` must also be forgotten once the plan empties:
  // otherwise the next tick pops the list straight back open. Render-time reset (React's
  // "adjusting state when a prop changes" pattern), conditional so it settles in one pass.
  if (empty && open) setOpen(false);
  const totalText = `${formatINR(total)}${empty ? '' : '+'}`;
  const countText = empty ? 'Nothing selected yet' : `${plural(items.length, 'service')} · starting prices`;
  const list = (
    <ul className="max-h-[40vh] space-y-2.5 overflow-y-auto">
      {items.map((item) => (
        <li key={item.id} className="flex justify-between gap-3 text-sm">
          <span className="min-w-0 text-fv-navy">{item.title}</span>
          <b className="whitespace-nowrap text-fv-navy">{formatFromPrice(item.price) ?? '—'}</b>
        </li>
      ))}
    </ul>
  );

  if (variant === 'card') {
    return (
      <aside aria-label="Your plan" className="hidden lg:sticky lg:top-[140px] lg:block">
        <div className="overflow-hidden rounded-[16px] border border-fv-line bg-white shadow-fv-raised">
          <div className="bg-fv-navy px-5 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">Your plan</p>
            <p className="mt-1 text-3xl font-extrabold" aria-live="polite">
              {totalText}
            </p>
            <p className="text-sm text-white/70">{countText}</p>
          </div>
          <div className="space-y-4 p-5">
            {empty ? <p className="text-sm text-fv-slate">Tick the services you need. Your plan adds up here.</p> : list}
            <Button size="lg" className="w-full" disabled={empty} onClick={onRequest}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Request Callback
            </Button>
            <p className="text-center text-xs text-fv-slate">Starting prices; final quote after a quick call.</p>
          </div>
        </div>
      </aside>
    );
  }

  const expanded = open && !empty;
  return (
    <div
      role="region"
      aria-label="Your plan"
      className="sticky bottom-0 z-40 border-t border-fv-line bg-white shadow-[0_-8px_30px_rgba(30,44,89,.12)] lg:hidden"
    >
      <div className="fv-wrap">
        <div id="plan-sheet" hidden={!expanded} className="border-b border-fv-line py-4">
          {list}
        </div>
        <div className="flex items-center gap-3 py-3">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="plan-sheet"
            disabled={empty}
            onClick={() => setOpen((value) => !value)}
            className="min-w-0 flex-1 rounded-lg text-left disabled:cursor-default"
          >
            <span className="flex items-center gap-1 text-xl font-extrabold text-fv-navy" aria-live="polite">
              {totalText}
              {!empty && (
                <ChevronUp
                  aria-hidden="true"
                  // Points up (the list opens upwards) until expanded.
                  className={clsx('h-4 w-4 text-fv-slate motion-safe:transition-transform', expanded && 'rotate-180')}
                />
              )}
            </span>
            <span className="block text-xs text-fv-slate">
              {countText}
              {!empty && <span className="sr-only">. {expanded ? 'Hide' : 'Show'} the list</span>}
            </span>
          </button>
          <Button disabled={empty} onClick={onRequest} className="flex-none">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>
              <span className="hidden min-[375px]:inline">Request </span>Callback
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
