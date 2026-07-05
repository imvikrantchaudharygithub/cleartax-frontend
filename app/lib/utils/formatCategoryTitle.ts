/**
 * Display-normalization for category / heading titles that may arrive from the
 * backend as raw slugs or lowercased strings (e.g. "registration Services",
 * "Ipo Services", "Banking finance Services").
 *
 * - Title-cases each word
 * - Uppercases known acronyms (GST, IPO, ITR, TDS, ...)
 * - Keeps small joining words lowercase (unless first word)
 * - Applies phrase fixes (e.g. "Banking Finance" -> "Banking & Finance")
 */

const ACRONYMS = new Set([
  'GST',
  'IPO',
  'ITR',
  'TDS',
  'LLP',
  'OPC',
  'NGO',
  'FSSAI',
  'IP',
  'IT',
  'ISO',
  'MSME',
  'PAN',
  'TAN',
  'ROC',
  'CA',
  'HRA',
  'EMI',
]);

const SMALL_WORDS = new Set(['and', 'or', 'of', 'the', 'for', 'in', 'on', 'to', 'a', 'an']);

// Phrase-level corrections applied after title-casing.
const PHRASE_FIXES: Array<[RegExp, string]> = [
  [/\bBanking Finance\b/g, 'Banking & Finance'],
];

export function formatCategoryTitle(raw: string | undefined | null): string {
  if (!raw) return '';

  const words = raw
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;

      const lower = word.toLowerCase();
      if (index > 0 && SMALL_WORDS.has(lower)) return lower;

      // Preserve intentional inner capitalization (e.g. "FinVidhi") while
      // fixing all-lowercase or first-letter-only words.
      if (/^[a-z]/.test(word)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return word;
    });

  let result = words.join(' ');
  for (const [pattern, replacement] of PHRASE_FIXES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export default formatCategoryTitle;
