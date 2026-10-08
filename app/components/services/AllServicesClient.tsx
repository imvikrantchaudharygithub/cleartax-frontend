'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import LightHero from '@/app/components/fv/LightHero';
import IconTileByName from '@/app/components/fv/IconTileByName';
import Button from '@/app/components/fv/Button';
import ServiceCard from '@/app/components/services/ServiceCard';
import { colorAt } from '@/app/lib/fv/colors';
import { plural } from '@/app/lib/fv/text';
import { ALL_ID, chipCounts, filterGroups } from '@/app/lib/services/filter';
import { Search, ArrowRight } from 'lucide-react';

// Serializable service type (matches what server passes)
interface SerializableService {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  category: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  relatedServices: string[];
  subcategorySlug?: string;
}

interface ServiceGroup {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  services: SerializableService[];
}

interface AllServicesClientProps {
  serviceGroups: ServiceGroup[];
}

/** The polite live region waits this long after the last change, so typing doesn't flood screen readers. */
const ANNOUNCE_DELAY_MS = 350;

const resultsText = (n: number) => `${plural(n, 'service')} found`;

interface CategoryChipProps {
  id: string;
  label: string;
  count: number;
  selected: boolean;
  onSelect: () => void;
  /** Renders the leading icon; receives whether the chip is muted (0 matches). */
  icon?: (muted: boolean) => ReactNode;
}

/**
 * Filter chip with a live count. DOM hooks (data-category-id, data-count, data-chip-count and the
 * "<label>, N service(s)" name) are a test contract: .superpowers/sdd/2026-10-07-services-chip-counts/contract.md
 */
