'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Loader2, AlertTriangle, RefreshCw, SearchX } from 'lucide-react';
import { useConfirm } from '@/app/components/admin/ConfirmDialog';
import ServiceToolbar from '@/app/components/admin/ServiceToolbar';
import ServiceRowItem from '@/app/components/admin/ServiceRow';
import { useServiceIndex } from '@/app/lib/admin/useServiceIndex';
import {
  applyFilters,
  categoryOptions,
  countByStatus,
  isFilterActive,
  DEFAULT_FILTER_STATE,
  FilterState,
  ServiceRow as ServiceRowData,
  SortKey,
  StatusFilter,
} from '@/app/lib/admin/serviceFilters';
import { gstCategory } from '@/app/data/services/gst';
import { incomeTaxCategory } from '@/app/data/services/income-tax';
import { registrationCategory } from '@/app/data/services/registration';
import { trademarksCategory } from '@/app/data/services/trademarks';
import { ipoCategories } from '@/app/data/services/ipo';
import { legalCategories } from '@/app/data/services/legal';
import ServiceCategorySection from '@/app/components/admin/ServiceCategorySection';
import AddServiceModal from '@/app/components/admin/AddServiceModal';
import { Service, ServiceCategory } from '@/app/types/services';
import { IPOCategory } from '@/app/types/ipo';
import { LegalCategory } from '@/app/types/legal';
import { getServices } from '@/app/lib/admin/serviceStorage';

const SORT_KEYS: SortKey[] = ['updated', 'created', 'title', 'category'];
const STATUS_KEYS: StatusFilter[] = ['all', 'draft', 'published'];

/**
 * Filter state lives in the URL so a filtered view is shareable and the back
 * button works. Read/written via window.location + history.replaceState rather
 * than useSearchParams, which would force this page under a Suspense boundary.
 */
function readFilterStateFromUrl(): FilterState {
  if (typeof window === 'undefined') return DEFAULT_FILTER_STATE;

  const params = new URLSearchParams(window.location.search);
  const status = params.get('status') as StatusFilter | null;
  const sort = params.get('sort') as SortKey | null;

  return {
    q: params.get('q') ?? DEFAULT_FILTER_STATE.q,
    status: status && STATUS_KEYS.includes(status) ? status : DEFAULT_FILTER_STATE.status,
    category: params.get('category') ?? DEFAULT_FILTER_STATE.category,
    sort: sort && SORT_KEYS.includes(sort) ? sort : DEFAULT_FILTER_STATE.sort,
  };
}

function writeFilterStateToUrl(state: FilterState): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();
  if (state.q.trim()) params.set('q', state.q);
  if (state.status !== DEFAULT_FILTER_STATE.status) params.set('status', state.status);
  if (state.category !== DEFAULT_FILTER_STATE.category) params.set('category', state.category);
  if (state.sort !== DEFAULT_FILTER_STATE.sort) params.set('sort', state.sort);

  const query = params.toString();
  window.history.replaceState(
    null,
    '',
    query ? `${window.location.pathname}?${query}` : window.location.pathname
  );
}

// Convert IPO and Legal categories to ServiceCategory format for display
function convertIPOCategoryToServiceCategory(ipoCategory: IPOCategory): ServiceCategory[] {
  // IPO has subServices, we'll create a service category for each IPO category
  return [{
    id: ipoCategory.id,
    slug: ipoCategory.slug,
    title: ipoCategory.title,
    description: ipoCategory.description,
    icon: ipoCategory.icon,
    heroTitle: ipoCategory.heroTitle,
    heroDescription: ipoCategory.heroDescription,
    services: ipoCategory.subServices.map(sub => ({
      id: sub.id,
      slug: sub.slug,
      title: sub.title,
      shortDescription: sub.shortDescription,
      longDescription: sub.longDescription,
      icon: sub.icon,
      category: 'IPO',
      price: sub.price,
      duration: sub.duration,
      features: sub.features,
      benefits: sub.benefits || [],
      requirements: sub.requirements || [],
      process: sub.process || [],
      faqs: sub.faqs || [],
      relatedServices: [],
    })),
  }];
}

function convertLegalCategoryToServiceCategory(legalCategory: LegalCategory): ServiceCategory[] {
  return [{
    id: legalCategory.id,
    slug: legalCategory.slug,
    title: legalCategory.title,
    description: legalCategory.description,
    icon: legalCategory.icon,
    heroTitle: legalCategory.heroTitle,
    heroDescription: legalCategory.heroDescription,
    services: legalCategory.subServices.map(sub => ({
      id: sub.id,
      slug: sub.slug,
      title: sub.title,
      shortDescription: sub.shortDescription,
      longDescription: sub.longDescription,
      icon: sub.icon,
      category: 'Legal',
      price: sub.price,
      duration: sub.duration,
      features: sub.features,
      benefits: sub.benefits || [],
      requirements: sub.requirements || [],
      process: sub.process || [],
      faqs: sub.faqs || [],
      relatedServices: sub.relatedServices || [],
    })),
  }];
}

