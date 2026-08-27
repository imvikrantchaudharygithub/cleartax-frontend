'use client';

/**
 * Dense row for the admin global services list.
 *
 * A row rather than a card: the existing 3-across ServiceCard grid is unusable
 * at ~450 items. ServiceCard is unchanged and still used by the category page.
 */

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ServiceRow as ServiceRowData } from '@/app/lib/admin/serviceFilters';
import { getIconFromName } from '@/app/lib/admin/serviceIcons';

interface ServiceRowProps {
  row: ServiceRowData;
  /** Highlighted by keyboard navigation. */
  active?: boolean;
  onOpen: (row: ServiceRowData) => void;
}

/** Compact relative time: "2h ago", "3d ago", else a date. */
function relativeTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return '—';

  const seconds = Math.floor((Date.now() - parsed) / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(parsed).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ServiceRow({ row, active = false, onOpen }: ServiceRowProps) {
  const Icon = getIconFromName(row.raw.iconName);
  const isDraft = row.status === 'draft';

  return (
    <div
      data-service-row
      role="button"
      tabIndex={0}
      onClick={() => onOpen(row)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(row);
        }
      }}
      aria-label={`Edit ${row.title}`}
      className={`group flex items-center gap-3 px-4 py-3 border-b border-gray-700/70 last:border-b-0 cursor-pointer transition-colors ${
        active ? 'bg-gray-700/60' : 'hover:bg-gray-700/40'
      }`}
    >
      <div className="flex-shrink-0 p-2 bg-primary/20 rounded-lg">
        <Icon className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-white truncate">{row.title}</h3>
          {isDraft ? (
            <span className="flex-shrink-0 px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              Draft
            </span>
          ) : (
            <span className="flex-shrink-0 px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Live
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 truncate">{row.shortDescription}</p>
      </div>

      <span className="hidden md:inline-flex flex-shrink-0 px-2.5 py-1 text-xs rounded-full bg-gray-900 text-gray-300 border border-gray-700">
        {row.categoryTitle}
      </span>

      <span className="hidden lg:block flex-shrink-0 w-24 text-right text-xs text-gray-500">
        {relativeTime(row.updatedAt)}
      </span>

      {row.categorySlug !== 'uncategorized' && (
        <Link
          href={`/admin/services/${row.categorySlug}`}
          onClick={(event) => event.stopPropagation()}
          title={`Open ${row.categoryTitle} category`}
          aria-label={`Open ${row.categoryTitle} category`}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