function CategoryChip({ id, label, count, selected, onSelect, icon }: CategoryChipProps) {
  const muted = count === 0;
  return (
    <button
      type="button"
      data-category-id={id}
      data-count={count}
      aria-pressed={selected}
      aria-label={`${label}, ${plural(count, 'service')}`}
      onClick={onSelect}
      className={clsx(
        // Compact below sm (no icon, 2-digit pill) so 12 chips pack 2 per row at 390; sm+ unchanged.
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[13px] font-semibold leading-5 transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
        selected
          ? 'border-fv-blue-d bg-fv-blue-d text-white'
          : clsx('border-fv-line bg-white hover:border-fv-blue', muted ? 'text-fv-slate' : 'text-fv-navy'),
      )}
    >
      {icon?.(muted)}
      <span>{label}</span>
      {/* sm+: min-w fits 3 digits, so a count going 1 -> 3 digits never changes the chip's width.
          Below sm it fits 2 (only "All" reaches 3 digits and may widen slightly). */}
      <span
        data-chip-count
        aria-hidden="true"
        className={clsx(
          'inline-block min-w-6 rounded-full px-1 py-0.5 text-center text-xs font-bold tabular-nums sm:min-w-[2.5rem] sm:px-2',
          // Selected: white on fv-blue-dd = 8.48:1 (WCAG 1.4.3); white on bg-white/20 over fv-blue-d was 3.80:1.
          selected ? 'bg-fv-blue-dd text-white' : 'bg-fv-wash text-fv-slate',
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default function AllServicesClient({ serviceGroups }: AllServicesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_ID);
  // Prefill from /services?q=… (home SearchBar). Read once on mount — no useSearchParams
  // (spec risk table: it broke `next build` before), so the page keeps its ISR.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    // One-time sync from the URL after hydration (the server render can't know it) — intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q) setSearchQuery(q);
  }, []);

  // Ensure serviceGroups is always an array
  const safeServiceGroups = useMemo(() => (Array.isArray(serviceGroups) ? serviceGroups : []), [serviceGroups]);

  // The list and the chip counts share one code path (app/lib/services/filter.ts), so a chip's
  // count is always the number of cards shown when it is selected. Counts ignore the selection.
  const filteredGroups = useMemo(
    () => filterGroups(safeServiceGroups, searchQuery, selectedCategory),
    [safeServiceGroups, searchQuery, selectedCategory],
  );
  const counts = useMemo(() => chipCounts(safeServiceGroups, searchQuery), [safeServiceGroups, searchQuery]);
  const resultCount = filteredGroups.reduce((sum, group) => sum + group.services.length, 0);

  // Listable services per group with no query: the same numbers as the empty-query chips, so the
  // hero's "Explore N+" always equals the "All Services" chip.
  const listableCounts = useMemo(() => chipCounts(safeServiceGroups, ''), [safeServiceGroups]);
  const totalServices = listableCounts.all;

  // Groups with no services lead nowhere (same rule as the home trio and category pages):
  // no filter pill and no colour slot. A chip that drops to 0 during a search stays.
  const visibleGroups = useMemo(
    () => safeServiceGroups.filter((group) => (listableCounts.byId[group.id] ?? 0) > 0),
    [safeServiceGroups, listableCounts],
  );

  // Polite announcement of the result count, debounced; the visible counts are not.
  const [announcement, setAnnouncement] = useState(() => resultsText(resultCount));
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(resultsText(resultCount)), ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [resultCount]);

  return (
    <div className="bg-white">
      <LightHero
        title="All Services"
        subtitle={`Comprehensive solutions for your business needs. Explore ${totalServices}+ professional services.`}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      >
        <div className="relative mx-auto max-w-[640px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fv-muted" aria-hidden="true" />
          <label htmlFor="services-search" className="sr-only">
            Search services
          </label>
          <input
            id="services-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full rounded-xl border border-fv-line bg-white py-3.5 pl-11 pr-4 text-base text-fv-navy shadow-fv-card outline-none placeholder:text-fv-muted focus:border-fv-blue-d focus:ring-2 focus:ring-fv-blue-d focus-visible:outline-none"
          />
        </div>
        <div role="group" aria-label="Filter by category" className="mt-6 flex flex-wrap justify-center gap-x-1.5 gap-y-2 sm:gap-2">
          <CategoryChip
            id={ALL_ID}
            label="All Services"
            count={counts.all}
            selected={selectedCategory === ALL_ID}
            onSelect={() => setSelectedCategory(ALL_ID)}
          />
          {visibleGroups.map((group, i) => (
            <CategoryChip
              key={group.id}
              id={group.id}
              label={group.title}
              count={counts.byId[group.id] ?? 0}
              selected={selectedCategory === group.id}
              onSelect={() => setSelectedCategory(group.id)}
              icon={(muted) => (
                <IconTileByName
                  name={group.iconName}
                  color={colorAt(i)}
                  size="sm"
                  className={clsx('!h-6 !w-6 !rounded-md max-sm:hidden [&>svg]:!h-3.5 [&>svg]:!w-3.5', muted && 'opacity-40')}
                />
              )}
            />
          ))}
        </div>
        <p data-results-announcement aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </p>
      </LightHero>

      <div className="fv-wrap space-y-16 py-12 md:py-16">
        {filteredGroups.map((group) => {
          const colorIndex = Math.max(0, visibleGroups.findIndex((g) => g.id === group.id));
          const isComplex = group.id === 'legal' || group.id === 'ipo' || group.id === 'banking-finance';
          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <IconTileByName name={group.iconName} color={colorAt(colorIndex)} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 id={`group-${group.id}`} className="text-2xl font-extrabold tracking-[-0.02em] text-fv-navy md:text-[30px]">
                    {group.title}
                  </h2>
                  <p className="text-[15px] text-fv-slate">{group.description}</p>
                </div>
                <Link href={group.href} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold text-fv-blue-d hover:text-fv-blue-dd">
                  View all
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => (
                  <li key={service.id}>
                    <ServiceCard
                      title={service.title || 'Untitled Service'}
                      shortDescription={service.shortDescription || ''}
                      iconName={service.iconName}
                      price={service.price}
                      duration={service.duration}
                      slug={service.slug}
                      category={group.id}
                      subcategory={isComplex ? service.subcategorySlug : undefined}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="py-16 text-center">
            <h2 className="text-2xl font-extrabold text-fv-navy">No services found</h2>
            <p className="mb-6 mt-2 text-fv-slate">Try adjusting your search or filter criteria</p>
            <Button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(ALL_ID);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
