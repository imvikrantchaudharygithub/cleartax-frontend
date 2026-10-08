/** Category colours for the L3 layer. Blue/green/teal = logo palette (spec D2). */
export const FV_COLOR_KEYS = ['blue', 'purple', 'green', 'orange', 'red', 'teal', 'yellow', 'pink'] as const;
export type FvColor = (typeof FV_COLOR_KEYS)[number];

export const FV_COLOR_HEX: Record<FvColor, { fg: string; bg: string; pale: string }> = {
  blue: { fg: '#2587C4', bg: '#E8F4FB', pale: '#F3F9FD' },
  purple: { fg: '#7C4DFF', bg: '#EFE9FF', pale: '#F7F4FF' },
  green: { fg: '#58A651', bg: '#EAF5E8', pale: '#F4FAF3' },
  orange: { fg: '#F97316', bg: '#FFEEDD', pale: '#FFF8F0' },
  red: { fg: '#EF4444', bg: '#FFE7E7', pale: '#FFF5F5' },
  teal: { fg: '#3D8A6A', bg: '#EDF5F1', pale: '#F5FAF8' },
  yellow: { fg: '#D99A00', bg: '#FFF4D1', pale: '#FFFBEE' },
  pink: { fg: '#DB2777', bg: '#FCE7F3', pale: '#FFF5FA' },
};

export function isFvColor(value: unknown): value is FvColor {
  return typeof value === 'string' && (FV_COLOR_KEYS as readonly string[]).includes(value);
}

/** Deterministic colour for the i-th item of a list (cycles through the 8 keys). */
export function colorAt(index: number): FvColor {
  const n = FV_COLOR_KEYS.length;
  return FV_COLOR_KEYS[((index % n) + n) % n];
}

/** CSS custom properties consumed by IconTile / Tile / Explorer via var(--c) etc. */
export function fvColorVars(color: FvColor): Record<'--c' | '--cb' | '--cp', string> {
  const hex = FV_COLOR_HEX[color] ?? FV_COLOR_HEX.blue;
  return { '--c': hex.fg, '--cb': hex.bg, '--cp': hex.pale };
}
