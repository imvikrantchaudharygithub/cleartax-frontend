import { isFvColor, type FvColor } from '../fv/colors';
import type { SolutionDetail } from '../api/types';

/** One card of the home "Most popular services" grid (`components/home/PopularServices`). */
export interface PopularServiceItem {
  id: string;
  title: string;
  description?: string;
  href: string;
  iconName?: string;
  color: FvColor;
  price?: { min?: number } | null;
  duration?: string;
}

/** The s3 mockup's popular grid: 8 cards, two full rows of 4 (its 9 ★ items de-duplicate to 8). */
export const POPULAR_LIMIT = 8;

const SAME_ORIGIN_PATH = /^\/(?![/\\])/;

/**
 * The ★ items of all published solutions for the home grid: in solution, then section, then item
 * order; de-duplicated by service id (the first occurrence and its solution colour win); capped at
 * `limit`. Items without an id, a title or an internal href are skipped so no card links nowhere.
 */
export function popularServiceItems(
  solutions: Pick<SolutionDetail, 'color' | 'sections'>[],
  limit: number = POPULAR_LIMIT,
): PopularServiceItem[] {
  const out: PopularServiceItem[] = [];
  const seen = new Set<string>();
  if (!(limit > 0)) return out;

  for (const solution of solutions ?? []) {
    const color: FvColor = isFvColor(solution?.color) ? solution.color : 'blue';
    for (const section of solution?.sections ?? []) {
      for (const item of section?.items ?? []) {
        if (!item?.popular || !item.id || !item.title || seen.has(item.id)) continue;
        // Same-origin paths only: "//host" and "/\host" are protocol-relative URLs to another site.
        if (typeof item.href !== 'string' || !SAME_ORIGIN_PATH.test(item.href)) continue;
        seen.add(item.id);
        out.push({
          id: item.id,
          title: item.title,
          description: item.shortDescription || undefined,
          href: item.href,
          iconName: item.iconName || undefined,
          color,
          price: item.price ? { min: item.price.min } : null,
          duration: item.duration || undefined,
        });
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
