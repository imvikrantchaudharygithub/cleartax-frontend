/**
 * Pure search / filter / sort logic for the admin services lists.
 *
 * No React, no fetch, no DOM — deliberately. Both the global list
 * (`/admin/services`) and the per-category page use these same functions, so the
 * two surfaces cannot drift apart in behaviour.
 *
 * Design: docs/superpowers/specs/2026-08-27-admin-services-search-filter-design.md
 */

import { Service } from '@/app/types/services';

export type ServiceStatus = 'draft' | 'published';

/** Flat row shape the list UIs render. `raw` keeps the full service for the edit modal. */
export interface ServiceRow {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  status: ServiceStatus;
  categorySlug: string;
  categoryTitle: string;
  createdAt: string;
  updatedAt: string;
  raw: Service;
}

export type SortKey = 'updated' | 'created' | 'title' | 'category';
export type StatusFilter = 'all' | ServiceStatus;

export interface FilterState {
  q: string;
  status: StatusFilter;
  /** Category slug, or 'all'. */
  category: string;
  sort: SortKey;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  q: '',
  status: 'all',
  category: 'all',
  // `updated`, not `created`: the ~439 drafts from the bulk import all share
  // essentially the same createdAt, so sorting by it yields one flat block.
  sort: 'updated',
};

export function isFilterActive(state: FilterState): boolean {
  return (
    state.q.trim() !== '' ||
    state.status !== DEFAULT_FILTER_STATE.status ||
    state.category !== DEFAULT_FILTER_STATE.category
  );
}

/** Split a query into lowercase tokens. Whitespace-normalised, empties dropped. */
export function tokenize(q: string): string[] {
  return q.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/**
 * Relevance score for one row against one token, or -1 for no match.
 * Higher is better. Deliberately excludes longDescription: nearly every GST
 * service mentions "GST" in its body, which would drown the signal.
 */
function scoreToken(row: ServiceRow, token: string): number {
  const title = row.title.toLowerCase();
  if (title.startsWith(token)) return 4;
  if (title.includes(token)) return 3;
  if (row.shortDescription.toLowerCase().includes(token)) return 2;
  if (row.categoryTitle.toLowerCase().includes(token)) return 1;
  if (row.slug.toLowerCase().includes(token)) return 1;
  return -1;
}

/**
 * Total score for a row, or -1 if any token fails to match.
 * Multi-token queries are AND: "gst annual" requires both.
 */
export function scoreRow(row: ServiceRow, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  let total = 0;
  for (const token of tokens) {
    const score = scoreToken(row, token);
    if (score < 0) return -1;
    total += score;
  }
  return total;
}

function timeOf(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Ties always break on title so ordering is stable across renders. */
function compareBySort(a: ServiceRow, b: ServiceRow, sort: SortKey): number {
  switch (sort) {
    case 'updated': {
      const diff = timeOf(b.updatedAt) - timeOf(a.updatedAt);
      return diff !== 0 ? diff : a.title.localeCompare(b.title);
    }
    case 'created': {
      const diff = timeOf(b.createdAt) - timeOf(a.createdAt);
      return diff !== 0 ? diff : a.title.localeCompare(b.title);
    }
    case 'category': {
      const diff = a.categoryTitle.localeCompare(b.categoryTitle);
      return diff !== 0 ? diff : a.title.localeCompare(b.title);
    }
    case 'title':
    default:
      return a.title.localeCompare(b.title);
  }
}

/**
 * Apply every active filter, then sort.
 *
 * Filters AND together: a row must satisfy status AND category AND search.
 * Stated explicitly because the backend's `getServices` gets exactly this wrong
 * (it ORs them — see the design doc).
 *
 * When a search query is present, results are ranked by relevance and the sort
 * dropdown only breaks ties; without a query, the sort applies directly.
 */
export function applyFilters(rows: ServiceRow[], state: FilterState): ServiceRow[] {
  const tokens = tokenize(state.q);
  const searching = tokens.length > 0;

  const scored: { row: ServiceRow; score: number }[] = [];

  for (const row of rows) {
    if (state.status !== 'all' && row.status !== state.status) continue;
    if (state.category !== 'all' && row.categorySlug !== state.category) continue;

    const score = scoreRow(row, tokens);
    if (score < 0) continue;

    scored.push({ row, score });
  }

  scored.sort((a, b) => {
    if (searching && b.score !== a.score) return b.score - a.score;
    return compareBySort(a.row, b.row, state.sort);
  });

  return scored.map((entry) => entry.row);
}

export interface StatusCounts {
  all: number;
  draft: number;
  published: number;
}

/**
 * Counts for the status chips. Respects the category filter but ignores the
 * status filter and the query, so the chips show what you'd get by switching to
 * them rather than always reporting the current selection.
 */
export function countByStatus(rows: ServiceRow[], category: string): StatusCounts {
  const counts: StatusCounts = { all: 0, draft: 0, published: 0 };

  for (const row of rows) {
    if (category !== 'all' && row.categorySlug !== category) continue;
    counts.all += 1;
    counts[row.status] += 1;
  }

  return counts;
}

export interface CategoryOption {
  slug: string;
  title: string;
  count: number;
}

/** Distinct categories present in the data, alphabetical, with row counts. */
export function categoryOptions(rows: ServiceRow[]): CategoryOption[] {
  const map = new Map<string, CategoryOption>();

  for (const row of rows) {
    const existing = map.get(row.categorySlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(row.categorySlug, {
        slug: row.categorySlug,
        title: row.categoryTitle,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}
