'use client';

/**
 * Loads every service (drafts included) once, for the admin global search list.
 *
 * This is the ONLY file in the search/filter feature that touches the network.
 * That isolation is deliberate: moving to a server-side or projected-payload
 * approach later should change this file and nothing else.
 *
 * Design: docs/superpowers/specs/2026-08-27-admin-services-search-filter-design.md
 */

import { useCallback, useEffect, useState } from 'react';
import { API_CONFIG } from '@/app/lib/api/config';
import { Service } from '@/app/types/services';
import { ServiceRow, ServiceStatus } from './serviceFilters';
import { getIconFromName } from './serviceIcons';

/**
 * The backend clamps an explicit `limit` to PAGINATION.MAX_LIMIT, which is 100
 * (backend src/config/constants.ts). Passing `?limit=1000` therefore silently
 * returns 100 of ~450 services and the UI looks like it is working.
 *
 * Omitting BOTH `page` and `limit` flips `usePagination` false in
 * getServices() and takes the unclamped `limit = 1000` branch, which is the
 * only way to get the full list without a backend change.
 *
 * DO NOT add a `limit` or `page` param here.
 */
export function buildIndexUrl(baseUrl: string): string {
  return `${baseUrl}/services?includeDrafts=true`;
}

/** Server-side ceiling in the same getServices() branch. Past this, results truncate. */
export const SERVER_RESULT_CEILING = 1000;

function normalizeService(raw: Record<string, any>): ServiceRow {
  const id = String(raw._id ?? raw.id ?? '');
  const categoryInfo = raw.categoryInfo ?? null;

  const service: Service = {
    id,
    slug: raw.slug ?? '',
    title: raw.title ?? '',
    shortDescription: raw.shortDescription ?? '',
    longDescription: raw.longDescription ?? '',
    icon: getIconFromName(raw.iconName),
    iconName: raw.iconName,
    category: categoryInfo?.slug ?? String(raw.category ?? ''),
    price: raw.price ?? { min: 0, max: 0, currency: 'INR' },
    duration: raw.duration ?? '',
    features: raw.features ?? [],
    benefits: raw.benefits ?? [],
    requirements: raw.requirements ?? [],
    process: raw.process ?? [],
    faqs: raw.faqs ?? [],
    relatedServices: raw.relatedServices ?? [],
    status: raw.status,
  };

  return {
    id,
    slug: service.slug,
    title: service.title,
    shortDescription: service.shortDescription,
    // Legacy records predate the status field; the backend treats a missing
    // status as published, so mirror that rather than inventing a third state.
    status: (raw.status ?? 'published') as ServiceStatus,
    // Services whose category cannot be resolved are shown as 'uncategorized'
    // rather than dropped — with ~450 bulk-imported records, silently hiding
    // rows is the worse failure.
    categorySlug: categoryInfo?.slug ?? 'uncategorized',
    categoryTitle: categoryInfo?.title ?? 'Uncategorized',
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? raw.createdAt ?? '',
    raw: service,
  };
}

interface CacheEntry {
  rows: ServiceRow[];
  truncated: boolean;
}

/** Module-scope cache: moving between admin pages should not refetch ~1.5MB. */
let cache: CacheEntry | null = null;
let inFlight: Promise<CacheEntry> | null = null;

async function fetchIndex(): Promise<CacheEntry> {
  const response = await fetch(buildIndexUrl(API_CONFIG.BASE_URL), { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load services (${response.status})`);
  }

  const payload = await response.json();
  if (!payload?.success || !Array.isArray(payload.data)) {
    throw new Error(payload?.message || 'Failed to load services');
  }

  const rows = payload.data.map(normalizeService).filter((row: ServiceRow) => row.id !== '');

  return { rows, truncated: payload.data.length >= SERVER_RESULT_CEILING };
}

function loadIndex(force: boolean): Promise<CacheEntry> {
  if (!force && cache) return Promise.resolve(cache);
  if (!force && inFlight) return inFlight;

  inFlight = fetchIndex()
    .then((entry) => {
      cache = entry;
      return entry;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/** Drop the cache so the next mount refetches. Call after create/delete. */
export function invalidateServiceIndex(): void {
  cache = null;
}

/**
 * Patch already-loaded rows in place. Cheaper than refetching ~1.5MB after a
 * single publish/unpublish.
 */
export function patchServiceRows(ids: string[], changes: Partial<ServiceRow>): void {
  if (!cache) return;
  const target = new Set(ids);
  cache = {
    ...cache,
    rows: cache.rows.map((row) => (target.has(row.id) ? { ...row, ...changes } : row)),
  };
}

export interface ServiceIndex {
  rows: ServiceRow[];
  loading: boolean;
  error: string | null;
  /** True when the server hit its 1000-result ceiling — the list is incomplete. */
  truncated: boolean;
  refresh: () => Promise<void>;
}

export function useServiceIndex(): ServiceIndex {
  const [rows, setRows] = useState<ServiceRow[]>(cache?.rows ?? []);
  const [truncated, setTruncated] = useState(cache?.truncated ?? false);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const entry = await loadIndex(force);
      setRows(entry.rows);
      setTruncated(entry.truncated);
    } catch (err: any) {
      console.error('Error loading service index:', err);
      setError(err?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  return { rows, loading, error, truncated, refresh };
}
