export type RailLayout = 'none' | 'row' | 'grid' | 'scroll';

/** 1–4 → centred row · 5–8 → equal grid · 9+ → horizontal scroll (spec: Home rail). */
export function railLayout(count: number): RailLayout {
  if (!count || count < 1) return 'none';
  if (count <= 4) return 'row';
  if (count <= 8) return 'grid';
  return 'scroll';
}

/**
 * Tiles per row below lg (1024px), so short rows stay balanced: 5 → 3+2, 6 → 3+3, 7 → 4+3, 8 → 4+4.
 * ≤ 4 → one centred row of `count` · 5–6 → 3 · 7+ → 4 (9+ only wraps below md; md+ is the scroll row).
 */
export function railColumnsBelowLg(count: number): number {
  if (!count || count < 1) return 0;
  if (count <= 4) return count;
  if (count <= 6) return 3;
  return 4;
}
