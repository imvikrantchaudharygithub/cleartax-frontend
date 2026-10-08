'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// The <ul>'s md:-mx-2 puts its clip edge 8px outside this wrapper, hence -left-2 / -right-2.
// While a tile has keyboard focus the fades and arrows step aside, so no fade covers the focused
// tile or its ring (`:has(:focus-visible)` on the group/rail wrapper).
const FADE = clsx(
  'pointer-events-none absolute inset-y-0 hidden w-14 from-white to-transparent md:block',
  'group-has-[:focus-visible]/rail:opacity-0 motion-safe:transition-opacity motion-safe:duration-200',
);
// top-8 + h-9: centred on the 72px md tiles (ul p-2 8px + link md:py-1.5 6px + 36px = 50px = 32 + 18).
const ARROW = clsx(
  'absolute top-8 z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-fv-line bg-white text-fv-navy',
  'shadow-[0_4px_14px_rgba(30,44,89,.14)] hover:bg-fv-wash md:flex',
  'group-has-[:focus-visible]/rail:pointer-events-none group-has-[:focus-visible]/rail:opacity-0',
  'motion-safe:transition-opacity motion-safe:duration-200',
);

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll affordance for SolutionRail's 9+ scroll row (md and up): an edge fade plus an arrow on
 * each side that still has content to scroll to. The scroll container is the server-rendered <ul>
 * passed as `children` (this wrapper's first element); without JS it still scrolls as before.
 * Must not import IconTileByName / getIconFromName (the lucide namespace stays server-only).
 */
export default function RailScroller({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // Server HTML and first client render: no fades, no arrows (no hydration mismatch). The
  // ResizeObserver's initial callback does the first measurement.
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = wrapRef.current?.firstElementChild;
    if (!(el instanceof HTMLElement)) return;
    const update = () => {
      const { scrollLeft, clientWidth, scrollWidth } = el;
      setCanLeft(scrollLeft > 4);
      setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
    };
    // Focus scrolls a hidden tile into view, but Chrome leaves a tile that is only partly cut off
    // where it is. Once focus has settled, bring such a tile fully in (keyboard focus only).
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches(':focus-visible')) return;
      requestAnimationFrame(() => {
        const item = target.closest('li');
        if (!item || document.activeElement !== target) return;
        const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
        const box = el.getBoundingClientRect();
        const tile = item.getBoundingClientRect();
        if (tile.left >= box.left + pad - 1 && tile.right <= box.right - pad + 1) return;
        // inline 'start' lands on the tile's own snap position, so the mandatory snap keeps it there.
        item.scrollIntoView({ block: 'nearest', inline: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
      });
    };
    el.addEventListener('scroll', update, { passive: true });
    el.addEventListener('focusin', onFocusIn);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      el.removeEventListener('focusin', onFocusIn);
      observer.disconnect();
    };
  }, []);

  const scrollPage = (direction: -1 | 1) => {
    const el = wrapRef.current?.firstElementChild;
    if (!(el instanceof HTMLElement)) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  // Arrows are a pointer-only affordance (tabIndex -1, aria-hidden): every tile is a focusable link
  // and focusing one scrolls it into view (the ul's scroll-px-2, plus onFocusIn above), so keyboard
  // and screen-reader users never need them. preventDefault on mousedown keeps focus off them.
  const arrow = (direction: -1 | 1, shown: boolean) => (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      aria-label={direction < 0 ? 'Scroll solutions left' : 'Scroll solutions right'}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => scrollPage(direction)}
      className={clsx(ARROW, direction < 0 ? 'left-0' : 'right-0', shown ? 'opacity-100' : 'pointer-events-none opacity-0')}
    >
      {direction < 0 ? <ChevronLeft className="h-5 w-5" aria-hidden="true" /> : <ChevronRight className="h-5 w-5" aria-hidden="true" />}
    </button>
  );

  return (
    <div ref={wrapRef} className="group/rail relative">
      {children}
      <div aria-hidden="true" className={clsx(FADE, '-left-2 bg-gradient-to-r', canLeft ? 'opacity-100' : 'opacity-0')} />
      <div aria-hidden="true" className={clsx(FADE, '-right-2 bg-gradient-to-l', canRight ? 'opacity-100' : 'opacity-0')} />
      {arrow(-1, canLeft)}
      {arrow(1, canRight)}
    </div>
  );
}
