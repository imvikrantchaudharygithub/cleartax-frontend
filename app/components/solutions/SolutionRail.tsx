import Link from 'next/link';
import { clsx } from 'clsx';
import IconTileByName from '@/app/components/fv/IconTileByName';
import RailScroller from '@/app/components/solutions/RailScroller';
import { isFvColor } from '@/app/lib/fv/colors';
import { plural } from '@/app/lib/fv/text';
import { railColumnsBelowLg, railLayout } from '@/app/lib/solutions/rail';
import type { SolutionSummary } from '@/app/lib/api/types';

// s3 `.rb`: a glossy 3D app tile (light → colour → dark, inset highlight, coloured glow). Rail only:
// IconTile's plain `solid` look stays as it is for LightHero / ServiceHero.
const RAIL_TILE = clsx(
  '!bg-[linear-gradient(145deg,color-mix(in_srgb,var(--c)_65%,#fff),var(--c)_50%,color-mix(in_srgb,var(--c)_75%,#000))]',
  '!shadow-[inset_0_2px_0_rgba(255,255,255,.45),inset_0_-6px_12px_rgba(0,0,0,.15),0_12px_22px_color-mix(in_srgb,var(--c)_35%,transparent)]',
  'transition-transform duration-200 motion-safe:group-hover:-translate-y-1 motion-safe:group-focus-visible:-translate-y-1',
  'max-md:!h-14 max-md:!w-14 max-md:!rounded-[18px] max-md:[&>svg]:!h-6 max-md:[&>svg]:!w-6',
);

/**
 * App-style solution icons on the home hero's bottom edge (design 3 "Icon Rail", s3 `.rail/.ri/.rb`).
 * Rendered inside HomeHero's `.fv-wrap`, so it adds no container of its own. Server component:
 * IconTileByName (the lucide namespace) stays out of the client bundle.
 * 1–4 → centred row · 5–8 → 8 equal columns (below lg: 3 per row for 5–6, 4 for 7–8) · 9+ →
 * horizontal scroll from md, with edge fades and pointer arrows (RailScroller, client).
 */
export default function SolutionRail({ solutions }: { solutions: SolutionSummary[] }) {
  const layout = railLayout(solutions.length);
  if (layout === 'none') return null;
  // Columns below lg (railColumnsBelowLg): 3 for 5–6 solutions (3+2, 3+3). Every other count keeps the
  // 1/4 column: 1–4 stay one centred row, 7–8 wrap 4+3 / 4+4, 9+ wraps 4 per row below md.
  // Width = (100% − gutters) / columns, gutters being gap-x-1.5 (6px) below md and md:gap-x-3 (12px).
  const threeUp = layout === 'grid' && railColumnsBelowLg(solutions.length) === 3;

  const list = (
    <ul
      className={clsx(
        'flex flex-wrap justify-center gap-x-1.5 gap-y-3.5 md:gap-x-3 md:gap-y-[18px]',
        // Scroll row: overflow-x:auto also clips y, so p-2 keeps the focus ring (2px + 2px offset)
        // inside the clip box; -mx-2/-mt-2 cancel it so nothing shifts, and scroll-px-2 keeps that
        // room when snapping or scrolling a focused tile into view.
        layout === 'scroll' &&
          'md:-mx-2 md:-mt-2 md:flex-nowrap md:justify-start md:overflow-x-auto md:scroll-px-2 md:p-2 md:[scroll-snap-type:x_mandatory]',
      )}
    >
      {solutions.map((solution) => (
        <li
          key={solution.slug}
          className={clsx(
            'min-w-0',
            threeUp ? 'w-[calc((100%-0.75rem)/3)]' : 'w-[calc((100%-1.125rem)/4)]',
            layout === 'scroll'
              ? 'md:w-[116px] md:flex-none md:[scroll-snap-align:start]'
              : clsx(
                  threeUp ? 'md:w-[calc((100%-1.5rem)/3)]' : 'md:w-[calc((100%-2.25rem)/4)]',
                  'lg:w-[calc((100%-5.25rem)/8)]',
                ),
          )}
        >
          <Link
            href={`/solutions/${solution.slug}`}
            className="group flex flex-col items-center gap-[7px] rounded-[14px] p-0.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d focus-visible:ring-offset-2 md:gap-2.5 md:px-1 md:py-1.5"
          >
            <IconTileByName
              name={solution.iconName}
              color={isFvColor(solution.color) ? solution.color : 'blue'}
              size="xl"
              solid
              className={RAIL_TILE}
            />
            {/* A word wider than its column ("Incorporation" at 320) breaks instead of overlapping the
                next one. Cap = the link's content box + 8px: the column at md+, and below md the column
                + 2px of each 6px gutter (neighbours stay ≥ 2px apart). break-words, not
                overflow-wrap:anywhere (which shrinks min-content to the content box and so broke words
                that fit their column at 360), leaves every word that fits unbroken, as before. */}
            <span className="line-clamp-2 max-w-[calc(100%+8px)] break-words text-xs font-bold leading-tight text-fv-navy md:text-sm">
              {solution.title}
            </span>
            <span className="-mt-1 whitespace-nowrap text-[11px] text-fv-slate md:-mt-1.5 md:text-xs">
              {plural(solution.serviceCount, 'service')}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <nav
      id="solutions"
      aria-label="Solutions"
      className="scroll-mt-24 rounded-t-[22px] border border-b-0 border-fv-line bg-white px-2.5 pb-[18px] pt-4 shadow-[0_-10px_40px_rgba(30,44,89,.06)] md:px-[18px] md:pb-6 md:pt-[22px]"
    >
      {/* RailScroller's wrapper has no padding, border or BFC, so the ul's -mt-2 still collapses
          through it and the row sits exactly where it did without the wrapper. */}
      {layout === 'scroll' ? <RailScroller>{list}</RailScroller> : list}
    </nav>
  );
}
