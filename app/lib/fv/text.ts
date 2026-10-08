/**
 * Pure text helpers for the L3 design layer. No React, no imports, so they
 * run under scripts/test-pure.sh. Spec: docs/superpowers/specs/2026-10-05-l3-site-redesign-design.md
 */

/** Words that must not begin the blue second line of a heading. */
const JOINERS = new Set(['&', 'and', 'of', 'or']);

/**
 * Split after the comma closest to the middle of the text (by characters), keeping at
 * least 2 words on each line. Returns null when no comma qualifies.
 */
function commaSplit(words: string[], length: number): [string, string] | null {
  let best = -1;
  let bestDistance = Infinity;
  let lineLength = 0;
  for (let i = 0; i < words.length - 2; i++) {
    lineLength += (i ? 1 : 0) + words[i].length;
    if (i < 1 || !words[i].endsWith(',')) continue;
    const distance = Math.abs(lineLength - length / 2);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  if (best < 0) return null;
  return [words.slice(0, best + 1).join(' '), words.slice(best + 1).join(' ')];
}

/** Split a hero heading into two display lines; line 2 renders in brand blue. */
export function splitHeading(heading: string): [string, string] {
  const text = (heading ?? '').trim().replace(/\s+/g, ' ');
  if (!text) return ['', ''];
  const sentence = text.match(/^(.+?[.!?])\s+(.+)$/);
  if (sentence) return [sentence[1], sentence[2]];
  const words = text.split(' ');
  if (words.length < 3) return [text, ''];
  const comma = commaSplit(words, text.length);
  if (comma) return comma;
  let k = Math.ceil(words.length / 2);
  if (k < words.length - 1 && JOINERS.has(words[k].toLowerCase())) k += 1;
  return [words.slice(0, k).join(' '), words.slice(k).join(' ')];
}

/** Home hero subline: the description's 2nd paragraph if it has one, else the 1st, else ''. */
export function heroSubline(description?: string | null): string {
  const paragraphs = (description ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs[1] ?? paragraphs[0] ?? '';
}

/** "1M+ Invoices Processed" → { value: "1M+", label: "Invoices Processed" }. */
export function splitStat(text: string): { value: string; label: string } {
  const t = (text ?? '').trim().replace(/\s+/g, ' ');
  const [first = '', ...rest] = t.split(' ');
  if (/\d/.test(first)) return { value: first, label: rest.join(' ') };
  return { value: '', label: t };
}

export function plural(n: number, word: string): string {
  return `${n} ${n === 1 ? word : `${word}s`}`;
}

export function formatINR(n: number): string {
  return `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
}

/** "₹6,999" for a positive starting price; null means show "Price on request". */
export function formatFromPrice(price?: { min?: number } | null): string | null {
  const min = Number(price?.min);
  return Number.isFinite(min) && min > 0 ? formatINR(min) : null;
}

export interface StatLike {
  value: number;
  prefix?: string;
  suffix?: string;
  label?: string;
}

// Labels that are counts, not money: a ₹ prefix on them is a data-entry mistake
// (e.g. "₹1,000+ Companies Incorporated"). Same rule as the old StatsSection.
const COUNT_LABEL_PATTERN = /incorporated|filed|registrations?|clients|companies|businesses/i;

export function sanitizeStatPrefix(stat: StatLike): string {
  const prefix = stat.prefix || '';
  return prefix === '₹' && stat.label && COUNT_LABEL_PATTERN.test(stat.label) ? '' : prefix;
}

export function formatStatValue(stat: StatLike): string {
  const value = Number(stat.value) || 0;
  const decimals = Number.isInteger(value) ? 0 : (String(value).split('.')[1]?.length ?? 0);
  const number = value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${sanitizeStatPrefix(stat)}${number}${stat.suffix || ''}`;
}
