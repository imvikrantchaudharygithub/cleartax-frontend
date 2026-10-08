import Link from 'next/link';
import { useId, type ReactNode } from 'react';
import { Check, Clock, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { formatFromPrice } from '@/app/lib/fv/text';
import type { SolutionServiceItem } from '@/app/lib/api/types';

/**
 * One tickable service in a plan step (design 3 `.pki`). A real checkbox (visually hidden) whose
 * label covers the whole card, so a click anywhere toggles it and Space works when it has focus.
 * The title link sits above the label and still opens the service page.
 * `icon` is the item's IconTileByName, rendered on the server (keeps lucide's namespace out of
 * this client bundle).
 */
export default function PlanServiceCard({
  item,
  icon,
  checked,
  onToggle,
}: {
  item: SolutionServiceItem;
  icon: ReactNode;
  checked: boolean;
  onToggle: () => void;
}) {
  const price = formatFromPrice(item.price);
  // useId, not the service id: a service listed in two steps must not duplicate the input id.
  const inputId = useId();
  return (
    <div
      className={clsx(
        'fv-card relative flex h-full gap-3 p-3.5 transition-colors',
        checked ? 'border-fv-blue-d bg-fv-wash ring-1 ring-fv-blue-d' : 'hover:border-[#CFE2F2]',
      )}
    >
      {item.popular && (
        <span className="absolute -top-2.5 right-3.5 inline-flex items-center gap-1 rounded-full bg-fv-green-50 px-2 py-0.5 text-[11px] font-bold text-fv-green-d ring-2 ring-white">
          <Star className="h-3 w-3 fill-current" aria-hidden="true" />
          Most popular
        </span>
      )}
      {/* scroll margins keep a keyboard-focused card clear of the sticky step bar and plan bar */}
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="peer sr-only scroll-mb-28 scroll-mt-40"
      />
      <label htmlFor={inputId} className="absolute inset-0 cursor-pointer rounded-[14px]">
        <span className="sr-only">Add {item.title} to your plan</span>
      </label>
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none relative mt-1.5 grid h-[22px] w-[22px] flex-none place-items-center rounded-[7px] border-[1.5px] transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-fv-blue-d peer-focus-visible:ring-offset-2',
          checked ? 'border-fv-blue-d bg-fv-blue-d text-white' : 'border-fv-slate/75 bg-white', // 3.5:1 on white (WCAG 1.4.11)
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className="pointer-events-none relative flex-none">{icon}</span>
      <div className="pointer-events-none relative min-w-0 flex-1">
        <h3 className="text-[14.5px] font-bold leading-[1.3] text-fv-navy">
          {/* No viewport prefetch: 22 service links would fetch their routes (and the /services
              icon chunk) in idle time; the service pages load their data client-side anyway. */}
          <Link
            href={item.href}
            prefetch={false}
            className="pointer-events-auto relative z-10 scroll-mb-28 scroll-mt-40 hover:text-fv-blue-d hover:underline"
          >
            {item.title}
          </Link>
        </h3>
        {item.shortDescription && (
          <p className="mt-[3px] line-clamp-2 text-[12.5px] leading-[1.45] text-fv-slate">{item.shortDescription}</p>
        )}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <b className="font-extrabold text-fv-navy">{price ? `${price}+` : 'Price on request'}</b>
          {item.duration && (
            <span className="flex items-center gap-1 text-fv-slate">
              <Clock className="h-3 w-3 flex-none" aria-hidden="true" />
              {item.duration}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
