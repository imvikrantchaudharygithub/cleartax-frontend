'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

/** Sticky in-page tab bar for service detail pages (anchor links, content stays crawlable). */
export default function ServiceSectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const ids = sections.map((s) => s.id).join(',');

  useEffect(() => {
    const elements = ids
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: '-120px 0px -60% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  if (sections.length < 2) return null;

  return (
    <nav aria-label="On this page" className="sticky top-[68px] z-30 border-b border-fv-line bg-white/95 backdrop-blur">
      <ul className="fv-wrap flex gap-1 overflow-x-auto py-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? 'true' : undefined}
              className={clsx(
                'block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                active === section.id ? 'bg-fv-blue-50 text-fv-blue-d' : 'text-fv-slate hover:text-fv-navy',
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
