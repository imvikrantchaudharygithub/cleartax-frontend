'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowDown, ArrowUp, ExternalLink, Loader2, Pencil, Plus, Rocket, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import IconTileByName from '@/app/components/fv/IconTileByName';
import { useConfirm } from '@/app/components/admin/ConfirmDialog';
import { solutionService } from '@/app/lib/api/services/solution.service';
import { isFvColor } from '@/app/lib/fv/colors';
import { plural } from '@/app/lib/fv/text';
import type { SolutionAdminRow } from '@/app/lib/api/types';

export default function SolutionsAdminPage() {
  const confirm = useConfirm();
  const [rows, setRows] = useState<SolutionAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await solutionService.listAdmin());
    } catch (err: any) {
      setError(err?.message || 'Failed to load solutions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const ids = rows.map((row) => row._id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusy('reorder');
    try {
      const reordered = await solutionService.reorder(ids);
      // A full list replaces the rows; an empty or partial answer would blank / shrink them, so
      // re-read the stored order instead.
      if (Array.isArray(reordered) && reordered.length === ids.length) setRows(reordered);
      else await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the order');
      // Usually a stale list (a solution added or deleted elsewhere): every later move would fail
      // the same way until the list is re-read.
      await load();
    } finally {
      setBusy(null);
    }
  };

  const toggleHome = async (row: SolutionAdminRow) => {
    setBusy(row._id);
    try {
      await solutionService.update(row._id, { showOnHome: !row.showOnHome });
      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, showOnHome: !r.showOnHome } : r)));
      toast.success(row.showOnHome ? 'Hidden from the home page' : 'Shown on the home page');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update the solution');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (row: SolutionAdminRow) => {
    const confirmed = await confirm({
      title: `Delete "${row.title}"?`,
      message: 'Its page stops working and its icon disappears from the home page. The services themselves are not affected.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;
    setBusy(row._id);
    try {
      await solutionService.remove(row._id);
      setRows((prev) => prev.filter((r) => r._id !== row._id));
      toast.success('Solution deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete the solution');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Solutions</h1>
          <p className="text-gray-400">Curated bundles of services shown on the home banner and at /solutions/&lt;url&gt;.</p>
        </div>
        <Link
          href="/admin/solutions/new"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500"
        >
          <Plus className="h-5 w-5" />
          Add Solution
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-red-300">
          {error}{' '}
          <button type="button" onClick={load} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800/50 p-12 text-center">
          <Rocket className="mx-auto mb-3 h-10 w-10 text-gray-500" />
          <p className="mb-4 text-gray-300">No solutions yet.</p>
          <Link href="/admin/solutions/new" prefetch={false} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500">
            <Plus className="h-5 w-5" />
            Add your first solution
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-700 overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
          {rows.map((row, index) => (
            <li key={row._id} className="flex flex-wrap items-center gap-4 p-4">
              <IconTileByName name={row.iconName} color={isFvColor(row.color) ? row.color : 'blue'} size="md" solid />
              {/* 12rem basis (not flex-1's 0%): on phones the toggle wraps below instead of squeezing the title. */}
              <div className="min-w-0 flex-[1_1_12rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold text-white">{row.title}</h2>
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      row.status === 'published' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-300',
                    )}
                  >
                    {row.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="truncate font-mono text-sm text-gray-400">/solutions/{row.slug}</p>
                <p className={clsx('mt-1 flex items-center gap-1 text-sm', row.unavailableCount > 0 ? 'text-amber-300' : 'text-gray-400')}>
                  {row.unavailableCount > 0 && <AlertTriangle className="h-4 w-4" />}
                  {plural(row.itemCount, 'service')}
                  {row.unavailableCount > 0 ? ` · ${row.unavailableCount} unavailable` : ''}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.showOnHome}
                  aria-label={`Show ${row.title} on the home page`}
                  disabled={busy !== null}
                  onClick={() => toggleHome(row)}
                  className={clsx('relative h-6 w-11 rounded-full transition-colors disabled:opacity-50', row.showOnHome ? 'bg-blue-600' : 'bg-gray-600')}
                >
                  <span className={clsx('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all', row.showOnHome ? 'left-[22px]' : 'left-0.5')} />
                </button>
                Home
              </label>
              <div className="flex items-center gap-1">
                <IconAction label="Move up" disabled={index === 0 || busy !== null} onClick={() => move(index, -1)}>
                  <ArrowUp />
                </IconAction>
                <IconAction label="Move down" disabled={index === rows.length - 1 || busy !== null} onClick={() => move(index, 1)}>
                  <ArrowDown />
                </IconAction>
                {row.status === 'published' && (
                  <a
                    href={`/solutions/${row.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${row.title}`}
                    title="View page"
                    className="grid h-9 w-9 place-items-center rounded-md text-gray-400 hover:bg-gray-700 hover:text-white [&>svg]:h-4 [&>svg]:w-4"
                  >
                    <ExternalLink />
                  </a>
                )}
                <Link
                  href={`/admin/solutions/${row._id}`}
                  prefetch={false}
                  aria-label={`Edit ${row.title}`}
                  title="Edit"
                  className="grid h-9 w-9 place-items-center rounded-md text-blue-400 hover:bg-gray-700 hover:text-blue-300 [&>svg]:h-4 [&>svg]:w-4"
                >
                  <Pencil />
                </Link>
                <IconAction label={`Delete ${row.title}`} danger disabled={busy !== null} onClick={() => remove(row)}>
                  <Trash2 />
                </IconAction>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconAction({
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
        'grid h-9 w-9 place-items-center rounded-md text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent [&>svg]:h-4 [&>svg]:w-4',
        danger && 'hover:!bg-red-900/40 hover:!text-red-300',
      )}
    >
      {children}
    </button>
  );
}
