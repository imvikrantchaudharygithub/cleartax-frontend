import { cache } from 'react';
import { API_CONFIG } from '@/app/lib/api/config';
import type { SolutionDetail, SolutionSummary } from '@/app/lib/api/types';
import { normalizeSolutionSlug } from './form';

// Same ISR window as the rest of the public site. A plain `next.revalidate` fetch (no cookies() /
// headers()) keeps every page that renders the site layout static (amendment A5).
const REVALIDATE = 300;
// A hung backend must not hang a render / an ISR regeneration.
const TIMEOUT_MS = 8000;

// Both fetchers are wrapped in React cache(): a `signal` opts a fetch out of Next's per-request
// dedupe (next/dist/server/lib/dedupe-fetch.js), so without it the layout + home page, and
// generateMetadata + the solution page, would each call the backend twice on a data-cache miss.

/** Published solutions for server components. Never throws: a failure renders no rail / no menu. */
export const fetchPublishedSolutions = cache(async (homeOnly = false): Promise<SolutionSummary[]> => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/solutions${homeOnly ? '?home=true' : ''}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
});

/**
 * One published solution, or null (unknown slug, draft, or API down → the page 404s). A slug no
 * solution can have returns null without a request: Next caches only 200s, so every probe of a random
 * path would otherwise be an uncached backend call.
 */
export const fetchSolution = cache(async (slug: string): Promise<SolutionDetail | null> => {
  const s = normalizeSolutionSlug(slug);
  if (!s) return null;
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/solutions/${encodeURIComponent(s)}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
});
