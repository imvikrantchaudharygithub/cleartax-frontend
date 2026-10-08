/** Pure (no React, no Next) so scripts/test-pure.sh can import it. */

/** /services* pulls a heavy icon chunk, so links to it prefetch on intent only (IntentLink). */
export function isIntentOnlyHref(href: string): boolean {
  return /^\/services(?:[/?#]|$)/.test(href);
}
