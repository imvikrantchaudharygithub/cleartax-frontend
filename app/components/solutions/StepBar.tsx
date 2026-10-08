'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { clsx } from 'clsx';

/** Distance from the viewport top to the "reading line": nav (68) + this bar (61) + a little air. */
const LINE = 150;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Sticky numbered step chips under the nav (design 3 `.stepper`). An IntersectionObserver watches
 * a 1px reading line; the step under it is current (steps sit edge to edge), so scrolling up or
 * down both update it. Click → smooth scroll (instant under reduced motion). On narrow screens the
 * chips scroll sideways and the current one stays in view.
 */
export default function StepBar({ steps }: { steps: { id: string; label: string }[] }) {
  const [active, setActive] = useState(steps[0]?.id);
  const listRef = useRef<HTMLOListElement>(null);
  // After a chip click, ignore the observer while the smooth scroll passes the steps in between.
  const lockUntil = useRef(0);
  const ids = steps.map((s) => s.id).join(',');

  useEffect(() => {
    const elements = ids
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;

    // The observer only says "a step crossed the line"; geometry decides which step is current:
    // the last one whose top is above the line, else the first. That also covers jumps (Home key,
    // focus scroll) that leave the line above step 1 or below the last step, where no entry
    // reports an intersection. A short last step may never reach the line, so at the very end of
    // the page the last step is current.
    // A scroll lock (the callback modal fixes <body>) leaves nothing to scroll: not "the end".
    const atEnd = () => {
      const height = document.documentElement.scrollHeight;
      return height > window.innerHeight + 2 && window.innerHeight + window.scrollY >= height - 2;
    };
    const update = () => {
      if (Date.now() < lockUntil.current) return;
      let current = elements[0];
      for (const el of elements) if (el.getBoundingClientRect().top <= LINE + 1) current = el;
      if (atEnd()) current = elements[elements.length - 1];
      setActive(current.id);
    };
    // Only reacts when the "at the end" state flips; the observer handles everything else.
    let wasAtEnd = atEnd();
    const onScroll = () => {
      const now = atEnd();
      if (now === wasAtEnd) return;
      wasAtEnd = now;
      update();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      const below = Math.max(0, window.innerHeight - LINE - 1);
      observer = new IntersectionObserver(update, { rootMargin: `-${LINE}px 0px -${below}px 0px` });
      elements.forEach((el) => observer?.observe(el));
    };
    observe();
    window.addEventListener('resize', observe);
    return () => {
      window.removeEventListener('resize', observe);
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, [ids]);

  // Keep the current chip visible in the sideways-scrolling bar (mobile).
  useEffect(() => {
    const list = listRef.current;
    const chip = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !chip) return;
    const l = list.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    if (c.left >= l.left && c.right <= l.right) return;
    list.scrollBy({ left: c.left - l.left - 16, behavior: reducedMotion() ? 'instant' : 'smooth' });
  }, [active]);

  const go = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = reducedMotion();
    lockUntil.current = reduce ? 0 : Date.now() + 900;
    target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    // preventDefault also cancelled the anchor's focus move: put focus on the step (tabIndex -1)
    // so the next Tab continues inside it, not on the next chip.
    target.focus({ preventScroll: true });
    history.replaceState(history.state, '', `#${id}`);
    setActive(id);
  };

  if (steps.length < 2) return null;

  return (
    <nav aria-label="Steps" className="sticky top-[68px] z-30 border-b border-fv-line bg-white/95 backdrop-blur">
      <ol
        ref={listRef}
        className="fv-wrap flex gap-1.5 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((step, i) => {
          const on = active === step.id;
          return (
            <li key={step.id} className="flex-none">
              <a
                href={`#${step.id}`}
                onClick={go(step.id)}
                aria-current={on ? 'step' : undefined}
                className={clsx(
                  'flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3 text-[13.5px] font-semibold transition-colors',
                  on ? 'bg-fv-blue-50 text-fv-blue-d' : 'text-fv-slate hover:text-fv-navy',
                )}
              >
                <span
                  className={clsx(
                    'grid h-6 w-6 place-items-center rounded-full border text-xs font-extrabold',
                    on ? 'border-fv-blue-d bg-fv-blue-d text-white' : 'border-fv-line bg-fv-wash text-fv-navy',
                  )}
                >
                  {i + 1}
                </span>
                {step.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
