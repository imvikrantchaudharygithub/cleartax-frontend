'use client';

import { useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { AlertTriangle, ArrowDown, ArrowUp, Star, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useConfirm } from '@/app/components/admin/ConfirmDialog';
import ServicePicker from './ServicePicker';
import { formatFromPrice } from '@/app/lib/fv/text';
import type { ServiceRow } from '@/app/lib/admin/serviceFilters';
import type { SolutionItemMeta } from '@/app/lib/api/types';
import type { SolutionFormSchemaValues } from '@/app/lib/solutions/formSchema';

interface SectionEditorProps {
  index: number;
  count: number;
  rows: ServiceRow[];
  loadingRows: boolean;
  /** The service index loaded without error, so "not in rows" really means deleted/unknown. */
  indexReady: boolean;
  selectedIds: Set<string>;
  itemsMeta: Record<string, SolutionItemMeta>;
  onMove: (to: number) => void;
  onRemove: () => void;
}

export default function SectionEditor({ index, count, rows, loadingRows, indexReady, selectedIds, itemsMeta, onMove, onRemove }: SectionEditorProps) {
  const confirm = useConfirm();
  const { register, control, setValue, formState } = useFormContext<SolutionFormSchemaValues>();
  const items = useFieldArray({ control, name: `sections.${index}.items` });
  const watched = useWatch({ control, name: `sections.${index}.items` }) ?? [];
  const rowById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const sectionErrors = formState.errors.sections?.[index];
  const itemsError = sectionErrors?.items?.message ?? sectionErrors?.items?.root?.message;

  const removeSection = async () => {
    if (items.fields.length > 0) {
      const confirmed = await confirm({
        title: 'Delete this section?',
        message: `Its ${items.fields.length} service(s) will be removed from the solution.`,
        confirmLabel: 'Delete section',
        variant: 'danger',
      });
      if (!confirmed) return;
    }
    onRemove();
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4">
      {/* flex-wrap + a 10rem title basis: on phones the count and buttons drop to a second line. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-300">{index + 1}</span>
        <label htmlFor={`section-${index}-title`} className="sr-only">
          Section {index + 1} title
        </label>
        <input
          id={`section-${index}-title`}
          {...register(`sections.${index}.title`)}
          aria-invalid={sectionErrors?.title ? true : undefined}
          placeholder="e.g. Choose your business structure"
          className={clsx(
            'min-w-0 flex-[1_1_10rem] border-b border-dashed bg-transparent px-1 py-1.5 font-semibold text-white outline-none placeholder:font-normal placeholder:text-gray-500 focus:border-blue-400',
            sectionErrors?.title ? 'border-red-500' : 'border-gray-600',
          )}
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300" title="Services in this section">
            {items.fields.length}
          </span>
          <SmallButton label={`Move section ${index + 1} up`} disabled={index === 0} onClick={() => onMove(index - 1)}>
            <ArrowUp />
          </SmallButton>
          <SmallButton label={`Move section ${index + 1} down`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
            <ArrowDown />
          </SmallButton>
          <SmallButton label={`Delete section ${index + 1}`} danger onClick={removeSection}>
            <Trash2 />
          </SmallButton>
        </div>
      </div>
      {sectionErrors?.title?.message && <p className="mt-1 text-sm text-red-400">{sectionErrors.title.message}</p>}
      {itemsError && <p className="mt-1 text-sm text-red-400">{itemsError}</p>}

      {items.fields.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.fields.map((field, i) => {
            const serviceId = watched[i]?.service ?? field.service;
            const row = rowById.get(serviceId);
            const meta = itemsMeta[serviceId];
            const title = row?.title ?? meta?.title ?? 'Unknown service';
            // Stored items carry server meta (deleted / draft / no public href); new ones rely on the index.
            const unavailable = meta?.available === false || (indexReady && (!row || row.status !== 'published'));
            const price = row ? formatFromPrice(row.raw?.price) : meta && meta.priceMin > 0 ? formatFromPrice({ min: meta.priceMin }) : null;
            const popular = !!watched[i]?.popular;
            // Server 400s land here as `sections.N.items.M.service` (or `.popular`) via mapServerErrors.
            const itemError = sectionErrors?.items?.[i];
            const itemErrorMessage = itemError?.service?.message ?? itemError?.popular?.message ?? itemError?.message;
            return (
              <li
                key={field.id}
                className={clsx(
                  'rounded-lg border px-2 py-1.5',
                  itemErrorMessage
                    ? 'border-red-500/60 bg-red-500/10'
                    : unavailable
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-gray-700 bg-gray-800',
                )}
              >
                <div className="flex flex-wrap items-center gap-x-2">
                  <button
                    type="button"
                    aria-pressed={popular}
                    aria-label={popular ? `Unmark ${title} as most popular` : `Mark ${title} as most popular`}
                    title="Most popular"
                    onClick={() => setValue(`sections.${index}.items.${i}.popular`, !popular, { shouldDirty: true })}
                    className={clsx(
                      'grid h-8 w-8 flex-none place-items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                      popular ? 'text-amber-300' : 'text-gray-500 hover:text-gray-300',
                    )}
                  >
                    <Star className={clsx('h-4 w-4', popular && 'fill-current')} />
                  </button>
                  {/* 10rem basis: on phones the ↑/↓/✕ group wraps under the title instead of squeezing it. */}
                  <div className="min-w-0 flex-[1_1_10rem]">
                    <p className="truncate text-sm font-medium text-white">{title}</p>
                    {unavailable ? (
                      <p className="flex items-start gap-1 text-xs text-amber-300">
                        <AlertTriangle className="mt-px h-3.5 w-3.5 flex-none" />
                        Unavailable: unpublished or deleted. Remove it or publish the service.
                      </p>
                    ) : (
                      <p className="truncate text-xs text-gray-400">
                        {row?.categoryTitle ?? meta?.categoryName ?? ''}
                        {price ? ` · From ${price}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <SmallButton label={`Move ${title} up`} disabled={i === 0} onClick={() => items.move(i, i - 1)}>
                      <ArrowUp />
                    </SmallButton>
                    <SmallButton label={`Move ${title} down`} disabled={i === items.fields.length - 1} onClick={() => items.move(i, i + 1)}>
                      <ArrowDown />
                    </SmallButton>
                    <SmallButton label={`Remove ${title}`} onClick={() => items.remove(i)}>
                      <X />
                    </SmallButton>
                  </div>
                </div>
                {itemErrorMessage && <p className="mt-1 pl-10 text-sm text-red-400">{itemErrorMessage}</p>}
              </li>
            );
          })}
        </ul>
      )}

      <ServicePicker
        rows={rows}
        loading={loadingRows}
        selectedIds={selectedIds}
        disabled={items.fields.length >= 40}
        inputId={`section-${index}-search`}
        onAdd={(serviceId) => items.append({ service: serviceId, popular: false })}
      />
    </div>
  );
}

function SmallButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'grid h-8 w-8 flex-none place-items-center rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-30 disabled:hover:bg-transparent [&>svg]:h-4 [&>svg]:w-4',
        danger && 'hover:!bg-red-900/40 hover:!text-red-300',
      )}
    >
      {children}
    </button>
  );
}
