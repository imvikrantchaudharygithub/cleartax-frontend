'use client';

/**
 * Search + filter + sort controls for the admin services lists.
 *
 * Presentational: props in, callbacks out, no data fetching. Used by both the
 * global list and the per-category page so behaviour cannot drift between them.
 */

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import {
  CategoryOption,
  FilterState,
  SortKey,
  StatusCounts,
  StatusFilter,
} from '@/app/lib/admin/serviceFilters';

interface ServiceToolbarProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
  counts: StatusCounts;
  /** Omit to hide the category dropdown (the per-category page has no use for it). */
  categories?: CategoryOption[];
  resultCount: number;
  placeholder?: string;
  /** Show the "Clear all" affordance. */
  active: boolean;
  onClear: () => void;
}

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Recently updated',
  created: 'Recently created',
  title: 'Title A→Z',
  category: 'Category',
};

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border';
// accent (#2587C4), not primary (#1E2C59) — primary is too dark against gray-900
// for a selected state to read as selected.
const CHIP_ON = 'bg-accent text-white border-accent';
const CHIP_OFF =
  'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500 hover:text-white';

const SELECT_CLASS =
  'bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent';

export default function ServiceToolbar({
  state,
  onChange,
  counts,
  categories,
  resultCount,
  placeholder = 'Search services by name, description or category…',
  active,
  onClear,
}: ServiceToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K / "/" focuses search; Esc clears it while focused.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typingElsewhere =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (event.key === '/' && !typingElsewhere) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const statusChips: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'draft', label: 'Drafts', count: counts.draft },
    { value: 'published', label: 'Live', count: counts.published },
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={state.q}
          onChange={(event) => onChange({ ...state, q: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && state.q) {
              event.preventDefault();
              onChange({ ...state, q: '' });
            }
          }}
          placeholder={placeholder}
          aria-label="Search services"
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-24 py-2.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent"
        />
        {state.q ? (
          <button
            type="button"
            onClick={() => onChange({ ...state, q: '' })}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block px-1.5 py-0.5 text-[11px] font-medium text-gray-500 bg-gray-800 border border-gray-700 rounded">
            ⌘K
          </kbd>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusChips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => onChange({ ...state, status: chip.value })}
            aria-pressed={state.status === chip.value}
            className={`${CHIP_BASE} ${state.status === chip.value ? CHIP_ON : CHIP_OFF}`}
          >
            {chip.label}
            <span
              className={
                state.status === chip.value ? 'ml-1.5 opacity-80' : 'ml-1.5 text-gray-500'
              }
            >
              {chip.count}
            </span>
          </button>
        ))}

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {categories && categories.length > 0 && (
            <select
              value={state.category}
              onChange={(event) => onChange({ ...state, category: event.target.value })}
              aria-label="Filter by category"
              className={SELECT_CLASS}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.title} ({category.count})
                </option>
              ))}
            </select>
          )}

          <select
            value={state.sort}
            onChange={(event) =>
              onChange({ ...state, sort: event.target.value as SortKey })
            }
            aria-label="Sort services"
            className={SELECT_CLASS}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {resultCount === counts.all
            ? `${resultCount} service${resultCount === 1 ? '' : 's'}`
            : `Showing ${resultCount} of ${counts.all}`}
        </span>
        {active && (
          <button
            type="button"
            onClick={onClear}
            className="text-accent hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
