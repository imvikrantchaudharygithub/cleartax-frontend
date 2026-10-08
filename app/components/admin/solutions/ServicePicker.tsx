'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { applyFilters, DEFAULT_FILTER_STATE, type ServiceRow } from '@/app/lib/admin/serviceFilters';
import { formatFromPrice } from '@/app/lib/fv/text';

interface ServicePickerProps {
  rows: ServiceRow[];
  loading: boolean;
  selectedIds: Set<string>;
  disabled?: boolean;
  inputId: string;
  onAdd: (serviceId: string) => void;
}

/** Search-and-add over the admin service index (drafts listed but not addable). */
export default function ServicePicker({ rows, loading, selectedIds, disabled, inputId, onAdd }: ServicePickerProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Published (addable) services before drafts, then the cap: the ~439 imported drafts would otherwise
  // fill all 8 rows. The sort is stable, so each group keeps applyFilters' relevance order.
  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const matches = applyFilters(rows, { ...DEFAULT_FILTER_STATE, q: query });
    const rank = (row: ServiceRow) => (row.status === 'published' ? 0 : 1);
    return matches.sort((a, b) => rank(a) - rank(b)).slice(0, 8);
  }, [rows, query]);

  return (
    <div className="mt-3">
      <label htmlFor={inputId} className="sr-only">
        Search services to add
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loading ? 'Loading services…' : disabled ? 'This section is full (40 services)' : 'Search services to add (2+ letters)'}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>
      {results.length > 0 && (
        <ul className="mt-1 divide-y divide-gray-700 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
          {results.map((row) => {
            const added = selectedIds.has(row.id);
            const draft = row.status !== 'published';
            const price = formatFromPrice(row.raw?.price);
            return (
              <li key={row.id}>
                <button
                  type="button"
                  disabled={added || draft}
                  onClick={() => {
                    onAdd(row.id);
                    setQuery('');
                    // The result list unmounts on clear; keep keyboard users in the search box.
                    inputRef.current?.focus();
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-800 focus:outline-none focus-visible:bg-gray-800 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-white">{row.title}</span>
                    <span className="block truncate text-xs text-gray-400">
                      {row.categoryTitle}
                      {price ? ` · From ${price}` : ''}
                    </span>
                  </span>
                  {added ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <Check className="h-3.5 w-3.5" />
                      Added
                    </span>
                  ) : draft ? (
                    <span className="rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-300">Draft</span>
                  ) : (
                    <Plus className="h-4 w-4 text-blue-400" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <p className="mt-1 text-xs text-gray-500">No services match &ldquo;{query}&rdquo;.</p>
      )}
    </div>
  );
}
