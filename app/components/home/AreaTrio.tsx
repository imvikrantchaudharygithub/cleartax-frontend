import IntentLink from '../fv/IntentLink';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ChevronRight, Landmark, Scale, TrendingUp } from 'lucide-react';
import Section from '@/app/components/fv/Section';
import IconTile from '@/app/components/fv/IconTile';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { fvColorVars, type FvColor } from '@/app/lib/fv/colors';
import type { ExplorerArea } from '@/app/lib/fv/explorer';
import { plural } from '@/app/lib/fv/text';

// Static header icon + colour per complex area (design 3 `S.trio`). Other area keys are ignored.
const AREA_STYLE: Record<string, { icon: LucideIcon; color: FvColor }> = {
  ipo: { icon: TrendingUp, color: 'green' },
  legal: { icon: Scale, color: 'teal' },
  'banking-finance': { icon: Landmark, color: 'orange' },
};

/** IPO / Legal / Banking side by side, each a list card of its subcategories with service counts. */
export default function AreaTrio({ areas }: { areas: ExplorerArea[] }) {
  const shown = areas.filter((area) => AREA_STYLE[area.key] && area.rows.length > 0);
  if (shown.length === 0) return null;

  return (
    <Section soft aria-labelledby="service-areas-title">
      {/* Keeps the outline H1 → H2 → H3: the cards' area names are h3s. */}
      <h2 id="service-areas-title" className="sr-only">
        Our service areas
      </h2>
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3">
        {shown.map((area) => {
          const { icon, color } = AREA_STYLE[area.key];
          const total = area.rows.reduce((sum, row) => sum + (row.count ?? 0), 0);
          return (
            <div key={area.key} style={fvColorVars(color) as CSSProperties} className="fv-card flex min-w-0 flex-col p-5">
              <div className="mb-3 flex items-center gap-3">
                <IconTile icon={icon} color={color} />
                <div className="min-w-0">
                  <h3 className="text-[17px] font-bold leading-[1.3] text-fv-navy">{area.heading}</h3>
                  <small className="text-[12.5px] text-fv-slate">{plural(total, 'service')}</small>
                </div>
              </div>
              <ul>
                {area.rows.map((row) => {
                  const RowIcon = row.icon ? getIconFromName(row.icon) : ChevronRight;
                  return (
                    <li key={row.href} className="border-b border-fv-line last:border-0">
                      <IntentLink
                        href={row.href}
                        className="-mx-1.5 flex items-center gap-2.5 rounded-md px-1.5 py-2.5 text-sm text-fv-navy transition-colors hover:text-fv-blue-d focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d"
                      >
                        <RowIcon className="h-4 w-4 flex-none text-[var(--c)]" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">{row.title}</span>
                        <span className="flex-none rounded-full bg-[var(--cb)] px-2 py-0.5 text-xs font-bold text-[color-mix(in_srgb,var(--c)_70%,#000)]">
                          {row.count ?? 0}
                          <span className="sr-only"> services</span>
                        </span>
                      </IntentLink>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto pt-3">
                <IntentLink
                  href={area.cta.href}
                  className="inline-flex items-center gap-1.5 rounded text-[14.5px] font-semibold text-fv-blue-d hover:text-fv-blue-dd focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d"
                >
                  {area.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </IntentLink>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
