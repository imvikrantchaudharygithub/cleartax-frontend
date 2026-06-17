'use client';

import { useEffect, useRef, useState } from 'react';
import * as lucideIcons from 'lucide-react';
import { ChevronDown, Search } from 'lucide-react';
import { ICON_OPTIONS, NON_RENDERABLE_ICONS } from '@/app/lib/constants/categoryDefaults';

function resolveIcon(name: string | undefined) {
  if (!name || NON_RENDERABLE_ICONS.has(name)) return lucideIcons.FileText;
  return (lucideIcons as any)[name] || lucideIcons.FileText;
}

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  /** Accessible label / fallback placeholder text. */
  label?: string;
  error?: boolean;
}

/**
 * Reusable lucide icon picker: a button showing the current icon + name that
 * opens a searchable grid of curated icons. Used by the category-details editor.
 */
export default function IconPicker({ value, onChange, label = 'icon', error }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const Current = resolveIcon(value);
  const filtered = query
    ? ICON_OPTIONS.filter((n) => n.toLowerCase().includes(query.toLowerCase()))
    : ICON_OPTIONS;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={`Select ${label}`}
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-700'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Current className="w-5 h-5 text-primary shrink-0" />
          <span className="truncate text-sm">{value || 'Select icon'}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
          <div className="p-2 border-b border-gray-800">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-800 rounded-md">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons..."
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-auto grid grid-cols-5 gap-1 p-2">
            {filtered.map((name) => {
              const Icon = resolveIcon(name);
              const selected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`flex items-center justify-center p-2 rounded-md hover:bg-gray-800 ${
                    selected ? 'bg-primary/20 ring-1 ring-primary' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-200" />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-5 text-center text-sm text-gray-500 py-4">No icons match “{query}”.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
