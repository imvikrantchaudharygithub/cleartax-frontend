'use client';

import { forwardRef, useRef, type ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export { isIntentOnlyHref } from '@/app/lib/fv/intent';

type IntentLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'prefetch' | 'href'> & { href: string };

/**
 * A Link that never prefetches in the background (prefetch={false} also disables Next's own
 * hover prefetch), and prefetches its route on mouse/pen pointer-enter or focus instead.
 * Touch is deliberately not an intent signal: a scroll that starts on a card fires
 * pointerenter and touchstart, so a tap navigates normally without the warm-up.
 * Used for routes whose JS is heavy (e.g. /services pulls the icon namespace chunk).
 */
const IntentLink = forwardRef<HTMLAnchorElement, IntentLinkProps>(function IntentLink(
  { href, onPointerEnter, onFocus, ...rest },
  ref,
) {
  const router = useRouter();
  const warmed = useRef<string | null>(null);

  const warm = () => {
    if (warmed.current === href) return;
    warmed.current = href;
    router.prefetch(href);
  };

  return (
    <Link
      {...rest}
      ref={ref}
      href={href}
      prefetch={false}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') warm();
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
    />
  );
});

export default IntentLink;
