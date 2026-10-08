import IntentLink from '../fv/IntentLink';
import type { CSSProperties } from 'react';
import { Clock, Star } from 'lucide-react';
import Section from '@/app/components/fv/Section';
import SectionHead from '@/app/components/fv/SectionHead';
import IconTileByName from '@/app/components/fv/IconTileByName';
import { fvColorVars } from '@/app/lib/fv/colors';
import { formatFromPrice } from '@/app/lib/fv/text';
import type { PopularServiceItem } from '@/app/lib/solutions/popular';

// The item shape lives with its pure, unit-tested builder (popularServiceItems).
export type { PopularServiceItem };

/** Home "Most popular services" (design 3 `svcCard` grid). Items come from the Solutions plan. */
export default function PopularServices({ items }: { items: PopularServiceItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section aria-labelledby="popular-services-title">
      <SectionHead
        id="popular-services-title"
        title="Most popular services"
        action={{ label: 'View all services', href: '/services' }}
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const price = formatFromPrice(item.price);
          return (
            <li key={item.id} className="min-w-0">
              <IntentLink
                href={item.href}
                style={fvColorVars(item.color) as CSSProperties}
                className="fv-card relative flex h-full flex-col gap-2.5 p-4 transition-[transform,box-shadow,border-color] duration-200 hover:border-[color-mix(in_srgb,var(--c)_40%,#E6ECF5)] hover:shadow-fv-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5"
              >
                <span className="absolute -top-2.5 right-3.5 inline-flex items-center gap-1 rounded-full bg-fv-green-50 px-2 py-0.5 text-[11px] font-bold text-fv-green-d ring-2 ring-white">
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                  Most popular
                </span>
                <span className="flex items-center gap-3">
                  <IconTileByName name={item.iconName} color={item.color} size="sm" />
                  <span className="line-clamp-2 text-[15px] font-bold leading-[1.3] text-fv-navy">{item.title}</span>
                </span>
                {item.description && (
                  <span className="line-clamp-2 text-[13px] leading-[1.55] text-fv-slate">{item.description}</span>
                )}
                <span className="mt-auto flex items-center justify-between gap-2.5 border-t border-fv-line pt-3 text-[12.5px]">
                  {price ? (
                    <span className="whitespace-nowrap text-xs text-fv-slate">
                      From <b className="text-sm font-extrabold text-fv-navy">{price}</b>
                    </span>
                  ) : (
                    <span className="whitespace-nowrap font-semibold text-fv-navy">Price on request</span>
                  )}
                  {item.duration && (
                    <span className="flex min-w-0 items-center gap-1.5 text-fv-slate">
                      <Clock className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                      <span className="truncate">{item.duration}</span>
                    </span>
                  )}
                </span>
              </IntentLink>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
