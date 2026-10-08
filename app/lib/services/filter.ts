/**
 * Search + category filtering for /services. Pure (no React, no Next) so it runs under
 * scripts/test-pure.sh. The list and the chip counts both go through these helpers, so a
 * chip's count is, by construction, the number of cards the page shows when that chip is
 * selected. Contract: .superpowers/sdd/2026-10-07-services-chip-counts/contract.md
 */

/** The fields filtering reads; real services carry many more. */
export interface FilterableService {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  shortDescription?: string | null;
}

export interface FilterableGroup<S extends FilterableService = FilterableService> {
  id: string;
  services?: S[] | null;
}

type ServiceOf<G extends FilterableGroup> = NonNullable<G['services']>[number];

/** A group as the list renders it: same fields, services narrowed to the visible cards. */
export type FilteredGroup<G extends FilterableGroup> = Omit<G, 'services'> & { services: ServiceOf<G>[] };

export interface ChipCounts {
  /** "All Services": the sum of every group's count. */
  all: number;
  /** Per group id: the cards shown if that chip were selected with the current query. */
  byId: Record<string, number>;
}

/** Selection id of the "All Services" chip. */
export const ALL_ID = 'all';

export function normalizeQuery(q: string): string {
  return typeof q === 'string' ? q.trim().toLowerCase() : '';
}

/** A card needs an id (React key) and a slug (its link); anything else is never shown or counted. */
export function isListable(s: FilterableService | null | undefined): boolean {
  return s != null && Boolean(s.id) && Boolean(s.slug);
}

const lower = (value: unknown): string => (typeof value === 'string' ? value.toLowerCase() : '');

/** `nq` must already be normalised. */
function matchesNormalized(s: FilterableService, nq: string): boolean {
  if (!nq) return true;
  return lower(s.title).includes(nq) || lower(s.shortDescription).includes(nq);
}

export function matchesQuery(s: FilterableService, q: string): boolean {
  return matchesNormalized(s, normalizeQuery(q));
}

/** Listable services of one group that match an already-normalised query. */
function visibleServices<G extends FilterableGroup>(group: G, nq: string): ServiceOf<G>[] {
  const services = Array.isArray(group?.services) ? (group.services as ServiceOf<G>[]) : [];
  return services.filter((s) => isListable(s) && matchesNormalized(s, nq));
}

/**
 * The groups to render for a query and a selected chip (`'all'` or a group id), in input
 * order, each with only its visible cards. Groups left with no cards are dropped.
 */
export function filterGroups<G extends FilterableGroup>(groups: G[], query: string, selectedId: string): FilteredGroup<G>[] {
  if (!Array.isArray(groups)) return [];
  const nq = normalizeQuery(query);
  const result: FilteredGroup<G>[] = [];
  for (const group of groups) {
    if (group == null) continue;
    if (selectedId !== ALL_ID && group.id !== selectedId) continue;
    const services = visibleServices(group, nq);
    if (services.length > 0) result.push({ ...group, services });
  }
  return result;
}

/**
 * Chip counts for a query. Deliberately takes no selection: counts never depend on which
 * chip is selected. Every group gets an entry, including those with 0.
 */
export function chipCounts(groups: FilterableGroup[], query: string): ChipCounts {
  const byId: Record<string, number> = {};
  let all = 0;
  if (!Array.isArray(groups)) return { all, byId };
  const nq = normalizeQuery(query);
  for (const group of groups) {
    if (group == null) continue;
    const n = visibleServices(group, nq).length;
    byId[group.id] = (byId[group.id] ?? 0) + n;
    all += n;
  }
  return { all, byId };
}
