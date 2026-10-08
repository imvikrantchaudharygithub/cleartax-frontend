'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/app/components/admin/ConfirmDialog';

/**
 * Warns before leaving with unsaved changes: browser unload (native prompt) and in-app
 * <a> clicks (ConfirmDialog — never window.confirm, per the 2026-07-05 admin rule).
 * The capture-phase listener runs before Next's <Link> handler and stops it.
 */
export function useUnsavedChangesGuard(dirty: boolean): void {
  const confirm = useConfirm();
  const router = useRouter();
  const dirtyRef = useRef(dirty);

  // Synced after commit (react-hooks/refs forbids writing refs during render).
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    const onClick = async (event: MouseEvent) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      event.preventDefault();
      event.stopPropagation();
      const leave = await confirm({
        title: 'Discard unsaved changes?',
        message: 'You have edits that are not saved yet.',
        confirmLabel: 'Discard changes',
        cancelLabel: 'Keep editing',
        variant: 'warning',
      });
      if (leave) {
        dirtyRef.current = false;
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [confirm, router]);
}