export default function AdminServicesPage() {
  const confirm = useConfirm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // ---- Global search / filter -------------------------------------------
  const { rows, loading, error, truncated, refresh } = useServiceIndex();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Hydrate from the URL on mount only — server render has no window.
  useEffect(() => {
    setFilters(readFilterStateFromUrl());
  }, []);

  const results = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const counts = useMemo(() => countByStatus(rows, filters.category), [rows, filters.category]);
  const categories = useMemo(() => categoryOptions(rows), [rows]);
  const filtersActive = isFilterActive(filters);

  const handleFilterChange = useCallback((next: FilterState) => {
    setFilters(next);
    setCursor(0);
    writeFilterStateToUrl(next);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    setCursor(0);
    writeFilterStateToUrl(DEFAULT_FILTER_STATE);
  }, []);

  const handleOpenRow = useCallback((row: ServiceRowData) => {
    setEditingService(row.raw);
    setIsAddModalOpen(true);
  }, []);

  // ↑/↓ move the row cursor, Enter opens it. Ignored while a modal is open.
  useEffect(() => {
    if (isAddModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (results.length === 0) return;
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') return;

      // Enter inside the search box should open the top hit, so allow it there,
      // but never hijack Enter in any other input.
      const target = event.target as HTMLElement | null;
      const inTextField =
        target && (target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (inTextField) return;

      if (event.key === 'Enter') {
        const row = results[Math.min(cursor, results.length - 1)];
        if (row) {
          event.preventDefault();
          handleOpenRow(row);
        }
        return;
      }

      event.preventDefault();
      setCursor((current) => {
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const next = Math.min(Math.max(current + delta, 0), results.length - 1);
        listRef.current
          ?.querySelectorAll('[data-service-row]')
          [next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [results, cursor, isAddModalOpen, handleOpenRow]);

  // Get services from localStorage
  const storedServices = getServices();

  // Combine all categories
  let allCategories: ServiceCategory[] = [
    gstCategory,
    incomeTaxCategory,
    registrationCategory,
    trademarksCategory,
    ...ipoCategories.flatMap(convertIPOCategoryToServiceCategory),
    ...legalCategories.flatMap(convertLegalCategoryToServiceCategory),
  ];

  // Add stored services to their respective categories
  if (storedServices.length > 0) {
    const categoryMap = new Map<string, Service[]>();
    
    // Group stored services by category
    storedServices.forEach((service) => {
      const category = service.category.toLowerCase();
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(service);
    });

    // Add stored services to existing categories or create new ones
    categoryMap.forEach((services, categoryKey) => {
      const existingCategory = allCategories.find(
        (cat) => cat.id.toLowerCase() === categoryKey || cat.slug.toLowerCase() === categoryKey
      );
      
      if (existingCategory) {
        // Merge with existing services (avoid duplicates)
        services.forEach((service) => {
          if (!existingCategory.services.find((s) => s.id === service.id)) {
            existingCategory.services.push(service);
          }
        });
      } else {
        // Create new category for stored services
        if (services.length > 0) {
          const firstService = services[0];
          allCategories.push({
            id: categoryKey,
            slug: categoryKey,
            title: `${firstService.category} Services`,
            description: `Custom ${firstService.category} services`,
            icon: firstService.icon,
            heroTitle: `${firstService.category} Services`,
            heroDescription: `Custom services in ${firstService.category} category`,
            services,
          });
        }
      }
    });
  }

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    const confirmed = await confirm({
      title: 'Delete service?',
      message: 'Are you sure you want to delete this service? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
    });
    if (confirmed) {
      // TODO: Implement delete functionality
      console.log('Delete service:', serviceId);
    }
  };

  const handleAddNew = () => {
    setEditingService(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingService(null);
    // An edit may have changed title/status/updatedAt, so re-pull the index.
    void refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
          <p className="text-gray-400">
            Search across every category, or pick one below to manage it
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ---- Global search across all categories ---- */}
      <section className="space-y-4">
        <ServiceToolbar
          state={filters}
          onChange={handleFilterChange}
          counts={counts}
          categories={categories}
          resultCount={results.length}
          active={filtersActive}
          onClear={handleClearFilters}
        />

        {truncated && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/40 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">
              This list hit the server&apos;s 1000-result ceiling, so it is incomplete. Search
              needs to move server-side before it can be trusted again.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-3 p-4 bg-red-500/10 border border-red-500/40 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="px-3 py-1.5 text-sm font-medium text-red-200 hover:text-white border border-red-500/40 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading && rows.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg divide-y divide-gray-700/70">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-700/60 rounded w-2/3" />
                </div>
                <div className="hidden md:block h-6 w-24 bg-gray-700 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && rows.length > 0 && (
          <div className="flex flex-col items-center gap-3 p-10 bg-gray-800 border border-gray-700 rounded-lg text-center">
            <SearchX className="w-8 h-8 text-gray-500" />
            <p className="text-gray-400">No services match these filters.</p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {results.length > 0 && (
          <div
            ref={listRef}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
          >
            {results.map((row, index) => (
              <ServiceRowItem
                key={row.id}
                row={row}
                active={index === cursor}
                onOpen={handleOpenRow}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---- Existing category shortcuts (unchanged) ---- */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">
            Please select a service category from the sidebar menu to view and manage services.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {[
              { label: 'GST Services', href: '/admin/services/gst' },
              { label: 'Income Tax', href: '/admin/services/income-tax' },
              { label: 'Registration', href: '/admin/services/registration' },
              { label: 'Trademarks', href: '/admin/services/trademarks' },
              { label: 'IPO Services', href: '/admin/services/ipo' },
              { label: 'Legal Services', href: '/admin/services/legal' },
              { label: 'Banking & Finance', href: '/admin/services/banking-finance' },
            ].map((cat) => (
              <a
                key={cat.href}
                href={cat.href}
                className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-primary transition-colors text-gray-300 hover:text-white"
              >
                {cat.label}
              </a>
        ))}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddServiceModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          editingService={editingService}
          defaultCategory={editingService?.category}
        />
      )}
    </div>
  );
}

