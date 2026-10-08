# L3 "Service Hub" Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin every public FinVidhi page in the L3 "Service Hub" design language (logo colours, Inter, light washes, one card language) without touching data logic or the admin panel.

**Architecture:** A public-only `fv` design layer: Tailwind `fv-*` tokens, a `.fv-site` wrapper that switches fonts by redefining CSS variables, and small primitives in `app/components/fv/`. Shared components (`PageHero`, `ServiceHero` family, `Breadcrumb`, `ui/Card`, `LegalPage`, nav, footer) are restyled in place, so most pages change without edits. The home page is recomposed from the primitives. The 10 copy-pasted service-detail bodies become one `ServiceDetailBody`. A reviewable codemod handles the long tail of class swaps.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 3.4, lucide-react, framer-motion (kept only where already used), Node 20 built-in test runner for pure helpers.

**Spec:** `docs/superpowers/specs/2026-10-05-l3-site-redesign-design.md` (read it first; decisions D1–D6 are binding).

## Global Constraints

- **No `git commit` / `git push` at any point.** Vikrant reviews the running site locally first. Every "checkpoint" step replaces the usual commit step.
- **No new npm dependencies.** Tests use `node:test` + `tsc`. The audit uses the `playwright-core` already in the npx cache plus the installed Google Chrome.
- **Admin must not change.** Never edit anything under `app/(admin)`, `app/(admin-public)`, `app/components/admin`, `app/lib/admin`, or `ui/Button.tsx`, `ui/Input.tsx`, `ui/TextArea.tsx`. Before the final checkpoint, `git status --porcelain -- 'app/(admin)' 'app/(admin-public)' app/components/admin app/lib/admin app/components/ui/Button.tsx app/components/ui/Input.tsx app/components/ui/TextArea.tsx` must print nothing.
- Tokens (exact): `fv-navy #1E2C59` · `fv-blue #2587C4` · `fv-blue-d #1E6C9D` · `fv-blue-dd #175176` · `fv-blue-50 #E8F4FB` · `fv-wash #F3F9FD` · `fv-slate #55627A` · `fv-muted #8A94A8` · `fv-line #E6ECF5` · `fv-green #58A651` · `fv-green-d #3E7B39` · `fv-green-50 #EAF5E8`.
- Category colours (exact, `fg/bg/pale`): blue `#2587C4/#E8F4FB/#F3F9FD` · purple `#7C4DFF/#EFE9FF/#F7F4FF` · green `#58A651/#EAF5E8/#F4FAF3` · orange `#F97316/#FFEEDD/#FFF8F0` · red `#EF4444/#FFE7E7/#FFF5F5` · teal `#3D8A6A/#EDF5F1/#F5FAF8` · yellow `#D99A00/#FFF4D1/#FFFBEE` · pink `#DB2777/#FCE7F3/#FFF5FA`.
- `fv-blue` (#2587C4) is never used for text smaller than 24px regular / 18.66px bold. Small links and button backgrounds use `fv-blue-d`.
- Data fetching, route params, `metadata` / `generateMetadata`, `revalidate`, JSON-LD and inquiry / callback submission code are copied **verbatim**. Only JSX and classes change.
- DB-driven icon names are rendered **only** through `getIconFromName` (`app/lib/utils/apiDataConverter.ts`), which carries the "Icon"-crash blocklist.
- No `useSearchParams` in new code (it broke `next build` on 2026-06-02).
- Mobile inputs are ≥16px. `prefers-reduced-motion` stays respected. Every interactive element is keyboard reachable with a visible focus ring.
- Currency is shown as `₹` with `en-IN` grouping.

## Review Focus

1. **Form submit buttons:** `ui/Button` rendered a `<motion.button>` with no `type`, so inside a `<form>` it submits. `fv/Button` must **not** default `type` to `"button"`, or the contact, calculator and service forms silently stop submitting. Pinned in Task 3, Step 4 and checked in Task 12, Step 4.
2. **Missing CMS data:** with `homeInfo` null, empty IPO / Legal / Banking subcategories, no team and no hero chips, the home page must still render (defaults, omitted areas, no crash). Pinned by the `buildExplorerAreas` tests (Task 5) and the home render check in Task 12.
3. **Zero-price and zero-count rows:** a ₹0 service must read "Price on request" (not "From ₹0"), and a subcategory with 0 published services must not appear in the explorer (it leads to an empty page). Pinned by the `formatFromPrice` tests (Task 1) and the explorer tests (Task 5).
4. **Long strings at 390px:** long service titles ("Digital Signature Certificate (DSC) Registration"), long headings and the 7-item Services menu must not cause horizontal overflow. Pinned by the 6-width overflow audit (Task 12).
5. **Keyboard-only use:** nav dropdowns (Enter / Escape / Tab-out), explorer tabs (arrow keys, Home / End), the FAQ accordion and the mobile drawer must be operable without a mouse. Pinned by the keyboard checklist in Task 12, Step 5.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `scripts/test-pure.sh` | create | Compile pure TS modules + `tests/*.test.ts` with `tsc`, run `node --test` |
| `tests/fv-text.test.ts`, `tests/fv-colors.test.ts`, `tests/fv-explorer.test.ts` | create | Unit tests for the pure helpers |
| `app/lib/fv/text.ts` | create | `splitHeading`, `splitStat`, `plural`, `formatINR`, `formatFromPrice`, `formatStatValue`, `sanitizeStatPrefix` |
| `app/lib/fv/colors.ts` | create | Category colour keys, hex map, `colorAt`, `isFvColor`, `fvColorVars` |
| `app/lib/fv/explorer.ts` | create | `buildExplorerAreas()`: maps home CMS data to explorer areas |
| `app/lib/fv/homeDefaults.ts` | create | Fallback banner / services / stats / benefits (copied from the old components) |
| `tailwind.config.ts`, `app/globals.css`, `app/(site)/layout.tsx`, `.gitignore` | modify | Tokens, `.fv-site` / `.fv-wrap` / `.fv-card`, wrapper, ignore `.test-out/` |
| `app/components/fv/{Button,Section,SectionHead,IconTile,Tile,Pill,LightHero,SearchBar,StatsStrip,CTASplit,Explorer}.tsx` | create | Design primitives |
| `app/components/common/{Navigation,Footer,Breadcrumb,PageHero}.tsx` | rewrite | Site shell |
| `app/components/home/{HomeHero,DashboardCard}.tsx` | create | L3 hero + dashboard card |
| `app/components/home/{BenefitsSection,TeamSection,TestimonialsSection,GovPortalsSection}.tsx`, `app/components/team/TeamCard.tsx` | rewrite render | L3 sections; data logic kept |
| `app/(site)/page.tsx` | rewrite | New home composition |
| `app/components/ui/Card.tsx` | rewrite | `fv-card` surface, same props |
| `app/components/services/{ServiceHero,ServiceCard,ServiceFeatures,ProcessTimeline,FAQAccordion,RelatedServices}.tsx` | rewrite | Light service family, same props (+ optional `subcategory` on RelatedServices) |
| `app/components/services/ServiceForm.tsx` | modify | Card surface + heading classes |
| `app/components/services/{ServiceDetailBody,ServiceSectionNav,CategoryHero}.tsx` | create | Shared detail body, in-page tab bar, category hero |
| `app/(site)/services/[category]/[slug]/[serviceSlug]/page.tsx`, `.../[slug]/page.tsx`, `.../[category]/page.tsx`, 8 × `services/gst/*/page.tsx` | modify | Use `ServiceDetailBody` / `CategoryHero`; JSX only |
| `app/components/services/AllServicesClient.tsx` | modify | New hero + grid JSX, `?q=` prefill |
| `app/components/legal/LegalPage.tsx`, `app/not-found.tsx` | rewrite | Light versions |
| `scripts/fv-restyle.mjs` | create | Codemod for the long-tail public files |
| `scripts/fv-audit.cjs` | create | Screenshot + horizontal-overflow audit at 6 widths |

The old home components `HeroSection`, `ServicesSection`, `StatsSection`, `IPOSection`, `LegalSection`, `BankingFinanceSection`, `CTASection` and `ProductsGrid` stop being rendered but **stay on disk** (trivial revert; Vikrant decides about deleting them at review).

---

### Task 1: Pure text helpers + test harness

**Files:**
- Create: `scripts/test-pure.sh`, `app/lib/fv/text.ts`, `tests/fv-text.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces (used by Tasks 3–9 and by the Solutions plan):
  - `splitHeading(heading: string): [string, string]`
  - `splitStat(text: string): { value: string; label: string }`
  - `plural(n: number, word: string): string`
  - `formatINR(n: number): string` → `'₹6,999'`
  - `formatFromPrice(price?: { min?: number } | null): string | null` → `'₹6,999'`, or `null` when missing or ≤ 0
  - `interface StatLike { value: number; prefix?: string; suffix?: string; label?: string }`
  - `sanitizeStatPrefix(stat: StatLike): string`
  - `formatStatValue(stat: StatLike): string`

- [ ] **Step 1: Create the test harness**

`scripts/test-pure.sh`:
```bash
#!/usr/bin/env bash
# Runs unit tests for dependency-free TS modules without adding a test framework:
# compile tests/*.test.ts (and whatever they import) to .test-out/ with tsc, then
# run Node's built-in test runner. Pure modules must use relative imports only.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf .test-out
npx tsc --outDir .test-out --rootDir . --module commonjs --target es2020 \
  --strict --esModuleInterop --skipLibCheck --types node tests/*.test.ts
node --test .test-out/tests/*.test.js
```
Run: `chmod +x scripts/test-pure.sh && printf '\n# pure-helper test build output\n.test-out/\n' >> .gitignore`

- [ ] **Step 2: Write the failing tests**

`tests/fv-text.test.ts`:
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitHeading,
  splitStat,
  plural,
  formatINR,
  formatFromPrice,
  formatStatValue,
  sanitizeStatPrefix,
} from '../app/lib/fv/text';

test('splitHeading splits after the first sentence', () => {
  assert.deepEqual(splitHeading('Smart Finance. Strong Compliance.'), ['Smart Finance.', 'Strong Compliance.']);
  assert.deepEqual(splitHeading('Wait! Really now'), ['Wait!', 'Really now']);
});

test('splitHeading halves long single sentences; line 2 never starts with a joiner', () => {
  assert.deepEqual(splitHeading('Your Complete Tax & Compliance Solution'), ['Your Complete Tax &', 'Compliance Solution']);
  assert.deepEqual(splitHeading('Start Your Business The Right Way'), ['Start Your Business', 'The Right Way']);
});

test('splitHeading keeps short or empty headings on one line', () => {
  assert.deepEqual(splitHeading('Hello world'), ['Hello world', '']);
  assert.deepEqual(splitHeading('   '), ['', '']);
  assert.deepEqual(splitHeading(undefined as unknown as string), ['', '']);
});

test('splitStat separates a leading number token', () => {
  assert.deepEqual(splitStat('1M+ Invoices Processed'), { value: '1M+', label: 'Invoices Processed' });
  assert.deepEqual(splitStat('  50,000+   Registrations '), { value: '50,000+', label: 'Registrations' });
  assert.deepEqual(splitStat('5K+'), { value: '5K+', label: '' });
  assert.deepEqual(splitStat('Expert CA Team'), { value: '', label: 'Expert CA Team' });
});

test('plural', () => {
  assert.equal(plural(1, 'service'), '1 service');
  assert.equal(plural(0, 'service'), '0 services');
  assert.equal(plural(22, 'service'), '22 services');
});

test('formatINR uses Indian grouping', () => {
  assert.equal(formatINR(6999), '₹6,999');
  assert.equal(formatINR(150000), '₹1,50,000');
  assert.equal(formatINR(299.6), '₹300');
});

test('formatFromPrice returns null for missing or non-positive prices', () => {
  assert.equal(formatFromPrice({ min: 4999 }), '₹4,999');
  assert.equal(formatFromPrice({ min: 0 }), null);
  assert.equal(formatFromPrice({}), null);
  assert.equal(formatFromPrice(null), null);
});

test('stat prefix: ₹ is stripped from count-like labels only', () => {
  assert.equal(sanitizeStatPrefix({ value: 1000, prefix: '₹', label: 'Companies Incorporated' }), '');
  assert.equal(sanitizeStatPrefix({ value: 27, prefix: '₹', label: 'Trade Value' }), '₹');
});

test('formatStatValue keeps decimals and Indian grouping', () => {
  assert.equal(formatStatValue({ value: 99.99, suffix: '%' }), '99.99%');
  assert.equal(formatStatValue({ value: 1000, prefix: '₹', suffix: '+', label: 'Companies Incorporated' }), '1,000+');
  assert.equal(formatStatValue({ value: 50000, suffix: '+' }), '50,000+');
  assert.equal(formatStatValue({ value: 24, suffix: '*7' }), '24*7');
  assert.equal(formatStatValue({ value: 27, prefix: '₹', suffix: 'Cr+', label: 'Trade Value' }), '₹27Cr+');
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `./scripts/test-pure.sh`
Expected: tsc error `Cannot find module '../app/lib/fv/text'`.

- [ ] **Step 4: Implement**

`app/lib/fv/text.ts`:
```ts
/**
 * Pure text helpers for the L3 design layer. No React, no imports, so they
 * run under scripts/test-pure.sh. Spec: docs/superpowers/specs/2026-10-05-l3-site-redesign-design.md
 */

/** Words that must not begin the blue second line of a heading. */
const JOINERS = new Set(['&', 'and', 'of', 'or']);

/** Split a hero heading into two display lines; line 2 renders in brand blue. */
export function splitHeading(heading: string): [string, string] {
  const text = (heading ?? '').trim().replace(/\s+/g, ' ');
  if (!text) return ['', ''];
  const sentence = text.match(/^(.+?[.!?])\s+(.+)$/);
  if (sentence) return [sentence[1], sentence[2]];
  const words = text.split(' ');
  if (words.length < 3) return [text, ''];
  let k = Math.ceil(words.length / 2);
  if (k < words.length - 1 && JOINERS.has(words[k].toLowerCase())) k += 1;
  return [words.slice(0, k).join(' '), words.slice(k).join(' ')];
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
```

- [ ] **Step 5: Run to verify it passes**

Run: `./scripts/test-pure.sh`
Expected: `# pass 9`, `# fail 0`.

- [ ] **Step 6: Checkpoint (no commit)**

Run: `git status --short` and check that only `.gitignore`, `scripts/test-pure.sh`, `tests/fv-text.test.ts` and `app/lib/fv/text.ts` changed.

---

### Task 2: Design tokens, global classes, public wrapper

**Files:**
- Modify: `tailwind.config.ts` (inside `theme.extend.colors` and `theme.extend.boxShadow`), `app/globals.css` (append), `app/(site)/layout.tsx`

**Interfaces:**
- Produces: Tailwind colours `fv-*` (see Global Constraints); shadows `shadow-fv-card`, `shadow-fv-raised`, `shadow-fv-btn`; CSS classes `.fv-site`, `.fv-wrap`, `.fv-card`.

- [ ] **Step 1: Add the tokens**

In `tailwind.config.ts`, inside `theme.extend.colors`, after the `error: '#E74C3C',` line add:
```ts
        fv: {
          navy: '#1E2C59',
          blue: '#2587C4',
          'blue-d': '#1E6C9D',
          'blue-dd': '#175176',
          'blue-50': '#E8F4FB',
          wash: '#F3F9FD',
          slate: '#55627A',
          muted: '#8A94A8',
          line: '#E6ECF5',
          green: '#58A651',
          'green-d': '#3E7B39',
          'green-50': '#EAF5E8',
        },
```
Inside `theme.extend.boxShadow`, after `'glow-green': …,` add:
```ts
        'fv-card': '0 10px 30px rgba(30, 44, 89, 0.06)',
        'fv-raised': '0 30px 70px rgba(30, 44, 89, 0.12)',
        'fv-btn': '0 8px 20px rgba(30, 108, 157, 0.25)',
```

- [ ] **Step 2: Add the global classes**

Append to `app/globals.css`:
```css
/* ──────────────────────────────────────────────────────────────────────────
   L3 "Service Hub" public design layer (spec 2026-10-05-l3-site-redesign).
   Only the public layout carries .fv-site, so admin is unaffected.
   next/font sets --font-poppins / --font-ibm-plex on <html>; redefining them
   here switches every font-heading / font-sans / h1–h6 rule to Inter in the
   public site only.
   ────────────────────────────────────────────────────────────────────────── */
@layer components {
  .fv-site {
    --font-poppins: var(--font-inter);
    --font-ibm-plex: var(--font-inter);
    font-family: var(--font-inter), system-ui, sans-serif;
    color: #1E2C59;
  }
  .fv-wrap {
    width: 100%;
    max-width: 1184px;
    margin-inline: auto;
    padding-inline: 24px;
  }
  @media (max-width: 640px) {
    .fv-wrap {
      padding-inline: 16px;
    }
  }
  .fv-card {
    background: #ffffff;
    border: 1px solid #E6ECF5;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(30, 44, 89, 0.06);
  }
}
```

- [ ] **Step 3: Wrap the public layout**

Replace the whole of `app/(site)/layout.tsx` with:
```tsx
import Navigation from '../components/common/Navigation'
import Footer from '../components/common/Footer'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fv-site bg-white">
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → exit 0.
Run: `npm run dev` (port 3000, backend on 4000 per `.env.local`), open `http://localhost:3000/contact` and `http://localhost:3000/admin/login`.
Expected: the contact page headings render in Inter (DevTools → Computed → font-family shows Inter); the admin login is unchanged (Poppins headings).

- [ ] **Step 5: Checkpoint (no commit)**

Changed files are only `tailwind.config.ts`, `app/globals.css` and `app/(site)/layout.tsx` (plus Task 1's files).

---

### Task 3: Colour helpers + design primitives

**Files:**
- Create: `app/lib/fv/colors.ts`, `tests/fv-colors.test.ts`, `app/components/fv/Button.tsx`, `Section.tsx`, `SectionHead.tsx`, `IconTile.tsx`, `Tile.tsx`, `Pill.tsx`, `LightHero.tsx`, `SearchBar.tsx`, `StatsStrip.tsx`, `CTASplit.tsx`
- Rewrite: `app/components/common/Breadcrumb.tsx`

**Interfaces:**
- Consumes: `formatStatValue`, `StatLike` (Task 1).
- Produces:
  - `colors.ts`: `FV_COLOR_KEYS`, `type FvColor`, `FV_COLOR_HEX: Record<FvColor, {fg; bg; pale}>`, `colorAt(i: number): FvColor`, `isFvColor(v: unknown): v is FvColor`, `fvColorVars(c: FvColor): Record<'--c' | '--cb' | '--cp', string>`
  - `<Button variant? size? isLoading? …buttonProps>` (default export), `ButtonLink`, `fvButtonClass(variant?, size?, className?)`, `type FvButtonVariant`
  - `<Section soft? tight? id? className? innerClassName? aria-labelledby?>`
  - `<SectionHead title subtitle? align? action?={label,href} id? className?>`
  - `<IconTile name? icon? color? size?='sm'|'md'|'lg'|'xl' solid? className?>`
  - `<Tile title text? href? external? iconName? icon? color? meta? className? ariaLabel?>`
  - `<Pill href? className?>`
  - `<LightHero title titleLine2? subtitle? badge? breadcrumb? iconName? icon? iconColor? align?='center' aside? className?>{children}</LightHero>`
  - `<SearchBar id? placeholder? defaultValue? className?>`
  - `<StatsStrip items: (StatLike & {icon?: string})[]>`
  - `<CTASplit title text values primary={label,href} secondary? image?={src,alt}>`
  - `<Breadcrumb items dark? className?>` (same props as today, plus `className`)

- [ ] **Step 1: Write the failing colour test**

`tests/fv-colors.test.ts`:
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FV_COLOR_KEYS, FV_COLOR_HEX, colorAt, isFvColor, fvColorVars } from '../app/lib/fv/colors';

test('exactly the 8 approved keys, in order', () => {
  assert.deepEqual([...FV_COLOR_KEYS], ['blue', 'purple', 'green', 'orange', 'red', 'teal', 'yellow', 'pink']);
});

test('blue, green and teal use the logo palette', () => {
  assert.equal(FV_COLOR_HEX.blue.fg, '#2587C4');
  assert.equal(FV_COLOR_HEX.green.fg, '#58A651');
  assert.equal(FV_COLOR_HEX.teal.fg, '#3D8A6A');
});

test('every key has fg/bg/pale hex values', () => {
  for (const key of FV_COLOR_KEYS) {
    for (const shade of ['fg', 'bg', 'pale'] as const) {
      assert.match(FV_COLOR_HEX[key][shade], /^#[0-9A-F]{6}$/i, `${key}.${shade}`);
    }
  }
});

test('colorAt cycles and tolerates negatives', () => {
  assert.equal(colorAt(0), 'blue');
  assert.equal(colorAt(8), 'blue');
  assert.equal(colorAt(9), 'purple');
  assert.equal(colorAt(-1), 'pink');
});

test('isFvColor and fvColorVars', () => {
  assert.equal(isFvColor('teal'), true);
  assert.equal(isFvColor('amber'), false);
  assert.equal(isFvColor(undefined), false);
  assert.deepEqual(fvColorVars('red'), { '--c': '#EF4444', '--cb': '#FFE7E7', '--cp': '#FFF5F5' });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `./scripts/test-pure.sh` → tsc error: cannot find module `../app/lib/fv/colors`.

- [ ] **Step 3: Implement `app/lib/fv/colors.ts`**

```ts
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
```
Run: `./scripts/test-pure.sh` → all tests pass (14).

- [ ] **Step 4: Create `app/components/fv/Button.tsx`**

The default `type` is deliberately **not** set (Review Focus #1).
```tsx
import Link from 'next/link';
import { clsx } from 'clsx';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Public-site button. Same props as ui/Button (primary | secondary | tertiary, size,
 * isLoading) so imports can be swapped; admin keeps ui/Button (spec D4).
 * NOTE: no default `type` — like ui/Button, it submits when placed in a <form>.
 */
export type FvButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'white' | 'link';
export type FvButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 cursor-pointer ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<FvButtonVariant, string> = {
  primary: 'bg-fv-blue-d text-white shadow-fv-btn hover:bg-fv-blue-dd',
  secondary: 'bg-fv-navy text-white hover:bg-[#16224A]',
  tertiary: 'border border-fv-blue-d bg-white text-fv-blue-d hover:bg-fv-blue-50',
  outline: 'border border-fv-blue-d bg-white text-fv-blue-d hover:bg-fv-blue-50',
  white: 'border border-fv-line bg-white text-fv-navy hover:bg-fv-wash',
  link: 'text-fv-blue-d underline-offset-4 hover:text-fv-blue-dd hover:underline',
};

const SIZES: Record<FvButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-6 py-3.5 text-base',
};

export function fvButtonClass(variant: FvButtonVariant = 'primary', size: FvButtonSize = 'md', className?: string) {
  return clsx(BASE, VARIANTS[variant], variant !== 'link' && SIZES[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FvButtonVariant;
  size?: FvButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={fvButtonClass(variant, size, className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: FvButtonVariant;
  size?: FvButtonSize;
  children: ReactNode;
}

/** Link styled as a button. External / tel: / mailto: hrefs render a plain <a>. */
export function ButtonLink({ href, variant = 'primary', size = 'md', className, children, ...props }: ButtonLinkProps) {
  const cls = fvButtonClass(variant, size, className);
  if (/^(https?:|tel:|mailto:)/.test(href)) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 5: Create `Section.tsx`, `SectionHead.tsx`, `Pill.tsx`**

`app/components/fv/Section.tsx`:
```tsx
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  soft?: boolean;
  tight?: boolean;
  id?: string;
  className?: string;
  innerClassName?: string;
  'aria-labelledby'?: string;
}

export default function Section({ children, soft, tight, id, className, innerClassName, ...rest }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={rest['aria-labelledby']}
      className={clsx(soft ? 'bg-fv-wash' : 'bg-white', tight ? 'py-12 md:py-14' : 'py-14 md:py-[88px]', className)}
    >
      <div className={clsx('fv-wrap', innerClassName)}>{children}</div>
    </section>
  );
}
```

`app/components/fv/SectionHead.tsx`:
```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface SectionHeadProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  action?: { label: string; href: string };
  id?: string;
  className?: string;
}

export default function SectionHead({ title, subtitle, align = 'left', action, id, className }: SectionHeadProps) {
  const centered = align === 'center';
  return (
    <div
      className={clsx(
        'mb-10 md:mb-12',
        centered ? 'mx-auto max-w-[720px] text-center' : 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={centered ? undefined : 'max-w-[680px]'}>
        <h2 id={id} className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-fv-navy md:text-[36px]">
          {title}
        </h2>
        {subtitle && <p className="mt-3 text-base leading-relaxed text-fv-slate md:text-[17px]">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className={clsx(
            'inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold text-fv-blue-d hover:text-fv-blue-dd',
            centered && 'mt-5',
          )}
        >
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
```

`app/components/fv/Pill.tsx`:
```tsx
import Link from 'next/link';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

const BASE =
  'inline-flex items-center rounded-full border border-fv-line bg-white px-3 py-1.5 text-[13px] font-semibold text-fv-navy';

export default function Pill({ children, href, className }: { children: ReactNode; href?: string; className?: string }) {
  if (href) {
    return (
      <Link href={href} className={clsx(BASE, 'transition-colors hover:border-fv-blue hover:text-fv-blue-d', className)}>
        {children}
      </Link>
    );
  }
  return <span className={clsx(BASE, className)}>{children}</span>;
}
```

- [ ] **Step 6: Create `IconTile.tsx` and `Tile.tsx`**

`app/components/fv/IconTile.tsx`:
```tsx
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { fvColorVars, type FvColor } from '@/app/lib/fv/colors';

const SIZES = {
  sm: 'h-[34px] w-[34px] rounded-[9px] [&>svg]:h-4 [&>svg]:w-4',
  md: 'h-[46px] w-[46px] rounded-[11px] [&>svg]:h-[22px] [&>svg]:w-[22px]',
  lg: 'h-14 w-14 rounded-[14px] [&>svg]:h-[26px] [&>svg]:w-[26px]',
  xl: 'h-[72px] w-[72px] rounded-[20px] [&>svg]:h-[34px] [&>svg]:w-[34px]',
} as const;

interface IconTileProps {
  /** DB-driven lucide name; resolved through the blocklist-guarded resolver. */
  name?: string;
  icon?: LucideIcon;
  color?: FvColor;
  size?: keyof typeof SIZES;
  /** Gradient tile with a white icon (solution rail, heroes). */
  solid?: boolean;
  className?: string;
}

export default function IconTile({ name, icon, color = 'blue', size = 'md', solid = false, className }: IconTileProps) {
  const Icon = icon ?? getIconFromName(name);
  return (
    <span
      aria-hidden="true"
      style={fvColorVars(color) as CSSProperties}
      className={clsx(
        'inline-grid flex-none place-items-center',
        SIZES[size],
        solid
          ? 'bg-[linear-gradient(150deg,color-mix(in_srgb,var(--c)_68%,white),var(--c))] text-white shadow-[0_10px_22px_-10px_var(--c)]'
          : 'bg-[var(--cb)] text-[var(--c)]',
        className,
      )}
    >
      <Icon strokeWidth={1.9} />
    </span>
  );
}
```

`app/components/fv/Tile.tsx`:
```tsx
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from './IconTile';
import { fvColorVars, type FvColor } from '@/app/lib/fv/colors';

interface TileProps {
  title: string;
  text?: string;
  href?: string;
  external?: boolean;
  iconName?: string;
  icon?: LucideIcon;
  color?: FvColor;
  meta?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export default function Tile({ title, text, href, external, iconName, icon, color = 'blue', meta, className, ariaLabel }: TileProps) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const body = (
    <>
      <IconTile name={iconName} icon={icon} color={color} />
      <span className="mt-4 block text-base font-bold leading-snug text-fv-navy">{title}</span>
      {text && <span className="mt-1.5 block text-sm leading-relaxed text-fv-slate line-clamp-3">{text}</span>}
      {meta && <span className="mt-auto block pr-10 pt-4 text-[13px] text-fv-slate">{meta}</span>}
      {href && (
        <span
          aria-hidden="true"
          style={fvColorVars(color) as CSSProperties}
          className="absolute bottom-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-[var(--cb)] text-[var(--c)] transition-transform group-hover:translate-x-0.5"
        >
          <Arrow className="h-4 w-4" />
        </span>
      )}
    </>
  );
  const cls = clsx(
    'group fv-card relative flex h-full flex-col p-5 transition duration-200',
    href && 'min-h-[150px] hover:-translate-y-0.5 hover:border-[#CFE2F2] hover:shadow-fv-raised',
    className,
  );
  if (!href) return <div className={cls}>{body}</div>;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={cls}>
      {body}
    </Link>
  );
}
```

- [ ] **Step 7: Rewrite `app/components/common/Breadcrumb.tsx`**

```tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Light-on-dark variant (kept for compatibility). */
  dark?: boolean;
  className?: string;
}

export default function Breadcrumb({ items, dark = false, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={clsx('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRight aria-hidden="true" className={clsx('mx-1.5 h-4 w-4', dark ? 'text-white/40' : 'text-fv-muted')} />
            )}
            {item.href ? (
              <Link href={item.href} className={dark ? 'text-white/70 hover:text-white' : 'text-fv-slate hover:text-fv-blue-d'}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={clsx('font-semibold', dark ? 'text-white' : 'text-fv-navy')}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 8: Create `LightHero.tsx` and `SearchBar.tsx`**

`app/components/fv/LightHero.tsx`:
```tsx
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';
import { clsx } from 'clsx';
import Breadcrumb from '@/app/components/common/Breadcrumb';
import IconTile from './IconTile';
import type { FvColor } from '@/app/lib/fv/colors';

export interface LightHeroProps {
  title: string;
  /** Optional second line, rendered in brand blue. */
  titleLine2?: string;
  subtitle?: string;
  badge?: string;
  breadcrumb?: { label: string; href?: string }[];
  iconName?: string;
  icon?: LucideIcon;
  iconColor?: FvColor;
  align?: 'left' | 'center';
  /** Right-hand column (stats, price card…). Forces left alignment. */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const LIGHT_HERO_BG =
  'bg-[radial-gradient(720px_340px_at_85%_0%,#DCEFFA,transparent_70%),linear-gradient(180deg,#F3F9FD,#ffffff)]';

export default function LightHero({
  title,
  titleLine2,
  subtitle,
  badge,
  breadcrumb,
  iconName,
  icon,
  iconColor = 'blue',
  align = 'center',
  aside,
  children,
  className,
}: LightHeroProps) {
  const centered = align === 'center' && !aside;
  return (
    <section className={clsx('relative overflow-hidden border-b border-fv-line', LIGHT_HERO_BG, className)}>
      <div className={clsx('fv-wrap py-12 md:py-16', aside && 'grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]')}>
        <div className={clsx('min-w-0', centered && 'mx-auto max-w-[780px] text-center')}>
          {breadcrumb && <Breadcrumb items={breadcrumb} className={clsx('mb-6', centered && '[&>ol]:justify-center')} />}
          {(iconName || icon) && <IconTile name={iconName} icon={icon} color={iconColor} size="lg" solid className="mb-5" />}
          {badge && (
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#CFE2F2] bg-white px-3 py-1.5 text-[13px] font-semibold text-fv-blue-d">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {badge}
            </span>
          )}
          <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] text-fv-navy md:text-[48px]">
            {title}
            {titleLine2 && (
              <>
                <br />
                <span className="text-fv-blue">{titleLine2}</span>
              </>
            )}
          </h1>
          {subtitle && (
            <p className={clsx('mt-4 max-w-[640px] text-base leading-relaxed text-fv-slate md:text-lg', centered && 'mx-auto')}>
              {subtitle}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </section>
  );
}
```

`app/components/fv/SearchBar.tsx` (a plain GET form, so it works without JS):
```tsx
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { fvButtonClass } from './Button';

interface SearchBarProps {
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export default function SearchBar({
  id = 'fv-search',
  placeholder = 'Search for a service (e.g. GST, Company Registration)',
  defaultValue,
  className,
}: SearchBarProps) {
  return (
    <form
      action="/services"
      method="get"
      role="search"
      className={clsx(
        'flex w-full items-center gap-2 rounded-xl border border-fv-line bg-white p-1.5 pl-4 shadow-fv-card',
        'focus-within:border-fv-blue focus-within:ring-2 focus-within:ring-fv-blue/20',
        className,
      )}
    >
      <Search className="h-5 w-5 flex-none text-fv-muted" aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        Search services
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent py-2 text-base text-fv-navy outline-none placeholder:text-fv-muted"
      />
      <button type="submit" className={fvButtonClass('primary', 'md', 'flex-none')}>
        Search
      </button>
    </form>
  );
}
```

- [ ] **Step 9: Create `StatsStrip.tsx` and `CTASplit.tsx`**

`app/components/fv/StatsStrip.tsx`:
```tsx
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { formatStatValue, type StatLike } from '@/app/lib/fv/text';

interface StatItem extends StatLike {
  icon?: string;
}

export default function StatsStrip({ items }: { items: StatItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="FinVidhi in numbers" className="border-b border-fv-line bg-white">
      <div className="fv-wrap grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {items.slice(0, 4).map((stat, i) => {
          const Icon = getIconFromName(stat.icon);
          return (
            <div key={`${stat.label}-${i}`} className="flex items-center gap-3 lg:justify-center">
              <Icon className="h-8 w-8 flex-none text-fv-blue" strokeWidth={1.6} aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-2xl font-extrabold leading-tight text-fv-navy md:text-[28px]">{formatStatValue(stat)}</div>
                <div className="text-sm text-fv-slate">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

`app/components/fv/CTASplit.tsx`:
```tsx
import { ArrowRight, BadgeCheck, Calculator, Check, Clock3, CreditCard } from 'lucide-react';
import { clsx } from 'clsx';
import { ButtonLink } from './Button';
import { LIGHT_HERO_BG } from './LightHero';

interface CTASplitProps {
  title: string;
  text: string;
  values: string[];
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  image?: { src: string; alt: string };
}

const VALUE_ICONS = [CreditCard, BadgeCheck, Clock3];

export default function CTASplit({ title, text, values, primary, secondary, image }: CTASplitProps) {
  return (
    <section className={clsx('relative overflow-hidden py-16 md:py-20', LIGHT_HERO_BG)}>
      <div className={clsx('fv-wrap grid items-center gap-10', image && 'lg:grid-cols-[1.1fr_.9fr]')}>
        <div className="min-w-0">
          <h2 className="text-[30px] font-extrabold leading-[1.12] tracking-[-0.02em] text-fv-navy md:text-[42px]">{title}</h2>
          <p className="mt-3 max-w-[540px] text-base leading-relaxed text-fv-slate md:text-lg">{text}</p>
          {values.length > 0 && (
            <ul className="mt-7 grid max-w-[540px] grid-cols-1 gap-3 sm:grid-cols-3">
              {values.map((value, i) => {
                const Icon = VALUE_ICONS[i] ?? Check;
                return (
                  <li key={value} className="fv-card px-3 py-3.5 text-center text-[13px] font-semibold text-fv-navy">
                    <Icon className="mx-auto mb-2 h-5 w-5 text-fv-blue" aria-hidden="true" />
                    {value}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={primary.href} size="lg">
              {primary.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            {secondary && (
              <ButtonLink href={secondary.href} variant="outline" size="lg">
                <Calculator className="h-4 w-4" aria-hidden="true" />
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </div>
        {image && (
          <div className="mx-auto aspect-[11/10] w-full max-w-[440px] overflow-hidden rounded-[22px] shadow-fv-raised">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded URL, host not guaranteed */}
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 10: Verify**

Run: `./scripts/test-pure.sh` → all pass.
Run: `npx tsc --noEmit` → exit 0. (Breadcrumb's callers pass `items` / `dark` only, so they still compile.)

- [ ] **Step 11: Checkpoint (no commit)**

`git status --short` shows only the files listed in this task plus Tasks 1–2.

---

### Task 4: Site shell: Navigation + Footer

**Files:**
- Rewrite: `app/components/common/Navigation.tsx`, `app/components/common/Footer.tsx`

**Interfaces:**
- Consumes: `IconTile`, `Button` (Task 3), `RequestCallbackModal` (existing, props `{open, onClose}`), `FvColor`.
- Produces: `export interface NavSolution { slug: string; title: string; subtitle?: string; iconName: string; color: FvColor }` and `Navigation({ solutions?: NavSolution[] })`. The **Solutions plan** passes `solutions` from `(site)/layout.tsx`. With none, the Solutions item is not rendered.

- [ ] **Step 1: Confirm nothing else imports the old nav exports**

Run: `grep -rn "components/common/Navigation\|common/Footer" app --include='*.tsx'`
Expected: only `app/(site)/layout.tsx`.

- [ ] **Step 2: Replace `app/components/common/Navigation.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from '../fv/IconTile';
import Button from '../fv/Button';
import RequestCallbackModal from '../home/RequestCallbackModal';
import type { FvColor } from '@/app/lib/fv/colors';

/** Published solution, as passed by (site)/layout.tsx (Solutions plan). */
export interface NavSolution {
  slug: string;
  title: string;
  subtitle?: string;
  iconName: string;
  color: FvColor;
}

interface MenuLink {
  label: string;
  href: string;
  icon: string;
  description?: string;
  color?: FvColor;
}

interface NavItem {
  label: string;
  href?: string;
  menu?: MenuLink[];
  match: (path: string) => boolean;
}

const SERVICES_MENU: MenuLink[] = [
  { label: 'GST Services', href: '/services/gst', icon: 'Receipt' },
  { label: 'Business Registration', href: '/services/registration', icon: 'Building2' },
  { label: 'Income Tax', href: '/services/income-tax', icon: 'Calculator' },
  { label: 'Trademarks & IP', href: '/services/trademarks', icon: 'Award' },
  { label: 'Legal Services', href: '/services/legal', icon: 'Scale' },
  { label: 'IPO Services', href: '/services/ipo', icon: 'TrendingUp' },
  { label: 'Banking & Finance', href: '/services/banking-finance', icon: 'Landmark' },
];

const RESOURCES_MENU: MenuLink[] = [
  { label: 'Blog', href: '/blog', icon: 'BookOpen' },
  { label: 'Calculators', href: '/calculators', icon: 'Calculator' },
  { label: 'Compliance', href: '/compliance', icon: 'FileCheck' },
];

function buildItems(solutions: NavSolution[]): NavItem[] {
  const items: NavItem[] = [
    { label: 'Home', href: '/', match: (p) => p === '/' },
    { label: 'Services', href: '/services', menu: SERVICES_MENU, match: (p) => p.startsWith('/services') },
  ];
  if (solutions.length > 0) {
    items.push({
      label: 'Solutions',
      menu: solutions.map((s) => ({
        label: s.title,
        href: `/solutions/${s.slug}`,
        icon: s.iconName,
        description: s.subtitle,
        color: s.color,
      })),
      match: (p) => p.startsWith('/solutions'),
    });
  }
  items.push(
    {
      label: 'Resources',
      menu: RESOURCES_MENU,
      match: (p) => ['/blog', '/calculators', '/compliance'].some((r) => p.startsWith(r)),
    },
    { label: 'Team', href: '/team', match: (p) => p.startsWith('/team') },
    { label: 'Contact', href: '/contact', match: (p) => p.startsWith('/contact') },
  );
  return items;
}

export default function Navigation({ solutions = [] }: { solutions?: NavSolution[] }) {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const items = buildItems(solutions);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 border-b bg-white transition-shadow',
        scrolled ? 'border-fv-line shadow-[0_4px_20px_rgba(30,44,89,.08)]' : 'border-transparent',
      )}
    >
      <nav aria-label="Main" className="fv-wrap flex h-[68px] items-center gap-6">
        <Link href="/" className="flex flex-none items-center gap-2" aria-label="FinVidhi home">
          <Image src="/images/finvidhi-icon.png" alt="" width={36} height={36} priority className="h-9 w-9 object-contain" />
          <span className="text-[22px] font-extrabold tracking-[-0.02em] text-fv-navy">
            Fin<span className="text-fv-blue">Vidhi</span>
          </span>
        </Link>

        <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {items.map((item) => (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() => item.menu && setOpenDropdown(item.label)}
              onMouseLeave={() => item.menu && setOpenDropdown(null)}
              onBlur={(e) => {
                if (item.menu && !e.currentTarget.contains(e.relatedTarget as Node)) setOpenDropdown(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpenDropdown(null);
              }}
            >
              <DesktopItem
                item={item}
                active={item.match(pathname)}
                open={openDropdown === item.label}
                onToggle={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
              />
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button className="hidden sm:inline-flex" onClick={() => setCallbackOpen(true)}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Request Callback
          </Button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg text-fv-navy hover:bg-fv-wash lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="max-h-[calc(100vh-68px)] overflow-y-auto border-t border-fv-line bg-white lg:hidden">
          <ul className="fv-wrap space-y-1 py-4">
            {items.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={clsx(
                      'block rounded-lg px-3 py-2.5 text-[15px] font-semibold',
                      item.match(pathname) ? 'bg-fv-blue-50 text-fv-blue-d' : 'text-fv-navy hover:bg-fv-wash',
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <p className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-fv-muted">{item.label}</p>
                )}
                {item.menu && (
                  <ul className="ml-3 space-y-0.5 border-l border-fv-line pl-3">
                    {item.menu.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-fv-slate hover:bg-fv-wash hover:text-fv-navy"
                        >
                          <IconTile name={link.icon} color={link.color ?? 'blue'} size="sm" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="pt-3">
              <Button
                className="w-full"
                onClick={() => {
                  setMenuOpen(false);
                  setCallbackOpen(true);
                }}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Request Callback
              </Button>
            </li>
          </ul>
        </div>
      )}

      <RequestCallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </header>
  );
}

function DesktopItem({
  item,
  active,
  open,
  onToggle,
}: {
  item: NavItem;
  active: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const base = clsx(
    'relative flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-medium transition-colors',
    active ? 'text-fv-blue-d' : 'text-fv-navy hover:text-fv-blue-d',
  );
  const underline = active ? (
    <span aria-hidden="true" className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-fv-blue-d" />
  ) : null;

  if (!item.menu) {
    return (
      <Link href={item.href ?? '/'} className={base} aria-current={active ? 'page' : undefined}>
        {item.label}
        {underline}
      </Link>
    );
  }

  const menuId = `nav-menu-${item.label.toLowerCase()}`;
  const chevron = <ChevronDown aria-hidden="true" className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')} />;

  return (
    <>
      {item.href ? (
        <span className="flex items-center">
          <Link href={item.href} className={clsx(base, 'pr-1')}>
            {item.label}
            {underline}
          </Link>
          <button
            type="button"
            aria-label={`${item.label} menu`}
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={onToggle}
            className="grid h-8 w-6 place-items-center rounded text-fv-navy hover:text-fv-blue-d"
          >
            {chevron}
          </button>
        </span>
      ) : (
        <button type="button" aria-haspopup="true" aria-expanded={open} aria-controls={menuId} onClick={onToggle} className={base}>
          {item.label}
          {chevron}
          {underline}
        </button>
      )}
      {open && (
        <div id={menuId} className="absolute left-0 top-full z-50 w-72 pt-2">
          <ul className="fv-card p-2 shadow-fv-raised">
            {item.menu.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-fv-wash">
                  <IconTile name={link.icon} color={link.color ?? 'blue'} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-fv-navy">{link.label}</span>
                    {link.description && <span className="block truncate text-xs text-fv-slate">{link.description}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Replace `app/components/common/Footer.tsx`**

Footer becomes a server component, without the GSAP reveal that once left it stuck hidden.
```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Products',
    links: [
      { label: 'Income Tax Calculator', href: '/calculators/income-tax' },
      { label: 'GST Calculator', href: '/calculators/gst' },
      { label: 'EMI Calculator', href: '/calculators/emi' },
      { label: 'HRA Calculator', href: '/calculators/hra' },
      { label: 'TDS Calculator', href: '/calculators/tds' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Team', href: '/team' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'All Services', href: '/services' },
      { label: 'Compliance', href: '/compliance' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const LEGAL = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
];

const SOCIAL = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="bg-fv-navy text-white">
      <div className="fv-wrap grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2" aria-label="FinVidhi home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white">
              <Image src="/images/finvidhi-icon.png" alt="" width={30} height={30} className="h-[30px] w-[30px] object-contain" />
            </span>
            <span className="text-[22px] font-extrabold tracking-[-0.02em]">
              Fin<span className="text-[#6BB8E8]">Vidhi</span>
            </span>
          </Link>
          <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-white/70">
            Your complete tax &amp; compliance solution. Calculate, comply, and save with confidence.
          </p>
          <ul className="mt-5 flex gap-2">
            {SOCIAL.map((social) => {
              const Icon = social.icon;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-[15px] font-bold">{column.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-[15px] font-bold">Newsletter</h2>
          <p className="mt-4 text-sm text-white/70">Subscribe to get tax tips and updates.</p>
          <form className="mt-3 flex gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Your email"
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base text-white outline-none placeholder:text-white/40 focus:border-[#6BB8E8] md:text-sm"
            />
            <button type="submit" className="rounded-lg bg-fv-blue-d px-4 text-sm font-semibold text-white hover:bg-fv-blue-dd">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="fv-wrap flex flex-col items-center justify-between gap-3 py-6 text-sm text-white/60 md:flex-row">
          <p>&copy; {new Date().getFullYear()} FinVidhi. All rights reserved.</p>
          <ul className="flex gap-5">
            {LEGAL.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → exit 0.
With `npm run dev`:
- On `http://localhost:3000/contact`, Tab into the nav, Enter on the Services chevron (the menu opens), Escape (it closes), and Tab out (it closes). Resources opens with Enter. Under 1024px the hamburger opens the drawer, and the drawer's Request Callback opens the modal.
- There's no Solutions item (expected: no `solutions` prop yet).
- The footer is visible immediately, with no reveal delay.

- [ ] **Step 5: Checkpoint (no commit)**

Take screenshots of `/contact` at 1440 and 390 for Vikrant (`scripts/fv-audit.cjs` arrives in Task 12; until then, use DevTools device mode).

---

### Task 5: Home page = design 3 "Icon Rail" (revised 2026-10-06)

> Replaces the superseded L3 split-hero Task 5 below. Vikrant, 2026-10-06: the home page must be **exactly** design 3 "Icon Rail" from `/Users/vikrantchaudhary/Desktop/cleartax/ui-variants/home-solution-cards-variants.html#s3` (its **Home page** view), section for section, in the logo palette (`fv-*` tokens, not the mockup's `#1F6FEB` blues). Spec: `/` row of "Page mapping" and D1 in `docs/superpowers/specs/2026-10-05-l3-site-redesign-design.md` (both revised 2026-10-06) — binding.
> Mockup source to read: the s3 `css:` block and `home()` template at `home-solution-cards-variants.html` lines ~3299–3400, the shared `S.trio` / `S.vals` / `S.testi` / `S.cta1` templates (~2726–2880) and their CSS (`.trio`, `.tri-*`, `.vals`, `.val`, `.ts3`, `.cta`, `.mst-row`, `.rail`, `.ri`, `.rb`), and `svcCard` / `popTag` (~2613–2625). Open the file in the browser (`#s3`, "Home page") to see it.

**Files:**
- Keep as-is (already on disk, written for the superseded task, tested): `app/lib/fv/explorer.ts`, `tests/fv-explorer.test.ts`, `app/lib/fv/homeDefaults.ts`, `app/components/team/TeamCard.tsx` (also used by `/team`).
- Delete (new in this branch, now unused): `app/components/fv/Explorer.tsx`, `app/components/home/DashboardCard.tsx`, `app/components/fv/CTASplit.tsx`.
- Restore to the committed version (no longer rendered on home; old components stay on disk untouched): `app/components/home/TeamSection.tsx`, `app/components/home/GovPortalsSection.tsx` — `git show HEAD:<path> > <path>` (working-tree write only; never `git checkout`/`restore`).
- Modify: `app/lib/fv/text.ts` + `tests/fv-text.test.ts` (add `heroSubline`), `app/components/fv/SearchBar.tsx` (optional `size`), `app/components/home/BenefitsSection.tsx`, `app/components/home/TestimonialsSection.tsx`, `app/(site)/page.tsx`.
- Rewrite: `app/components/home/HomeHero.tsx`.
- Create: `app/components/home/PopularServices.tsx`, `app/components/home/AreaTrio.tsx`, `app/components/fv/CTABanner.tsx`.

**Interfaces:**
- Consumes: `splitHeading`, `formatFromPrice`, `plural` (`text.ts`); `FvColor`, `colorAt`, `fvColorVars` (`colors.ts`); `buildExplorerAreas`, `ExplorerArea`, `ExplorerRow` (`explorer.ts`); `DEFAULT_BANNER`, `DEFAULT_STATS` (`homeDefaults.ts`); primitives `IconTile`, `Section`, `SectionHead`, `SearchBar`, `StatsStrip`, `Pill`, `Button`/`ButtonLink`/`fvButtonClass`; `getHomePageData()` (unchanged).
- Produces (the Solutions plan relies on these exact names):
  - `heroSubline(description?: string | null): string` — paragraphs split on a blank line (`/\r?\n\s*\r?\n/`), trimmed, empties dropped; returns the 2nd paragraph if there is one, else the 1st, else `''`.
  - `HomeHero({ banner, rail }: { banner: { heading: string; description: string; badge?: string }; rail?: ReactNode })`
  - `export interface PopularServiceItem { id: string; title: string; description?: string; href: string; iconName?: string; color: FvColor; price?: { min?: number } | null; duration?: string }` and `PopularServices({ items }: { items: PopularServiceItem[] })` — returns `null` when `items` is empty.
  - `AreaTrio({ areas }: { areas: ExplorerArea[] })` — returns `null` when no area has rows.
  - `CTABanner({ title, text, note?, primary, secondary? })` with `primary/secondary: { label: string; href: string }`.

- [ ] **Step 1 (TDD): `heroSubline`.** Add tests to `tests/fv-text.test.ts`: `'A.\r\n\r\nB.'` → `'B.'`; `'A.\n\nB.\n\nC.'` → `'B.'`; `'Only one.'` → `'Only one.'`; `''`, `undefined`, `null` → `''`; `'  \n\n  B  '` → `'B'`. Run `./scripts/test-pure.sh` → FAIL (not exported). Implement in `app/lib/fv/text.ts` (pure, no imports). Run → all pass.

- [ ] **Step 2: Clean up the superseded files** (Files → Delete / Restore above). Then `grep -rn "DashboardCard\|fv/Explorer\|CTASplit" app` must print nothing once Step 7 is done.

- [ ] **Step 3: `HomeHero` (centred, s3 `.v3h`).** Server component (no `'use client'`). `<section>` with background `radial-gradient(700px 300px at 50% 0%, #E8F4FB, transparent 70%), linear-gradient(180deg, #F3F9FD, #FFFFFF)`, `text-center`, padding-top 52px (30px <640px). Inside `.fv-wrap`:
  1. Badge pill (only if `banner.badge`): inline-flex, `BadgeCheck` icon, 13px semibold `text-fv-blue-d`, white bg, 1px border `#D6E4FB`, `rounded-full px-3 py-1.5`, margin-bottom 16px.
  2. `<h1>`: `splitHeading(banner.heading)` → `[a, b]`; render `{a} <span className="text-fv-blue">{b}</span>` on ONE line at desktop: 52px / line-height 1.08 / extrabold / tracking-tight / `text-fv-navy` (32px <640px, 40px 640–1023px). If `b` is empty render only `a`.
  3. Subline `<p>`: `heroSubline(banner.description)`, 17px (15px <640px), `text-fv-slate`, `max-w-[620px] mx-auto mt-3.5`. Omit if empty.
  4. `<SearchBar size="lg" className="mx-auto mt-[26px] max-w-[680px]" />` (GET `/services?q=`). Add to `SearchBar` an optional `size?: 'md' | 'lg'` (default `'md'` = current look); `lg` = 58px tall, `rounded-[14px]` (52px tall and the Search button hidden <640px, as the mockup does — keep the form submittable with Enter).
  5. Rail slot: `{rail ? <div className="mt-[38px]">{rail}</div> : <div className="h-14" aria-hidden="true" />}` — with a rail the hero has no bottom padding (the rail card sits on the hero's bottom edge, Solutions plan); without one it ends with 56px of space.
  No buttons, no "Popular:" pills, no dashboard card, no image.

- [ ] **Step 4: `PopularServices` (s3 "Most popular services").** Server component. Returns `null` for `items.length === 0`. `<Section>` (white, default padding) → header row: `SectionHead title="Most popular services"` left + link "View all services →" (`/services`, `text-fv-blue-d font-semibold`, `ArrowRight` icon) right. Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`. Each card = one `<Link href={item.href}>` with `fv-card p-4 flex flex-col h-full`, `style={fvColorVars(item.color)}`: top row `IconTile name={item.iconName} color={item.color} size="sm"` + title (15px bold navy, 2-line clamp) + green pill "★ Most popular" (`Star` icon, `bg-fv-green-50 text-fv-green-d`, 11px bold, rounded-full, top-right); description (13px `text-fv-slate`, `line-clamp-2`, mt-2); footer (`mt-auto pt-3 border-t border-fv-line` row): `formatFromPrice(item.price)` → `From <b>₹6,999</b>` or `Price on request` when null; `Clock` icon + `item.duration` (omit when missing). Hover: `-translate-y-0.5` + `shadow-fv-raised` under `motion-safe:`. Visible focus ring (global rule). Keys by `item.id`.

- [ ] **Step 5: `AreaTrio` (s3 `S.trio`, `.trio/.tri-*`).** Server component. Use the `ipo`, `legal`, `banking` areas from `buildExplorerAreas([], complex)` (ignore the 4 card areas). Keep only areas with `rows.length > 0` (the builder already drops 0-count subcategories); none → `null`. `<Section soft>` → `grid grid-cols-1 lg:grid-cols-3 gap-[18px]`. Per area a `fv-card p-5 flex flex-col`: header (`flex items-center gap-3 mb-3`): `IconTile` with static icon — ipo `TrendingUp` + `green`, legal `Scale` + `teal`, banking `Landmark` + `orange`; `<h3>` area heading (17px bold navy, line-height 1.3) + `<small>` `plural(total, 'service')` where total = sum of row counts (12.5px slate). Rows: `<ul>`; each `<li><Link href={row.href}>` row = `flex items-center gap-2.5 py-2.5 border-b border-fv-line last:border-0 text-sm`: small row icon via `getIconFromName(row.icon)` coloured `var(--c)` (fallback `ChevronRight`), title (`truncate flex-1`), count badge (`rounded-full px-2 text-xs font-bold` tinted with `var(--cb)`/`var(--c)`). Footer link `mt-auto pt-3`: `{area.cta.label} →` to `area.cta.href`, `text-fv-blue-d font-semibold`.

- [ ] **Step 6: Why Choose + Testimonials + CTA.**
  - `BenefitsSection` (render only; data logic untouched): s3 `S.vals('sec')` — white `<Section>`, centred `SectionHead` (`benefits.heading` / `subheading`), then `grid sm:grid-cols-3` of 3 `fv-card` tiles, centred text: icon circle (Eye / ShieldCheck / BadgeCheck by index, `bg-fv-blue-50 text-fv-blue-d`), bold title, 14px slate description.
  - `TestimonialsSection`: s3 `S.testi()` — `<Section soft>`, centred `SectionHead`, `grid lg:grid-cols-3 gap-[18px] items-start` of `fv-card` quote cards (stars, quote, avatar/initials + name + role). Keep its data logic; adjust only what differs from the mockup.
  - `CTABanner` (s3 `S.cta1()` / `.cta`): `<section className="pb-[88px]">` → `.fv-wrap` → panel `relative overflow-hidden rounded-[20px] px-6 py-10 md:px-[52px] md:py-12 grid gap-8 md:grid-cols-[1.3fr_auto] items-center` with background `radial-gradient(420px 260px at 100% 100%, rgba(37,135,196,.45), transparent 70%), linear-gradient(120deg, #1E2C59, #175176)`. Left: `<h2>` white 36px (28px <640px) extrabold; `<p>` `text-white/80` 16px max-w-[560px] mt-2.5; `note` `text-white/60` 13px mt-3.5. Right: buttons stacked (`flex flex-col gap-2.5`): primary `ButtonLink` `{primary.label}` + `ArrowRight`; secondary white button (`bg-white text-fv-navy`) with `Calculator` icon. Copy (from the old `CTASection`): read `app/components/home/CTASection.tsx` and reuse its heading, paragraph and small note text and its two links (`/services`, `/calculators`) verbatim.

- [ ] **Step 7: Compose `app/(site)/page.tsx`.** Keep data fetching, `metadata`, `revalidate`, JSON-LD and the `homeInfo`-null fallbacks verbatim (Global Constraints) — only the JSX changes. Order (each separated exactly as s3 `home()`):
  `<HomeHero banner={banner} />` (no `rail` yet) → `<div className="border-t border-fv-line"><StatsStrip items={stats} /></div>` (StatsStrip already strips `₹` from non-money stats) → `<PopularServices items={[]} />` (renders nothing until the Solutions plan feeds it) → `<AreaTrio areas={areas} />` → `<BenefitsSection … />` → `<TestimonialsSection … />` → `<div className="h-[88px]" aria-hidden="true" />` → `<CTABanner … />`.
  Remove `HomeHero`'s old props (`cards`, `team`), the Explorer, Team, GovPortals and CTASplit usages. The page no longer needs `team` data for rendering; keep fetching it only if `getHomePageData()` returns it as one call (do not edit `homepage-data.ts`).

- [ ] **Step 8: Verify.** `./scripts/test-pure.sh` → all pass (heroSubline included). `npx tsc --noEmit` → exit 0. `npx next lint --file 'app/(site)/page.tsx' --dir app/components/home --dir app/components/fv` → no new errors. Browser (dev server already on :3000; headless Chrome via playwright-core — see dispatch notes), compare against the mockup `#s3` at 1440 and 390:
  - Hero: centred badge, one-line H1 "Smart Finance. **Strong Compliance.**" (second sentence `rgb(37,135,196)`), subline "We don’t just manage numbers - we create clarity, control, and compliance.", search box centred ~680px; submitting "GST" lands on `/services?q=GST`. No dashboard card / pills / hero buttons.
  - Stats strip with a top border, "1,000+" without "₹".
  - No "Most popular services" section yet (no items).
  - Trio: 3 cards side by side ≥1024px, one column at 390; "Pre-IPO Funding" (0 services) absent; every row link resolves to a non-404 page (check 3 of them).
  - Why Choose (3 tiles), Testimonials (3 cards), navy CTA with "View Services" → `/services` and "Explore Calculators" → `/calculators`.
  - No horizontal overflow at 1440 / 1100 / 820 / 390; no console errors.
  - Fallback: render `/` with the backend unreachable is the controller's check — do NOT stop the backend yourself.

- [ ] **Step 9: Checkpoint (no commit).** Stop for Vikrant's visual sign-off of `/` at 1440 and 390 side by side with the mockup.

---

### ~~Task 5~~ (superseded 2026-10-06): Home page: explorer data, hero, dashboard, sections

> Superseded by the revised Task 5 above; kept for its explorer.ts / homeDefaults.ts / test code, which the revised task reuses.

**Files:**
- Create: `app/lib/fv/explorer.ts`, `tests/fv-explorer.test.ts`, `app/lib/fv/homeDefaults.ts`, `app/components/fv/Explorer.tsx`, `app/components/home/HomeHero.tsx`, `app/components/home/DashboardCard.tsx`
- Modify (render only): `app/components/home/BenefitsSection.tsx`, `TeamSection.tsx`, `TestimonialsSection.tsx`, `GovPortalsSection.tsx`
- Rewrite: `app/components/team/TeamCard.tsx`, `app/(site)/page.tsx`

**Interfaces:**
- Consumes: Task 1 (`plural`, `splitHeading`, `splitStat`), Task 3 primitives, `colorAt`, `fvColorVars`, `HomeInfo`, `TeamMember` (`@/app/lib/api/types`), `getHomePageData()` (`app/(site)/homepage-data.ts`, unchanged), `RequestCallbackModal`.
- Produces:
  - `buildExplorerAreas(cards: ServicesCardInput[], complex: ComplexAreaInput[]): ExplorerArea[]`
  - `ExplorerArea = { key; title; icon; heading; description; cta: {label, href}; meta; rows: ExplorerRow[] }`
  - `ExplorerRow = { kind: 'link' | 'accordion'; title; href; description?; count?; icon? }`
  - `<HomeHero banner cards team rail?: ReactNode>`. The **Solutions plan** passes `rail={<SolutionRail …/>}`.
  - `DEFAULT_BANNER`, `DEFAULT_SERVICES`, `DEFAULT_STATS` from `homeDefaults.ts`

- [ ] **Step 1: Write the failing explorer tests**

`tests/fv-explorer.test.ts`:
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExplorerAreas } from '../app/lib/fv/explorer';

const GST = {
  title: 'GST Services',
  description: 'Complete GST registration, filing, and compliance solutions for your business.',
  features: ['GST Registration', ' ', 'Return Filing'],
  href: '/services/gst',
  icon: 'Receipt',
};

test('cards become link areas whose rows point at the card href', () => {
  const [area] = buildExplorerAreas([GST], []);
  assert.equal(area.key, 'card-0');
  assert.equal(area.heading, 'GST Services');
  assert.equal(area.meta, '2 services');
  assert.deepEqual(area.cta, { label: 'Explore GST Services', href: '/services/gst' });
  assert.deepEqual(area.rows, [
    { kind: 'link', title: 'GST Registration', href: '/services/gst' },
    { kind: 'link', title: 'Return Filing', href: '/services/gst' },
  ]);
});

test('complex areas follow the cards, drop zero-count subcategories, and link to the listing', () => {
  const areas = buildExplorerAreas([GST], [
    {
      key: 'ipo',
      subcategories: [
        { slug: 'ipo-advisory', title: 'IPO Advisory & Strategy', shortDescription: 'Advisory', iconName: 'TrendingUp', itemsCount: 73 },
        { slug: 'pre-ipo-funding', title: 'Pre-IPO Funding', itemsCount: 0 },
      ],
    },
  ]);
  assert.deepEqual(areas.map((a) => a.key), ['card-0', 'ipo']);
  const ipo = areas[1];
  assert.equal(ipo.heading, 'Take Your Company Public with Confidence');
  assert.equal(ipo.meta, '73 services');
  assert.deepEqual(ipo.cta, { label: 'View All IPO Services', href: '/services/ipo' });
  assert.deepEqual(ipo.rows, [
    {
      kind: 'accordion',
      title: 'IPO Advisory & Strategy',
      href: '/services/ipo/ipo-advisory',
      description: 'Advisory',
      count: 73,
      icon: 'TrendingUp',
    },
  ]);
});

test('areas with no non-empty subcategories are omitted', () => {
  const areas = buildExplorerAreas([], [
    { key: 'legal', subcategories: [] },
    { key: 'banking-finance', subcategories: [{ slug: 'x', title: 'X', itemsCount: 0 }] },
  ]);
  assert.deepEqual(areas, []);
});

test('invalid cards are skipped and missing inputs are tolerated', () => {
  const bad = { ...GST, href: '' };
  assert.deepEqual(buildExplorerAreas([bad], []), []);
  assert.deepEqual(buildExplorerAreas(undefined as never, undefined as never), []);
});
```
Run: `./scripts/test-pure.sh` → FAIL (module not found).

- [ ] **Step 2: Implement `app/lib/fv/explorer.ts`**

```ts
import { plural } from './text';

/** Maps home CMS data (Professional Services cards + IPO/Legal/Banking subcategories) to explorer areas. */
export interface ExplorerRow {
  kind: 'link' | 'accordion';
  title: string;
  href: string;
  description?: string;
  count?: number;
  icon?: string;
}

export interface ExplorerArea {
  key: string;
  title: string;
  icon: string;
  heading: string;
  description: string;
  cta: { label: string; href: string };
  meta: string;
  rows: ExplorerRow[];
}

export interface ServicesCardInput {
  title: string;
  description: string;
  features: string[];
  href: string;
  icon: string;
}

export interface SubcategoryInput {
  slug: string;
  title: string;
  shortDescription?: string;
  iconName?: string;
  itemsCount?: number;
}

export type ComplexKey = 'ipo' | 'legal' | 'banking-finance';

export interface ComplexAreaInput {
  key: ComplexKey;
  subcategories: SubcategoryInput[];
}

// Copy taken verbatim from the former IPOSection / LegalSection / BankingFinanceSection headers.
const COMPLEX_COPY: Record<ComplexKey, { title: string; icon: string; heading: string; description: string; cta: string }> = {
  ipo: {
    title: 'IPO',
    icon: 'TrendingUp',
    heading: 'Take Your Company Public with Confidence',
    description:
      'Comprehensive Initial Public Offering services from advisory to listing, guiding you through every step of your IPO journey.',
    cta: 'View All IPO Services',
  },
  legal: {
    title: 'Legal',
    icon: 'Scale',
    heading: 'Expert Legal Representation',
    description: 'Comprehensive legal services across civil, criminal, corporate, and tax litigation matters.',
    cta: 'View All Legal Services',
  },
  'banking-finance': {
    title: 'Banking & Finance',
    icon: 'Landmark',
    heading: 'Secure Financing for Your Business Growth',
    description:
      'Comprehensive banking and finance solutions including loans, credit facilities, project finance, and funding support to fuel your business expansion.',
    cta: 'View All Banking & Finance Services',
  },
};

export function buildExplorerAreas(cards: ServicesCardInput[], complex: ComplexAreaInput[]): ExplorerArea[] {
  const fromCards: ExplorerArea[] = (cards ?? [])
    .filter((card) => card && card.title && card.href)
    .map((card, i) => {
      const features = (card.features ?? []).map((f) => (typeof f === 'string' ? f.trim() : '')).filter(Boolean);
      return {
        key: `card-${i}`,
        title: card.title,
        icon: card.icon || 'FileText',
        heading: card.title,
        description: card.description ?? '',
        cta: { label: `Explore ${card.title}`, href: card.href },
        meta: plural(features.length, 'service'),
        rows: features.map((title) => ({ kind: 'link' as const, title, href: card.href })),
      };
    });

  const fromComplex: ExplorerArea[] = [];
  for (const area of complex ?? []) {
    const subs = (area.subcategories ?? []).filter((s) => s && s.slug && s.title && (s.itemsCount ?? 0) > 0);
    if (subs.length === 0) continue;
    const copy = COMPLEX_COPY[area.key];
    const total = subs.reduce((sum, s) => sum + (s.itemsCount ?? 0), 0);
    fromComplex.push({
      key: area.key,
      title: copy.title,
      icon: copy.icon,
      heading: copy.heading,
      description: copy.description,
      cta: { label: copy.cta, href: `/services/${area.key}` },
      meta: plural(total, 'service'),
      rows: subs.map((s) => ({
        kind: 'accordion' as const,
        title: s.title,
        href: `/services/${area.key}/${s.slug}`,
        description: s.shortDescription ?? '',
        count: s.itemsCount ?? 0,
        icon: s.iconName || 'FileText',
      })),
    });
  }

  return [...fromCards, ...fromComplex];
}
```
Run: `./scripts/test-pure.sh` → all pass.

- [ ] **Step 3: Create `app/lib/fv/homeDefaults.ts`**

These are the fallbacks the old components carried inline, copied verbatim.
```ts
import type { HomeInfo } from '@/app/lib/api/types';

/** Fallbacks used when /home-info is unavailable (copied from the pre-L3 components). */
export const DEFAULT_BANNER: HomeInfo['banner'] = {
  heading: 'Your Complete Tax & Compliance Solution',
  description:
    'Calculate, Comply, and Save with Confidence. Professional tax calculators, compliance dashboard, and expert guidance all in one place.',
  button1Text: 'Request Callback',
  button2Text: 'Connect on WhatsApp',
  badge: 'Trusted by 50,000+ Businesses',
  checklistItems: ['10M+ Invoices Processed', '50K+ Businesses Trust Us', '100% Accurate Calculations'],
  heroImage: '',
  heroImageAlt: 'Tax Solutions',
  heroImages: [],
  heroChips: [
    { value: '15L+', label: 'Returns Filed' },
    { value: '100%', label: 'Accurate' },
  ],
};

export const DEFAULT_SERVICES: HomeInfo['services'] = {
  heading: 'Professional Services',
  subheading:
    'From business registration to tax compliance, we handle all your professional service needs with expert guidance',
  cards: [
    {
      title: 'GST Services',
      description: 'Complete GST registration, filing, and compliance solutions for your business.',
      features: ['GST Registration', 'Return Filing', 'Annual Returns', 'LUT Filing'],
      href: '/services/gst',
      icon: 'Receipt',
      colorGradient: 'from-accent to-primary',
    },
    {
      title: 'Business Registration',
      description: 'Start your business with expert guidance on company formation and registration.',
      features: ['Private Limited', 'LLP Registration', 'OPC Formation', 'Proprietorship'],
      href: '/services/registration',
      icon: 'Building2',
      colorGradient: 'from-primary to-teal',
    },
    {
      title: 'Income Tax Services',
      description: 'Expert income tax filing and compliance for individuals and businesses.',
      features: ['ITR Filing', 'TDS Returns', 'Tax Planning', 'Notice Handling'],
      href: '/services/income-tax',
      icon: 'Calculator',
      colorGradient: 'from-teal to-success',
    },
    {
      title: 'Trademark & IP',
      description: 'Protect your brand with trademark registration and IP services.',
      features: ['Trademark Registration', 'Copyright', 'Patent Filing', 'Design Registration'],
      href: '/services/trademarks',
      icon: 'Award',
      colorGradient: 'from-brand-blue-light to-accent',
    },
  ],
  ctaButtonText: 'View All Services',
  ctaButtonLink: '/services',
};

export const DEFAULT_STATS: NonNullable<HomeInfo['stats']> = {
  items: [
    { value: 10, suffix: 'M+', label: 'Invoices Processed', icon: 'FileText' },
    { value: 50, suffix: 'K+', label: 'Businesses Trusted', icon: 'Users' },
    { value: 27, prefix: '₹', suffix: 'Cr+', label: 'Trade Value', icon: 'TrendingUp' },
    { value: 15, suffix: 'L+', label: 'Returns Filed', icon: 'FileCheck' },
  ],
};
```

- [ ] **Step 4: Create `app/components/fv/Explorer.tsx`**

```tsx
'use client';

import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from './IconTile';
import { colorAt, fvColorVars } from '@/app/lib/fv/colors';
import { plural } from '@/app/lib/fv/text';
import type { ExplorerArea } from '@/app/lib/fv/explorer';

/**
 * L3 "service explorer": vertical tabs (horizontal chip scroller ≤1024px) + one panel per area.
 * Panels use the `hidden` attribute, so every link stays in the DOM for crawlers.
 */
export default function Explorer({ areas }: { areas: ExplorerArea[] }) {
  const [active, setActive] = useState(0);
  const [openRows, setOpenRows] = useState<Set<string>>(
    () => new Set(areas.filter((a) => a.rows[0]?.kind === 'accordion').map((a) => `${a.key}:0`)),
  );
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  if (areas.length === 0) return null;

  const select = (index: number) => {
    const next = (index + areas.length) % areas.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: areas.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      select(moves[e.key]);
    }
  };

  const toggleRow = (id: string) =>
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[290px_1fr] lg:gap-6">
      <div
        role="tablist"
        aria-label="Service areas"
        aria-orientation="vertical"
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 lg:sticky lg:top-24 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {areas.map((area, i) => {
          const on = i === active;
          return (
            <button
              key={area.key}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`xp-tab-${area.key}`}
              aria-controls={`xp-panel-${area.key}`}
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={clsx(
                'flex flex-none snap-start items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors lg:w-full',
                on ? 'border-fv-blue-d bg-fv-blue-d text-white' : 'border-fv-line bg-white text-fv-navy hover:border-[#CFE2F2]',
              )}
            >
              <IconTile name={area.icon} color={colorAt(i)} size="sm" className={on ? '!bg-white/20 !text-white' : undefined} />
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-sm font-bold">{area.title}</span>
                <span className={clsx('hidden text-xs lg:block', on ? 'text-white/80' : 'text-fv-slate')}>{area.meta}</span>
              </span>
              <ChevronRight aria-hidden="true" className={clsx('ml-auto hidden h-4 w-4 lg:block', on ? 'text-white' : 'text-fv-muted')} />
            </button>
          );
        })}
      </div>

      {areas.map((area, i) => (
        <div
          key={area.key}
          role="tabpanel"
          id={`xp-panel-${area.key}`}
          aria-labelledby={`xp-tab-${area.key}`}
          hidden={i !== active}
          className="fv-card overflow-hidden"
        >
          <div
            style={fvColorVars(colorAt(i)) as CSSProperties}
            className="flex items-start gap-4 border-b border-fv-line bg-[linear-gradient(180deg,var(--cp),#ffffff)] p-5 md:p-6"
          >
            <IconTile name={area.icon} color={colorAt(i)} size="lg" />
            <div className="min-w-0">
              <h3 className="text-xl font-extrabold leading-snug text-fv-navy md:text-[22px]">{area.heading}</h3>
              <p className="mt-1.5 max-w-[620px] text-[15px] leading-relaxed text-fv-slate">{area.description}</p>
              <Link href={area.cta.href} className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-fv-blue-d hover:text-fv-blue-dd">
                {area.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <ul className="px-5 pb-2 md:px-6">
            {area.rows.map((row, n) => {
              const rowId = `${area.key}:${n}`;
              if (row.kind === 'link') {
                return (
                  <li key={rowId} className="border-b border-fv-line last:border-0">
                    <Link href={row.href} className="flex items-center gap-3 py-4 text-[15px] font-semibold text-fv-navy hover:text-fv-blue-d">
                      <IconTile icon={CheckCircle2} color={colorAt(i)} size="sm" />
                      <span className="min-w-0 flex-1">{row.title}</span>
                      <ArrowRight className="h-4 w-4 flex-none text-fv-muted" aria-hidden="true" />
                    </Link>
                  </li>
                );
              }
              const open = openRows.has(rowId);
              const bodyId = `xp-row-${area.key}-${n}`;
              return (
                <li key={rowId} className="border-b border-fv-line last:border-0">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={bodyId}
                    onClick={() => toggleRow(rowId)}
                    className="flex w-full items-center gap-3 py-4 text-left text-[15px] font-semibold text-fv-navy hover:text-fv-blue-d"
                  >
                    <IconTile name={row.icon} color={colorAt(i)} size="sm" />
                    <span className="min-w-0 flex-1">{row.title}</span>
                    {row.count !== undefined && (
                      <span className="whitespace-nowrap text-[13px] font-semibold text-fv-slate">{plural(row.count, 'service')}</span>
                    )}
                    <ChevronDown
                      aria-hidden="true"
                      className={clsx('h-4 w-4 flex-none text-fv-muted transition-transform', open && 'rotate-180 text-fv-blue-d')}
                    />
                  </button>
                  <div id={bodyId} hidden={!open} className="pb-4 text-sm leading-relaxed text-fv-slate md:pl-[46px]">
                    {row.description}
                    <Link href={row.href} className="mt-2 flex w-fit items-center gap-1.5 text-[13.5px] font-semibold text-fv-blue-d hover:text-fv-blue-dd">
                      View services
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `app/components/home/DashboardCard.tsx`**

```tsx
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Building2, ChevronRight, FileCheck, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from '@/app/components/fv/IconTile';
import { colorAt, type FvColor } from '@/app/lib/fv/colors';
import { splitStat } from '@/app/lib/fv/text';
import type { HomeInfo, TeamMember } from '@/app/lib/api/types';

const STAT_STYLE: { color: FvColor; icon: LucideIcon }[] = [
  { color: 'green', icon: FileCheck },
  { color: 'blue', icon: Building2 },
  { color: 'orange', icon: BadgeCheck },
];

const CHIP_STYLE: { color: FvColor; icon: LucideIcon }[] = [
  { color: 'green', icon: FileCheck },
  { color: 'purple', icon: ShieldCheck },
];

interface DashboardCardProps {
  banner: HomeInfo['banner'];
  cards: HomeInfo['services']['cards'];
  team: TeamMember[];
}

/** L3 hero "client dashboard" panel, built only from existing Home Info + Team data. */
export default function DashboardCard({ banner, cards, team }: DashboardCardProps) {
  const avatars = team.filter((m) => m.avatar).slice(0, 4);
  const stats = (banner.checklistItems ?? []).slice(0, 3).map(splitStat);
  const chips = (banner.heroChips ?? []).filter((c) => c?.value).slice(0, 2);

  return (
    <aside aria-label="FinVidhi at a glance" className="fv-card min-w-0 p-5 shadow-fv-raised md:p-6">
      <div className="flex items-center gap-3 border-b border-fv-line pb-4">
        {avatars.length > 0 && (
          <div className="flex flex-none">
            {avatars.map((member, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={member._id}
                src={member.avatar}
                alt=""
                width={36}
                height={36}
                loading="lazy"
                className={clsx('h-9 w-9 rounded-full border-2 border-white bg-fv-wash object-cover', i > 0 && '-ml-2.5')}
              />
            ))}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-fv-navy">{banner.badge || 'Trusted by growing businesses'}</p>
          <p className="text-[13px] text-fv-slate">{team.length > 0 ? `${team.length} in-house experts` : 'Expert CA & CS team'}</p>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {stats.map((stat, i) => {
            const style = STAT_STYLE[i];
            return (
              <div key={`${stat.label}-${i}`} className="flex items-center gap-2.5 rounded-xl bg-fv-wash p-3">
                <IconTile icon={style.icon} color={style.color} size="sm" solid />
                <div className="min-w-0">
                  {stat.value && <p className="text-base font-extrabold leading-tight text-fv-navy">{stat.value}</p>}
                  <p className="text-[11.5px] leading-snug text-fv-slate">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1.15fr]">
        {chips.length > 0 && (
          <div className="rounded-xl border border-fv-line p-3.5">
            <p className="mb-1 text-[13px] font-bold text-fv-navy">Highlights</p>
            {chips.map((chip, i) => (
              <div key={`${chip.value}-${i}`} className="flex items-center gap-2.5 py-1.5">
                <IconTile icon={CHIP_STYLE[i].icon} color={CHIP_STYLE[i].color} size="sm" />
                <div>
                  <p className="text-[13.5px] font-bold text-fv-navy">{chip.value}</p>
                  <p className="text-[11.5px] text-fv-slate">{chip.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {cards.length > 0 && (
          <nav aria-label="Quick links" className={clsx('rounded-xl border border-fv-line p-3.5', chips.length === 0 && 'sm:col-span-2')}>
            <p className="mb-1 text-[13px] font-bold text-fv-navy">Quick links</p>
            {cards.map((card, i) => (
              <Link
                key={`${card.href}-${i}`}
                href={card.href}
                className="flex items-center gap-2.5 py-1.5 text-[13.5px] font-semibold text-fv-navy hover:text-fv-blue-d"
              >
                <IconTile name={card.icon} color={colorAt(i)} size="sm" />
                <span className="min-w-0 flex-1 truncate">{card.title}</span>
                <ChevronRight className="h-4 w-4 flex-none text-fv-muted" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 6: Create `app/components/home/HomeHero.tsx`**

```tsx
'use client';

import { useState, type ReactNode } from 'react';
import { BadgeCheck, MessageCircle, Phone } from 'lucide-react';
import Button from '@/app/components/fv/Button';
import Pill from '@/app/components/fv/Pill';
import SearchBar from '@/app/components/fv/SearchBar';
import { LIGHT_HERO_BG } from '@/app/components/fv/LightHero';
import RequestCallbackModal from './RequestCallbackModal';
import DashboardCard from './DashboardCard';
import { splitHeading } from '@/app/lib/fv/text';
import type { HomeInfo, TeamMember } from '@/app/lib/api/types';

// Same source as the previous HeroSection (env override, fallback number).
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919625675722';

interface HomeHeroProps {
  banner: HomeInfo['banner'];
  cards: HomeInfo['services']['cards'];
  team: TeamMember[];
  /** Solution rail attached to the hero's bottom edge (Solutions plan). */
  rail?: ReactNode;
}

export default function HomeHero({ banner, cards, team, rail }: HomeHeroProps) {
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [line1, line2] = splitHeading(banner.heading);

  return (
    <section className={`relative overflow-hidden ${LIGHT_HERO_BG}`}>
      <div className="fv-wrap grid items-center gap-10 pb-10 pt-10 md:pb-12 md:pt-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
        <div className="min-w-0">
          {banner.badge && (
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#CFE2F2] bg-white px-3 py-1.5 text-[13px] font-semibold text-fv-blue-d">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {banner.badge}
            </span>
          )}
          <h1 className="text-[36px] font-extrabold leading-[1.06] tracking-[-0.03em] text-fv-navy sm:text-[44px] lg:text-[52px]">
            {line1}
            {line2 && (
              <>
                <br />
                <span className="text-fv-blue">{line2}</span>
              </>
            )}
          </h1>
          {/* Justified per Vikrant's standing preference for hero descriptions. */}
          <p className="mt-5 max-w-[560px] text-justify text-base leading-relaxed text-fv-slate md:text-[17px]">{banner.description}</p>
          <SearchBar id="home-search" className="mt-7 max-w-[560px]" />
          {cards.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-fv-muted">
              <span>Popular:</span>
              {cards.map((card, i) => (
                <Pill key={`${card.href}-${i}`} href={card.href}>
                  {card.title}
                </Pill>
              ))}
            </div>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button size="lg" onClick={() => setCallbackOpen(true)}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              {banner.button1Text}
            </Button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-fv-blue-d hover:text-fv-blue-dd"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {banner.button2Text}
            </a>
          </div>
        </div>
        <DashboardCard banner={banner} cards={cards} team={team} />
      </div>
      {rail}
      <RequestCallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </section>
  );
}
```

- [ ] **Step 7: Restyle the four home sections (data logic untouched)**

**`BenefitsSection.tsx`:**
1. Replace the import line `import { TrendingUp, Shield, Zap } from 'lucide-react';` and the line `import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';` with:
```tsx
import { BadgeCheck, Eye, ShieldCheck } from 'lucide-react';
import Section from '../fv/Section';
import SectionHead from '../fv/SectionHead';
import IconTile from '../fv/IconTile';
```
2. Replace the `iconMap` constant (`// Icon mapping` … `};`) with `const ICONS = [Eye, ShieldCheck, BadgeCheck];`.
3. Replace everything from the line `  return (` (the one after the `useEffect`) to the end of the file with:
```tsx
  return (
    <Section soft>
      <SectionHead align="center" title={benefitsData.heading} subtitle={benefitsData.subheading} />
      <ul className="fv-card grid divide-y divide-fv-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {benefitsData.items.map((item, i) => (
          <li key={`${item.title}-${i}`} className="px-6 py-8 text-center">
            <IconTile icon={ICONS[i % ICONS.length]} size="lg" className="mx-auto !rounded-full" />
            <h3 className="mt-4 text-lg font-bold text-fv-navy">{item.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-fv-slate">{item.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
```
(Benefit images are no longer shown; the admin fields stay and are simply unused.)

**`TeamSection.tsx`:**
1. Replace the import block (from `import { Autoplay, Pagination } from 'swiper/modules';` through `import { Loader2 } from 'lucide-react';`) with:
```tsx
import { teamService } from '@/app/lib/api';
import { TeamMember } from '@/app/lib/api/types';
import TeamCard from '../team/TeamCard';
import Section from '../fv/Section';
import SectionHead from '../fv/SectionHead';
```
2. Replace everything from `  if (!hasLoaded) {` to the end of the file with:
```tsx
  if (!hasLoaded) {
    return <section ref={sectionRef} className="py-16 md:py-24" />;
  }

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHead
        title="Meet the people behind the mission"
        subtitle="A cross-functional crew of builders, designers, and domain experts focused on simplifying taxes and compliance for everyone."
        action={{ label: 'Meet the team', href: '/team' }}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {teamMembers.slice(0, 5).map((member) => (
          <TeamCard key={member._id} member={member} />
        ))}
      </div>
    </Section>
  );
}
```
If `loading` becomes unused, keep it (the fetch logic is untouched). TypeScript does not flag an unused state variable here.

**`TestimonialsSection.tsx`:**
1. Replace `import { Quote, Star } from 'lucide-react';` with `import { Star } from 'lucide-react';` and add:
```tsx
import Section from '../fv/Section';
import SectionHead from '../fv/SectionHead';
```
2. Replace the `colorSchemes` constant and the whole `TestimonialCard` function (from `// Brand-only color schemes` to the closing `}` of `TestimonialCard`) with:
```tsx
const TRUNCATE_LENGTH = 220;

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const text = testimonial.testimonial || '';
  const isTruncated = text.length > TRUNCATE_LENGTH;
  const meta = [testimonial.personRole, testimonial.companyName].filter(Boolean).join(' · ');
  const logo = testimonial.companyLogo || testimonial.personAvatar;

  return (
    <figure className="fv-card flex h-full flex-col p-6">
      <div className="flex gap-0.5" aria-label={`${testimonial.rating || 5} out of 5 stars`}>
        {[...Array(testimonial.rating || 5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-[#F5A524] text-[#F5A524]" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-fv-navy">
        {expanded || !isTruncated ? text : `${text.slice(0, TRUNCATE_LENGTH)}…`}
        {isTruncated && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="ml-1 rounded font-semibold text-fv-blue-d hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d"
          >
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-fv-line pt-4">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" loading="lazy" decoding="async" className="h-10 w-10 flex-none rounded-full border border-fv-line bg-white object-contain p-0.5" />
        ) : (
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-fv-blue-50 text-sm font-bold text-fv-blue-d">
            {testimonial.personName?.charAt(0) || '?'}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-fv-navy">{testimonial.personName}</span>
          {meta && <span className="block text-xs text-fv-slate">{meta}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
```
3. Replace everything from `  return (` inside `TestimonialsSection` (after the `if (testimonials.length === 0)` guard) to the end of the file with:
```tsx
  return (
    <Section soft>
      <div ref={sectionRef as React.RefObject<HTMLDivElement>}>
        <SectionHead align="center" title="What our clients say" subtitle="See what our users have to say about their experience" />
        <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <TestimonialCard key={testimonial._id || index} testimonial={testimonial} />
          ))}
        </div>
        <div className="md:hidden">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            autoplay={{ delay: 3500, disableOnInteraction: true }}
            pagination={{ clickable: true }}
            loop={testimonials.length > 1}
            style={
              {
                '--swiper-pagination-color': '#1E6C9D',
                '--swiper-pagination-bullet-inactive-color': '#D1D7E7',
                '--swiper-pagination-bullet-inactive-opacity': '1',
              } as React.CSSProperties
            }
            className="testimonials-swiper !pb-10"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial._id || index}>
                <TestimonialCard testimonial={testimonial} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </Section>
  );
}
```
4. The loading-skeleton branch `if (!hasFetchedRef.current) { return <section ref={sectionRef} … /> }` stays as is. `sectionRef` is typed `useRef<HTMLElement>`, hence the cast in step 3.

**`GovPortalsSection.tsx`:**
1. Replace the imports `import { motion } from 'framer-motion';`, `import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';` and `import Card from '../ui/Card';` with:
```tsx
import type { LucideIcon } from 'lucide-react';
import Section from '../fv/Section';
import SectionHead from '../fv/SectionHead';
import Tile from '../fv/Tile';
import { colorAt } from '@/app/lib/fv/colors';
```
and remove `ExternalLink,` from the lucide import list.
2. Replace the whole `export default function GovPortalsSection()` with:
```tsx
export default function GovPortalsSection() {
  return (
    <Section tight>
      <SectionHead title="Official Government Portals" subtitle="Quick access to the government portals we work with every day" />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {GOV_PORTALS.map((portal, i) => (
          <li key={portal.name}>
            <Tile
              title={portal.name}
              text={portal.description}
              href={portal.href}
              external
              icon={portal.icon as LucideIcon}
              color={colorAt(i)}
              ariaLabel={`${portal.name} — opens official government portal in a new tab`}
            />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-xs text-fv-muted">
        These are official Government of India portals. FinVidhi is not affiliated with or endorsed by them.
      </p>
    </Section>
  );
}
```

- [ ] **Step 8: Rewrite `app/components/team/TeamCard.tsx`**

It's used on home and `/team`. The props are unchanged; it's now a photo card with a stretched link.
```tsx
import Link from 'next/link';
import { Linkedin } from 'lucide-react';
import { clsx } from 'clsx';
import type { TeamMember } from '@/app/lib/api/types';

type TeamCardProps = {
  member: TeamMember;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamCard({ member, className }: TeamCardProps) {
  return (
    <article className={clsx('fv-card group relative flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-fv-raised', className)}>
      <div className="aspect-square w-full overflow-hidden bg-fv-wash">
        {member.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatar}
            alt={member.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-3xl font-bold text-fv-blue">{getInitials(member.name)}</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold leading-snug text-fv-navy">
          <Link href={`/team/${member.id}`} className="after:absolute after:inset-0">
            {member.name}
          </Link>
        </h3>
        <p className="text-[13px] text-fv-slate">{member.role}</p>
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="relative z-10 mt-3 grid h-8 w-8 place-items-center rounded-lg bg-[#0A66C2] text-white hover:opacity-90"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
```

- [ ] **Step 9: Rewrite `app/(site)/page.tsx`**

```tsx
import { getHomePageData } from './homepage-data';
import HomeHero from '../components/home/HomeHero';
import BenefitsSection from '../components/home/BenefitsSection';
import TeamSection from '../components/home/TeamSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import GovPortalsSection from '../components/home/GovPortalsSection';
import StatsStrip from '../components/fv/StatsStrip';
import Section from '../components/fv/Section';
import SectionHead from '../components/fv/SectionHead';
import Explorer from '../components/fv/Explorer';
import CTASplit from '../components/fv/CTASplit';
import { buildExplorerAreas } from '../lib/fv/explorer';
import { DEFAULT_BANNER, DEFAULT_SERVICES, DEFAULT_STATS } from '../lib/fv/homeDefaults';
import type { Metadata } from 'next';

// L3 home (spec 2026-10-05-l3-site-redesign). The previous HeroSection, StatsSection,
// ServicesSection, IPO/Legal/BankingFinance sections, CTASection and ProductsGrid are
// no longer rendered here; their files are kept on disk.

export const metadata: Metadata = {
  title: { absolute: 'FinVidhi - Your Complete Tax & Compliance Solution' },
  description:
    'Smart finance and strong compliance for Indian businesses. GST, income tax, audit, business registration, and expert advisory — all in one place.',
  alternates: { canonical: '/' },
};

export const revalidate = 300;

export default async function HomePage() {
  const data = await getHomePageData();
  const banner = data.homeInfo?.banner ?? DEFAULT_BANNER;
  const services = data.homeInfo?.services?.cards?.length ? data.homeInfo.services : DEFAULT_SERVICES;
  const stats = data.homeInfo?.stats?.items?.length ? data.homeInfo.stats.items : DEFAULT_STATS.items;
  const team = Array.isArray(data.teamMembers) ? data.teamMembers : [];
  const areas = buildExplorerAreas(services.cards, [
    { key: 'ipo', subcategories: data.ipoData?.subcategories ?? [] },
    { key: 'legal', subcategories: data.legalData?.subcategories ?? [] },
    { key: 'banking-finance', subcategories: data.bankingData?.subcategories ?? [] },
  ]);
  const ctaImage = banner.heroImages?.find((img) => img?.url)?.url || banner.heroImage || '';

  return (
    <>
      <HomeHero banner={banner} cards={services.cards} team={team} />
      <StatsStrip items={stats} />
      <Section aria-labelledby="services-explorer-title">
        <SectionHead
          id="services-explorer-title"
          title={services.heading}
          subtitle={services.subheading}
          action={{ label: services.ctaButtonText || 'View All Services', href: services.ctaButtonLink || '/services' }}
        />
        <Explorer areas={areas} />
      </Section>
      <BenefitsSection benefitsData={data.homeInfo?.benefits} />
      <TeamSection serverData={team} />
      <TestimonialsSection serverData={data.testimonials} />
      <GovPortalsSection />
      <CTASplit
        title="Ready to Simplify Your Taxes?"
        text="Join 50,000+ businesses and individuals who trust FinVidhi for their tax and compliance needs. Start for free today!"
        values={['No credit card required', 'Free forever', 'Setup in 2 minutes']}
        primary={{ label: 'View Services', href: '/services' }}
        secondary={{ label: 'Explore Calculators', href: '/calculators' }}
        image={ctaImage ? { src: ctaImage, alt: banner.heroImageAlt || 'FinVidhi tax and compliance' } : undefined}
      />
    </>
  );
}
```

- [ ] **Step 10: Verify**

Run: `./scripts/test-pure.sh` → all pass. Run: `npx tsc --noEmit` → exit 0.
With the backend on :4000 and `npm run dev`, open `http://localhost:3000/` and confirm:
- The hero shows two lines ("Smart Finance." navy / "Strong Compliance." blue), the search box, the Popular pills and the dashboard card.
- The stats strip shows "1,000+" with no "₹".
- The explorer shows 4 cards + IPO / Legal / Banking. "Pre-IPO Funding" (0 services) is absent.
- Arrow keys move between explorer tabs.
- The team row shows 5 photo cards, followed by testimonials (3 columns), portals (5 tiles) and the CTA with the image.

Stop the backend (`lsof -ti:4000 | xargs kill`), hard-reload `/` once, and confirm it still renders (defaults, no crash). Then restart the backend (`npm run dev` in `cleartax backend`).

- [ ] **Step 11: Checkpoint (no commit)**

Stop and show Vikrant the home page at 1440 and 390 before continuing. This is the main visual sign-off for L3.

---

### Task 6: Inner shared components: PageHero, Card, the service family

**Files:**
- Rewrite: `app/components/common/PageHero.tsx`, `app/components/ui/Card.tsx`, `app/components/services/ServiceHero.tsx`, `ServiceCard.tsx`, `ServiceFeatures.tsx`, `ProcessTimeline.tsx`, `FAQAccordion.tsx`, `RelatedServices.tsx`
- Modify: `app/components/services/ServiceForm.tsx`

**Interfaces:**
- Consumes: `LightHero`, `LIGHT_HERO_BG`, `IconTile`, `fv/Button`, `formatFromPrice`, `Breadcrumb`.
- Produces: the same default exports and props as today, plus `RelatedServices` `subcategory?: string`.

- [ ] **Step 1: Confirm the admin doesn't use these components**

Run: `grep -rln "ui/Card\|common/PageHero\|services/Service\|services/FAQ\|services/Process\|services/Related" 'app/(admin)' app/components/admin`
Expected: no output.

- [ ] **Step 2: Rewrite `PageHero.tsx`**

```tsx
import type { ComponentType, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import LightHero from '@/app/components/fv/LightHero';

/** Shared inner-page hero, now the light L3 hero (spec D4). Props unchanged. */
interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Optional extra content rendered under the subtitle (search bar, filters). */
  children?: ReactNode;
}

export default function PageHero({ title, subtitle, icon, children }: PageHeroProps) {
  return (
    <LightHero title={title} subtitle={subtitle} icon={icon as LucideIcon | undefined}>
      {children}
    </LightHero>
  );
}
```

- [ ] **Step 3: Rewrite `ui/Card.tsx` (public-only; props unchanged)**

```tsx
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'fv-card p-6 transition duration-200',
        hoverable && 'cursor-pointer hover:-translate-y-0.5 hover:border-[#CFE2F2] hover:shadow-fv-raised',
        className,
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `ServiceCard.tsx` (props unchanged)**

```tsx
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Clock, FileText } from 'lucide-react';
import IconTile from '../fv/IconTile';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { formatFromPrice } from '@/app/lib/fv/text';

interface ServiceCardProps {
  title: string;
  shortDescription: string;
  /** Omit when passing from Server Component; use iconName instead. */
  icon?: LucideIcon;
  iconName?: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  slug: string;
  category: string;
  subcategory?: string; // Optional subcategory for complex categories
}

export default function ServiceCard({
  title,
  shortDescription,
  icon: IconProp,
  iconName,
  price,
  duration,
  slug,
  category,
  subcategory,
}: ServiceCardProps) {
  const Icon = IconProp ?? (iconName ? getIconFromName(iconName) : FileText);
  const href = subcategory
    ? `/services/${category.toLowerCase()}/${subcategory}/${slug}`
    : `/services/${category.toLowerCase()}/${slug}`;
  const fromPrice = formatFromPrice(price);

  return (
    <Link
      href={href}
      className="group fv-card relative flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#CFE2F2] hover:shadow-fv-raised"
    >
      <IconTile icon={Icon as LucideIcon} />
      <h3 className="mt-4 text-base font-bold leading-snug text-fv-navy group-hover:text-fv-blue-d">{title}</h3>
      <p className="mb-4 mt-1.5 line-clamp-2 text-sm leading-relaxed text-fv-slate">{shortDescription}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-fv-line pt-4 text-[13px] text-fv-slate">
        {fromPrice ? (
          <span>
            From <b className="text-[15px] font-extrabold text-fv-navy">{fromPrice}</b>
          </span>
        ) : (
          <b className="font-semibold text-fv-navy">Price on request</b>
        )}
        {duration && duration !== 'N/A' && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {duration}
          </span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Rewrite `ServiceFeatures.tsx`, `ProcessTimeline.tsx`, `FAQAccordion.tsx`**

`ServiceFeatures.tsx`:
```tsx
import { CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from '../fv/IconTile';

interface ServiceFeaturesProps {
  features: string[];
  benefits?: string[];
}

export default function ServiceFeatures({ features, benefits }: ServiceFeaturesProps) {
  const lists = [
    { title: "What's Included", items: features ?? [], color: 'blue' as const },
    { title: 'Key Benefits', items: benefits ?? [], color: 'green' as const },
  ].filter((list) => list.items.length > 0);

  return (
    <div className={clsx('grid gap-5', lists.length > 1 && 'md:grid-cols-2')}>
      {lists.map((list) => (
        <div key={list.title} className="fv-card p-6">
          <h3 className="flex items-center gap-3 text-lg font-bold text-fv-navy">
            <IconTile icon={CheckCircle} color={list.color} size="sm" />
            {list.title}
          </h3>
          <ul className="mt-4 space-y-3">
            {list.items.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-[15px] leading-relaxed text-fv-slate">
                <CheckCircle
                  aria-hidden="true"
                  className={clsx('mt-0.5 h-5 w-5 flex-none', list.color === 'green' ? 'text-fv-green' : 'text-fv-blue')}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

`ProcessTimeline.tsx`:
```tsx
import { Clock } from 'lucide-react';
import { ProcessStep } from '@/app/types/services';

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  if (!steps?.length) return null;
  return (
    <ol className="relative space-y-5 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-fv-line">
      {steps.map((step, index) => (
        <li key={`${step.step}-${index}`} className="relative flex gap-5">
          <span className="relative z-10 grid h-10 w-10 flex-none place-items-center rounded-full border-2 border-fv-blue-d bg-white text-[15px] font-extrabold text-fv-blue-d">
            {step.step}
          </span>
          <div className="fv-card min-w-0 flex-1 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="text-base font-bold text-fv-navy">{step.title}</h4>
              {step.duration && (
                <span className="flex items-center gap-1 whitespace-nowrap text-[13px] text-fv-slate">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {step.duration}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-fv-slate">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

`FAQAccordion.tsx` (answers stay in the DOM via `hidden`, which is better for SEO than the old unmount):
```tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { FAQ } from '@/app/types/services';

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <div className="fv-card divide-y divide-fv-line">
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        const answerId = `faq-answer-${faq.id ?? index}`;
        return (
          <div key={faq.id ?? index}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={answerId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-fv-navy hover:text-fv-blue-d md:px-6"
              >
                {faq.question}
                <ChevronDown
                  aria-hidden="true"
                  className={clsx('h-5 w-5 flex-none text-fv-muted transition-transform', open && 'rotate-180 text-fv-blue-d')}
                />
              </button>
            </h3>
            <div id={answerId} hidden={!open} className="px-5 pb-5 text-[15px] leading-relaxed text-fv-slate md:px-6">
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `RelatedServices.tsx`**

This adds the optional `subcategory`, which fixes the 2-level links on 3-level pages.
```tsx
import { Service } from '@/app/types/services';
import ServiceCard from './ServiceCard';

/** Serializable service (no icon component) for Server Component parents. */
export type SerializableService = Omit<Service, 'icon'> & { iconName: string };

interface RelatedServicesProps {
  services: (Service | SerializableService)[];
  currentServiceId: string;
  category: string;
  /** Set on 3-level pages so cards link to /services/<cat>/<sub>/<slug>. */
  subcategory?: string;
}

export default function RelatedServices({ services, currentServiceId, category, subcategory }: RelatedServicesProps) {
  const relatedServices = services.filter((service) => service.id !== currentServiceId).slice(0, 3);
  if (relatedServices.length === 0) return null;

  return (
    <section aria-labelledby="related-services-title">
      <h2 id="related-services-title" className="mb-6 text-2xl font-extrabold tracking-[-0.02em] text-fv-navy md:text-[30px]">
        Related Services
      </h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {relatedServices.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            shortDescription={service.shortDescription}
            icon={'icon' in service ? service.icon : undefined}
            iconName={service.iconName}
            price={service.price}
            duration={service.duration}
            slug={service.slug}
            category={category}
            subcategory={subcategory}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Restyle `ServiceForm.tsx` (classes and the Button import only)**

1. Replace `import Button from '../ui/Button';` with `import Button from '../fv/Button';`.
2. Replace `<div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-8 border-2 border-accent/20">` with `<div className="fv-card p-6 md:p-8">`.
3. Replace `<h3 className="font-heading font-bold text-2xl text-primary mb-2">` with `<h3 className="mb-2 text-2xl font-extrabold tracking-[-0.02em] text-fv-navy">`.
4. Replace both occurrences of `className="text-accent hover:underline"` with `className="font-semibold text-fv-blue-d hover:underline"`.

- [ ] **Step 8: Rewrite `ServiceHero.tsx` (props and contact-phone logic unchanged)**

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle, Clock, FileText, IndianRupee } from 'lucide-react';
import Breadcrumb from '../common/Breadcrumb';
import Button from '../fv/Button';
import IconTile from '../fv/IconTile';
import { LIGHT_HERO_BG } from '../fv/LightHero';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { contactService } from '@/app/lib/api';

interface ServiceHeroProps {
  title: string;
  shortDescription: string;
  /** Lucide icon component – omit when rendering from Server Component; use iconName instead. */
  icon?: LucideIcon;
  /** Icon name (e.g. "FileText") for Server Component parents – resolved client-side. */
  iconName?: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  } | null;
  duration?: string;
  category: string;
  categorySlug: string;
  onGetStarted?: () => void;
  /** When set, Get Started button scrolls to this element id (for Server Component parents that cannot pass onGetStarted). */
  scrollTargetId?: string;
}

const TRUST_POINTS = ['Expert Assistance', '100% Online Process', 'Money Back Guarantee'];
const CARD_POINTS = ['10,000+ Happy Customers', 'Verified CA/CS Professionals', 'Secure Payment Gateway'];

export default function ServiceHero({
  title,
  shortDescription,
  icon: IconProp,
  iconName,
  price,
  duration,
  category,
  categorySlug,
  onGetStarted,
  scrollTargetId,
}: ServiceHeroProps) {
  const Icon = (IconProp ?? (iconName ? getIconFromName(iconName) : FileText)) as LucideIcon;

  // Phone number is bound to the admin-managed Contact details, not hardcoded.
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    contactService
      .get()
      .then((info) => {
        if (active && info?.phone) setContactPhone(info.phone);
      })
      .catch(() => {
        /* leave unset; the call line is simply hidden if contact info is unavailable */
      });
    return () => {
      active = false;
    };
  }, []);
  const telHref = contactPhone ? `tel:${contactPhone.replace(/[^\d+]/g, '')}` : '';

  const handleGetStarted =
    onGetStarted ??
    (scrollTargetId ? () => document.getElementById(scrollTargetId!)?.scrollIntoView({ behavior: 'smooth' }) : undefined);

  const hasPrice = !!price && price.min > 0;

  return (
    <section className={`relative overflow-hidden border-b border-fv-line ${LIGHT_HERO_BG}`}>
      <div className="fv-wrap py-10 md:py-14">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: category, href: `/services/${categorySlug}` },
            { label: title },
          ]}
        />
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <IconTile icon={Icon} size="lg" solid />
              <span className="rounded-full border border-[#CFE2F2] bg-white px-3 py-1 text-[13px] font-semibold text-fv-blue-d">{category}</span>
            </div>
            <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-fv-navy md:text-[44px]">{title}</h1>
            <p className="mt-4 max-w-[680px] text-base leading-relaxed text-fv-slate md:text-lg">{shortDescription}</p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2 text-[15px] font-medium text-fv-navy">
                  <CheckCircle className="h-5 w-5 text-fv-green" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <aside aria-label="Pricing" className="fv-card p-6 shadow-fv-raised">
            {hasPrice ? (
              <div className="mb-4">
                <p className="text-[13px] font-semibold uppercase tracking-wider text-fv-muted">Starting at</p>
                <p className="mt-1 flex items-center gap-1 text-[32px] font-extrabold leading-none text-fv-navy">
                  <IndianRupee className="h-6 w-6 text-fv-slate" aria-hidden="true" />
                  {price!.min === price!.max
                    ? price!.min.toLocaleString('en-IN')
                    : `${price!.min.toLocaleString('en-IN')} - ${price!.max.toLocaleString('en-IN')}`}
                </p>
                <p className="mt-1.5 text-sm text-fv-slate">All-inclusive pricing</p>
              </div>
            ) : (
              <p className="mb-4 text-lg font-bold text-fv-navy">Price on request</p>
            )}
            {duration && (
              <div className="mb-5 flex items-center gap-2 border-b border-fv-line pb-5 text-[15px] text-fv-navy">
                <Clock className="h-4 w-4 text-fv-slate" aria-hidden="true" />
                {duration}
              </div>
            )}
            <Button type="button" size="lg" className="w-full" onClick={handleGetStarted}>
              Get Started Now
            </Button>
            {contactPhone && (
              <p className="mt-3 text-center text-xs text-fv-slate">
                or call us at{' '}
                <a href={telHref} className="font-semibold text-fv-blue-d hover:underline">
                  {contactPhone}
                </a>
              </p>
            )}
            <ul className="mt-5 space-y-2.5 border-t border-fv-line pt-5">
              {CARD_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-fv-slate">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-none text-fv-green" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Verify**

Run: `npx tsc --noEmit` → exit 0.
Open `/blog`, `/contact`, `/calculators`: each should show the light hero, Inter and white cards. Open `/services/gst/lut`: the light service hero, price card, "Get Started Now" scrolls to the form, and the FAQs open and close.

- [ ] **Step 10: Checkpoint (no commit)**

---

### Task 7: One service-detail body for all 10 service pages

**Files:**
- Create: `app/components/services/ServiceSectionNav.tsx`, `app/components/services/ServiceDetailBody.tsx`
- Modify: `app/(site)/services/[category]/[slug]/[serviceSlug]/page.tsx`, `app/(site)/services/[category]/[slug]/page.tsx` (service branch only), `app/(site)/services/gst/{registration,return-filing,annual-return,e-invoicing,amendment,lut,nil-return,revocation}/page.tsx`

**Interfaces:**
- Consumes: Task 6 components, `FAQ`, `ProcessStep`, `Service` (`@/app/types/services`), `SerializableService`.
- Produces:
  - `<ServiceDetailBody service={ServiceDetailData} aboutTitle? aboutExtra? related? relatedCategory relatedSubcategory? />`
  - `ServiceDetailData = { id; title; longDescription?; features: string[]; benefits?: string[]; process: ProcessStep[]; requirements: string[]; faqs: FAQ[] }`
  - The section anchors `#overview`, `#process`, `#documents`, `#faqs` and the existing `#inquiry-form`.

- [ ] **Step 1: Create `ServiceSectionNav.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `ServiceDetailBody.tsx`**

The section order matches today's pages exactly: About → What You Get → Process → inquiry form → Documents → FAQs → Related.
```tsx
'use client';

import type { ReactNode } from 'react';
import { CheckCircle, FileText } from 'lucide-react';
import ServiceSectionNav from './ServiceSectionNav';
import ServiceFeatures from './ServiceFeatures';
import ProcessTimeline from './ProcessTimeline';
import ServiceForm from './ServiceForm';
import FAQAccordion from './FAQAccordion';
import RelatedServices, { type SerializableService } from './RelatedServices';
import type { FAQ, ProcessStep, Service } from '@/app/types/services';

export interface ServiceDetailData {
  id: string;
  title: string;
  longDescription?: string;
  features: string[];
  benefits?: string[];
  process: ProcessStep[];
  requirements: string[];
  faqs: FAQ[];
}

interface ServiceDetailBodyProps {
  service: ServiceDetailData;
  /** Defaults to "About <title>" (the static GST pages pass their existing headings). */
  aboutTitle?: string;
  aboutExtra?: ReactNode;
  related?: (Service | SerializableService)[];
  relatedCategory: string;
  relatedSubcategory?: string;
}

const H2 = 'text-2xl font-extrabold tracking-[-0.02em] text-fv-navy md:text-[30px]';

export default function ServiceDetailBody({
  service,
  aboutTitle,
  aboutExtra,
  related = [],
  relatedCategory,
  relatedSubcategory,
}: ServiceDetailBodyProps) {
  const process = service.process ?? [];
  const requirements = service.requirements ?? [];
  const faqs = service.faqs ?? [];
  const sections = [
    { id: 'overview', label: 'Overview' },
    ...(process.length ? [{ id: 'process', label: 'Process' }] : []),
    ...(requirements.length ? [{ id: 'documents', label: 'Documents' }] : []),
    ...(faqs.length ? [{ id: 'faqs', label: 'FAQs' }] : []),
  ];

  return (
    <>
      <ServiceSectionNav sections={sections} />
      <div className="fv-wrap space-y-16 py-12 md:space-y-20 md:py-16">
        <section id="overview" className="scroll-mt-32">
          {service.longDescription && (
            <div className="max-w-[820px]">
              <h2 className={H2}>{aboutTitle ?? `About ${service.title}`}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-fv-slate">{service.longDescription}</p>
              {aboutExtra && <div className="mt-6">{aboutExtra}</div>}
            </div>
          )}
          <div className={service.longDescription ? 'mt-12' : undefined}>
            <h2 className={`${H2} mb-6`}>What You Get</h2>
            <ServiceFeatures features={service.features ?? []} benefits={service.benefits} />
          </div>
        </section>

        {process.length > 0 && (
          <section id="process" className="scroll-mt-32">
            <h2 className={`${H2} mb-6`}>Our Simple Process</h2>
            <div className="max-w-[860px]">
              <ProcessTimeline steps={process} />
            </div>
          </section>
        )}

        <section id="inquiry-form" className="scroll-mt-32">
          <ServiceForm serviceId={service.id} serviceTitle={service.title} />
        </section>

        {requirements.length > 0 && (
          <section id="documents" className="scroll-mt-32">
            <div className="rounded-[18px] border border-fv-line bg-fv-wash p-6 md:p-8">
              <h2 className={`${H2} flex items-center gap-3`}>
                <FileText className="h-7 w-7 text-fv-blue" aria-hidden="true" />
                Documents Required
              </h2>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3 text-[15px] text-fv-navy">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-none text-fv-green" aria-hidden="true" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section id="faqs" className="scroll-mt-32">
            <h2 className={`${H2} mb-6`}>Frequently Asked Questions</h2>
            <div className="max-w-[860px]">
              <FAQAccordion faqs={faqs} />
            </div>
          </section>
        )}

        {related.length > 0 && (
          <RelatedServices
            services={related}
            currentServiceId={service.id}
            category={relatedCategory}
            subcategory={relatedSubcategory}
          />
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Adopt it in the 3-level page**

In `app/(site)/services/[category]/[slug]/[serviceSlug]/page.tsx`:
1. Delete the whole block from `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">` (immediately after `<ServiceHero … />`) through its matching closing `</div>` (the one just before the page's last `</div>`). Put in its place:
```tsx
      <ServiceDetailBody
        service={serviceData}
        related={relatedServices}
        relatedCategory={category}
        relatedSubcategory={slug}
      />
```
2. Keep the outer wrapper `<div className="min-h-screen bg-white">` and `<ServiceHero … />` exactly as they are.
3. Replace the imports of `ServiceFeatures`, `ProcessTimeline`, `ServiceForm`, `FAQAccordion`, `RelatedServices` and `ScrollReveal` with `import ServiceDetailBody from '@/app/components/services/ServiceDetailBody';`. Then remove `FileText` / `CheckCircle` from the lucide import if `grep -n "FileText\|CheckCircle" <file>` shows no other use.

- [ ] **Step 4: Adopt it in the `[slug]` page's service branch**

In `app/(site)/services/[category]/[slug]/page.tsx`, inside `if (pageType === 'service' …)`, replace the block from `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">` (immediately after `<ServiceHero … />`) through its matching `</div>` with:
```tsx
        <ServiceDetailBody service={serviceData} related={relatedServices} relatedCategory={category} />
```
Add `import ServiceDetailBody from '@/app/components/services/ServiceDetailBody';`. Remove the imports of `ServiceFeatures`, `ProcessTimeline`, `ServiceForm`, `FAQAccordion` and `RelatedServices` only if `grep` shows no remaining use in the file (the subcategory branch uses `ServiceCard`, which stays).

- [ ] **Step 5: Adopt it in the 8 static GST pages**

In each `app/(site)/services/gst/<page>/page.tsx`, replace the block from `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">` through its matching `</div>` (just before the final `</div>`) with the line from this table. Then replace the five component imports + `ScrollReveal` with `import ServiceDetailBody from '@/app/components/services/ServiceDetailBody';`, and drop unused lucide imports (`FileText`, `CheckCircle`).

| Page | Replacement |
|---|---|
| `lut` | `<ServiceDetailBody service={service} aboutTitle="About GST LUT Filing" related={gstServices} relatedCategory="gst" />` |
| `annual-return` | `<ServiceDetailBody service={service} aboutTitle="About GST Annual Return (GSTR-9)" related={gstServices} relatedCategory="gst" />` |
| `amendment` | `<ServiceDetailBody service={service} aboutTitle="About GST Amendment" related={gstServices} relatedCategory="gst" />` |
| `e-invoicing` | `<ServiceDetailBody service={service} aboutTitle="About GST E-Invoicing Setup" related={gstServices} relatedCategory="gst" />` |
| `revocation` | `<ServiceDetailBody service={service} aboutTitle="About GST Revocation" related={gstServices} relatedCategory="gst" />` |
| `nil-return` | `<ServiceDetailBody service={service} aboutTitle="About GST NIL Return Filing" related={gstServices} relatedCategory="gst" />` |
| `return-filing` | `<ServiceDetailBody service={service} aboutTitle="About GST Return Filing" related={gstServices} relatedCategory="gst" />` |
| `registration` | see below |

`registration` keeps its "Did you know?" callout:
```tsx
      <ServiceDetailBody
        service={service}
        aboutTitle="About GST Registration"
        related={gstServices}
        relatedCategory="gst"
        aboutExtra={
          <div className="rounded-r-xl border-l-4 border-fv-blue bg-fv-blue-50 p-5 text-[15px] leading-relaxed text-fv-navy">
            <strong>Did you know?</strong> GST registration not only makes your business legally compliant but also enables you to expand your operations across India without restrictions. With over 50,000+ businesses registered through our platform, we ensure a smooth and hassle-free registration process.
          </div>
        }
      />
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` → exit 0.
Run: `grep -rn "Documents Required" 'app/(site)'` → no output (it only lives in `ServiceDetailBody`).
Open `/services/gst/registration`, one simple-category service (from `/services/registration`, click any card) and one 3-level service (from `/services/ipo`, open a subcategory, then a service). On each:
- the tab bar sticks under the nav and highlights the current section;
- the "Related Services" cards on the 3-level page link to `/services/ipo/<sub>/<slug>` (hover to read the URL);
- the inquiry form submits (fill it in, submit, and confirm the success toast).

- [ ] **Step 7: Checkpoint (no commit)**

---

### Task 8: Category and subcategory listing pages

**Files:**
- Create: `app/components/services/CategoryHero.tsx`
- Modify: `app/(site)/services/[category]/page.tsx` (render block only), `app/(site)/services/[category]/[slug]/page.tsx` (subcategory branch render only)

**Interfaces:**
- Consumes: `LightHero`, `IconTile`, `Tile`, `Section`, `SectionHead`, `fv/Button` + `fvButtonClass`, `ServiceCard`, `colorAt`, `plural`.
- Produces: `<CategoryHero title description icon breadcrumb searchLabel searchValue onSearchChange stats />`

- [ ] **Step 1: Create `CategoryHero.tsx`**

```tsx
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import LightHero from '../fv/LightHero';
import IconTile from '../fv/IconTile';
import { colorAt } from '@/app/lib/fv/colors';

interface CategoryHeroProps {
  title: string;
  description: string;
  icon: LucideIcon;
  breadcrumb: { label: string; href?: string }[];
  searchLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  stats: { label: string; iconName: string }[];
}

/** Light L3 hero shared by category pages and subcategory listings (rendered inside client pages). */
export default function CategoryHero({
  title,
  description,
  icon,
  breadcrumb,
  searchLabel,
  searchValue,
  onSearchChange,
  stats,
}: CategoryHeroProps) {
  return (
    <LightHero
      title={title}
      subtitle={description}
      icon={icon}
      breadcrumb={breadcrumb}
      align="left"
      aside={
        stats.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <li key={`${stat.label}-${i}`} className="fv-card flex items-center gap-3 p-4">
                <IconTile name={stat.iconName} color={colorAt(i)} size="sm" />
                <span className="text-sm font-semibold leading-snug text-fv-navy">{stat.label}</span>
              </li>
            ))}
          </ul>
        ) : undefined
      }
    >
      <div className="relative max-w-[520px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fv-muted" aria-hidden="true" />
        <label htmlFor="category-search" className="sr-only">
          {searchLabel}
        </label>
        <input
          id="category-search"
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchLabel}
          className="w-full rounded-xl border border-fv-line bg-white py-3 pl-11 pr-4 text-base text-fv-navy shadow-fv-card outline-none placeholder:text-fv-muted focus:border-fv-blue focus:ring-2 focus:ring-fv-blue/20"
        />
      </div>
    </LightHero>
  );
}
```

- [ ] **Step 2: Category page imports**

In `app/(site)/services/[category]/page.tsx`:
- Replace `import Button from '@/app/components/ui/Button';` with `import Button, { fvButtonClass } from '@/app/components/fv/Button';`.
- Add:
```tsx
import type { LucideIcon } from 'lucide-react';
import CategoryHero from '@/app/components/services/CategoryHero';
import Section from '@/app/components/fv/Section';
import SectionHead from '@/app/components/fv/SectionHead';
import Tile from '@/app/components/fv/Tile';
import IconTile from '@/app/components/fv/IconTile';
import { colorAt } from '@/app/lib/fv/colors';
import { plural } from '@/app/lib/fv/text';
```

- [ ] **Step 3: Replace the category page's render block**

Replace everything from the line `  return (` that follows `const CategoryIcon = …` down to the end of the file with the code below. The loading and error branches above it are kept; they now use `fv/Button` through the import swap.
```tsx
  const listTitle = formatCategoryTitle(categoryInfo?.title || category.replace(/-/g, ' '));

  return (
    <div className="bg-white">
      <CategoryHero
        title={formatCategoryTitle(categoryInfo?.heroTitle || categoryInfo?.title || `${category.replace(/-/g, ' ')} Services`)}
        description={
          categoryInfo?.heroDescription ||
          categoryInfo?.description ||
          `Comprehensive ${category.replace(/-/g, ' ')} solutions for your business`
        }
        icon={CategoryIcon as LucideIcon}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: listTitle }]}
        searchLabel={`Search ${hasSubcategories ? 'categories' : 'services'}...`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        stats={heroStats}
      />

      <Section>
        {hasSubcategories ? (
          <>
            <SectionHead title={`Our ${listTitle} Categories`} subtitle="Explore our specialized service categories" />
            {filteredSubCategories.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubCategories.map((subCategory, i) => (
                  <li key={subCategory.id}>
                    <Tile
                      title={subCategory.title}
                      text={subCategory.description}
                      href={`/services/${category}/${subCategory.slug}`}
                      iconName={subCategory.iconName}
                      color={colorAt(i)}
                      meta={plural(subCategory.serviceCount ?? 0, 'service')}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <NoResults label="No categories found matching your search." onClear={() => setSearchQuery('')} />
            )}
          </>
        ) : (
          <>
            <SectionHead
              title={`Our ${listTitle} Services`}
              subtitle="Choose from our comprehensive range of services tailored to your business needs"
            />
            {filteredServices.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <li key={service.id}>
                    <ServiceCard
                      title={service.title}
                      shortDescription={service.shortDescription}
                      icon={service.icon}
                      price={service.price}
                      duration={service.duration}
                      slug={service.slug}
                      category={category}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <NoResults label="No services found matching your search." onClear={() => setSearchQuery('')} />
            )}
          </>
        )}
      </Section>

      <Section soft>
        <SectionHead align="center" title={whyChooseSection.heading} />
        <ul className="grid gap-5 md:grid-cols-3">
          {whyChooseSection.items.map((feature: WhyChooseItem, index: number) => (
            <li key={`${feature.title}-${index}`} className="fv-card p-6 text-center">
              <IconTile name={feature.iconName} color={colorAt(index)} size="lg" className="mx-auto" />
              <h3 className="mt-4 text-lg font-bold text-fv-navy">{feature.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-fv-slate">{feature.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tight>
        <div className="rounded-[22px] bg-fv-navy px-6 py-10 text-center text-white md:px-12 md:py-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] md:text-[32px]">Need Help Choosing the Right Service?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/80 md:text-lg">
            Our experts are here to help you understand which service best fits your business needs. Get a free consultation today!
          </p>
          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {contactInfo?.whatsapp && (
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp to schedule a free consultation"
                className={fvButtonClass('primary', 'lg', '!bg-[#25D366] !text-fv-navy !shadow-none hover:!bg-[#1FC15B]')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Schedule Free Consultation
              </a>
            )}
            {contactInfo?.phone && (
              <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} aria-label={`Call us at ${contactInfo.phone}`} className={fvButtonClass('white', 'lg')}>
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                Call {contactInfo.phone}
              </a>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

function NoResults({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="py-12 text-center">
      <p className="mb-4 text-lg text-fv-slate">{label}</p>
      <Button type="button" variant="outline" onClick={onClear}>
        Clear Search
      </Button>
    </div>
  );
}
```
(WhatsApp button: navy text on WhatsApp green is 7:1, while white on #25D366 is only 2:1.)

- [ ] **Step 4: Subcategory listing branch**

In `app/(site)/services/[category]/[slug]/page.tsx`:
- Add these imports, and swap `import Button from '@/app/components/ui/Button';` → `import Button from '@/app/components/fv/Button';`:
```tsx
import type { LucideIcon } from 'lucide-react';
import CategoryHero from '@/app/components/services/CategoryHero';
import Section from '@/app/components/fv/Section';
import SectionHead from '@/app/components/fv/SectionHead';
```
- Inside `if (pageType === 'subcategory' && subcategoryInfo)`, replace the `return ( … );` with:
```tsx
    return (
      <div className="bg-white">
        <CategoryHero
          title={subcategoryInfo.heroTitle || subcategoryInfo.title}
          description={subcategoryInfo.heroDescription || subcategoryInfo.description}
          icon={SubcategoryIcon as LucideIcon}
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: formatCategoryTitle(categoryInfo?.title || category.replace(/-/g, ' ')), href: `/services/${category}` },
            { label: subcategoryInfo.title },
          ]}
          searchLabel={`Search ${subcategoryInfo.title} services...`}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          stats={subcategoryHeroStats}
        />
        <Section>
          <SectionHead
            title={`Our ${subcategoryInfo.title} Services`}
            subtitle="Choose from our comprehensive range of services tailored to your business needs"
          />
          {filteredServices.length > 0 ? (
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <li key={service.id}>
                  <ServiceCard
                    title={service.title}
                    shortDescription={service.shortDescription}
                    icon={service.icon}
                    price={service.price}
                    duration={service.duration}
                    slug={service.slug}
                    category={category}
                    subcategory={slug}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <p className="mb-4 text-lg text-fv-slate">No services found matching your search.</p>
              <Button type="button" variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          )}
        </Section>
      </div>
    );
```
`SubcategoryIcon` is the icon component already declared at the top of this branch; the old JSX renders `<SubcategoryIcon …/>`.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` → exit 0.
Open `/services/gst` (simple: service cards with prices), `/services/ipo` (complex: subcategory tiles with "N services") and one IPO subcategory. On each, check that the breadcrumb works, the search filters, the right-hand stat boxes show at ≥1024px and stack below at 820, the Why Choose section is present, and the CTA's WhatsApp and Call links are correct.

- [ ] **Step 6: Checkpoint (no commit)**

---

### Task 9: `/services` hub

**Files:**
- Modify: `app/components/services/AllServicesClient.tsx`

**Interfaces:**
- Consumes: `LightHero`, `IconTile`, `ServiceCard`, `colorAt`, `fv/Button`.
- Produces: unchanged default export `AllServicesClient({ serviceGroups })`. It also honours `/services?q=` (from `SearchBar`).

- [ ] **Step 1: Imports and state**

1. Replace `import { useState, useMemo } from 'react';` with `import { useEffect, useMemo, useState } from 'react';`.
2. Replace `import { motion, useScroll, useTransform } from 'framer-motion';` with:
```tsx
import { clsx } from 'clsx';
import LightHero from '@/app/components/fv/LightHero';
import IconTile from '@/app/components/fv/IconTile';
import Button from '@/app/components/fv/Button';
import ServiceCard from '@/app/components/services/ServiceCard';
import { colorAt } from '@/app/lib/fv/colors';
```
3. Delete the imports of `Input` and `ScrollReveal`, and the two lines
`  const { scrollYProgress } = useScroll();` and `  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);`.
4. Directly after `const [selectedCategory, setSelectedCategory] = useState<string>('all');` add:
```tsx
  // Prefill from /services?q=… (home SearchBar). Read once on mount — no useSearchParams
  // (spec risk table: it broke `next build` before), so the page keeps its ISR.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setSearchQuery(q);
  }, []);
```

- [ ] **Step 2: Replace the render**

Replace everything from `  return (` (after the `totalServices` line) to the end of the file with:
```tsx
  const pill = (on: boolean) =>
    clsx(
      'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
      on ? 'border-fv-blue-d bg-fv-blue-d text-white' : 'border-fv-line bg-white text-fv-navy hover:border-fv-blue',
    );

  return (
    <div className="bg-white">
      <LightHero
        title="All Services"
        subtitle={`Comprehensive solutions for your business needs. Explore ${totalServices}+ professional services.`}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      >
        <div className="relative mx-auto max-w-[640px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fv-muted" aria-hidden="true" />
          <label htmlFor="services-search" className="sr-only">
            Search services
          </label>
          <input
            id="services-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full rounded-xl border border-fv-line bg-white py-3.5 pl-11 pr-4 text-base text-fv-navy shadow-fv-card outline-none placeholder:text-fv-muted focus:border-fv-blue focus:ring-2 focus:ring-fv-blue/20"
          />
        </div>
        <div role="group" aria-label="Filter by category" className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" aria-pressed={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} className={pill(selectedCategory === 'all')}>
            All Services
          </button>
          {safeServiceGroups.map((group, i) => (
            <button
              key={group.id}
              type="button"
              aria-pressed={selectedCategory === group.id}
              onClick={() => setSelectedCategory(group.id)}
              className={pill(selectedCategory === group.id)}
            >
              <IconTile name={group.iconName} color={colorAt(i)} size="sm" className="!h-6 !w-6 !rounded-md [&>svg]:!h-3.5 [&>svg]:!w-3.5" />
              {group.title}
            </button>
          ))}
        </div>
      </LightHero>

      <div className="fv-wrap space-y-16 py-12 md:py-16">
        {filteredGroups.map((group) => {
          const colorIndex = Math.max(0, safeServiceGroups.findIndex((g) => g.id === group.id));
          const isComplex = group.id === 'legal' || group.id === 'ipo' || group.id === 'banking-finance';
          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <IconTile name={group.iconName} color={colorAt(colorIndex)} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 id={`group-${group.id}`} className="text-2xl font-extrabold tracking-[-0.02em] text-fv-navy md:text-[30px]">
                    {group.title}
                  </h2>
                  <p className="text-[15px] text-fv-slate">{group.description}</p>
                </div>
                <Link href={group.href} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold text-fv-blue-d hover:text-fv-blue-dd">
                  View all
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {(group.services || [])
                  .filter((service) => service != null && service.id && service.slug)
                  .map((service) => (
                    <li key={service.id}>
                      <ServiceCard
                        title={service.title || 'Untitled Service'}
                        shortDescription={service.shortDescription || ''}
                        iconName={service.iconName}
                        price={service.price}
                        duration={service.duration}
                        slug={service.slug}
                        category={group.id}
                        subcategory={isComplex ? service.subcategorySlug : undefined}
                      />
                    </li>
                  ))}
              </ul>
            </section>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="py-16 text-center">
            <h2 className="text-2xl font-extrabold text-fv-navy">No services found</h2>
            <p className="mb-6 mt-2 text-fv-slate">Try adjusting your search or filter criteria</p>
            <Button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```
The links are identical to before: `group.href` is always `/services/<group.id>`, and the complex groups use `subcategorySlug`. The old gradient "stats" band at the bottom is removed (L3 has none).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → exit 0. Remove lucide imports flagged as unused (`Sparkles`, `Zap`, `CheckCircle`, `Building2`) if `grep` finds no use; keep `Search`, `ArrowRight` and `FileText` if used.
Open `http://localhost:3000/services?q=gst`: the input is prefilled and the results are filtered. The category pills toggle, and one card in each of GST, Legal and IPO opens a working detail page.

- [ ] **Step 4: Checkpoint (no commit)**

---

### Task 10: Long-tail restyle codemod

**Files:**
- Create: `scripts/fv-restyle.mjs`
- Modify (by script): public files under `app/(site)/` and `app/components/{blog,calculators,dashboard,services,team,legal}/`

**Interfaces:**
- Consumes: the `fv-*` tokens, `.fv-wrap`, `.fv-card`, `fv/Button` (same props as `ui/Button`).

- [ ] **Step 1: Create `scripts/fv-restyle.mjs`**

```js
#!/usr/bin/env node
/**
 * One-shot codemod for the L3 redesign (spec 2026-10-05-l3-site-redesign, Page mapping row
 * "Shell-level restyle"). Exact string swaps only, on PUBLIC files only.
 *   node scripts/fv-restyle.mjs          # dry run: prints per-file counts
 *   node scripts/fv-restyle.mjs --apply  # writes
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = [
  'app/(site)',
  'app/components/blog',
  'app/components/calculators',
  'app/components/dashboard',
  'app/components/services',
  'app/components/team',
  'app/components/legal',
];

const PAIRS = [
  ['max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', 'fv-wrap'],
  ['max-w-6xl mx-auto px-4 sm:px-6 lg:px-8', 'fv-wrap'],
  ['max-w-4xl mx-auto px-4 sm:px-6 lg:px-8', 'fv-wrap max-w-[960px]'],
  ['bg-white rounded-2xl shadow-card', 'fv-card'],
  ['bg-white rounded-xl shadow-card', 'fv-card'],
  ['bg-white rounded-lg shadow-card', 'fv-card'],
  ['font-heading font-bold text-3xl text-primary', 'font-heading font-extrabold tracking-tight text-3xl text-fv-navy'],
  ['font-heading font-bold text-2xl text-primary', 'font-heading font-extrabold tracking-tight text-2xl text-fv-navy'],
  ['font-heading font-semibold text-2xl text-primary', 'font-heading font-bold text-2xl text-fv-navy'],
  ['font-heading font-semibold text-xl text-primary', 'font-heading font-bold text-xl text-fv-navy'],
  ["from '@/app/components/ui/Button'", "from '@/app/components/fv/Button'"],
  ["from '../ui/Button'", "from '../fv/Button'"],
  ['bg-gradient-to-b from-light-blue to-white', 'bg-white'],
  ['bg-gradient-to-br from-accent to-primary', 'bg-gradient-to-br from-fv-blue to-fv-blue-d'],
  ['text-accent hover:underline', 'font-semibold text-fv-blue-d hover:underline'],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (path.endsWith('.tsx')) out.push(path);
  }
  return out;
}

const apply = process.argv.includes('--apply');
const files = ROOTS.flatMap((root) => walk(root));
const unsafe = files.filter((f) => /\(admin|\/admin\//.test(f));
if (unsafe.length) {
  console.error('Refusing to touch admin files:', unsafe);
  process.exit(1);
}

let total = 0;
for (const file of files) {
  let src = readFileSync(file, 'utf8');
  const hits = [];
  for (const [from, to] of PAIRS) {
    const n = src.split(from).length - 1;
    if (n > 0) {
      hits.push(`${n}× ${from}`);
      src = src.split(from).join(to);
      total += n;
    }
  }
  if (hits.length) {
    console.log(`${file}\n  ${hits.join('\n  ')}`);
    if (apply) writeFileSync(file, src);
  }
}
console.log(`\n${apply ? 'APPLIED' : 'DRY RUN'}: ${total} replacement(s) in ${files.length} scanned files`);
```

- [ ] **Step 2: Dry run and review**

Run: `node scripts/fv-restyle.mjs`
Expected: a list of public files with counts and **no** `Refusing` error. Read the list: none of the hits may be under `(admin)`.

- [ ] **Step 3: Apply and type-check**

Run: `node scripts/fv-restyle.mjs --apply && npx tsc --noEmit`
Expected: exit 0. If tsc reports a prop that `fv/Button` doesn't accept (a framer `whileHover` passed to Button), remove that prop at the reported line; `fv/Button` intentionally has no motion props.

- [ ] **Step 4: Confirm no public file still imports `ui/Button`**

Run: `grep -rln "ui/Button" 'app/(site)' app/components --include='*.tsx' | grep -v '/admin/'`
Expected: only `app/components/ui/Button.tsx` (itself, if it matches) and files under `app/components/home/` that are no longer rendered (`HeroSection.tsx`, `CTASection.tsx`). Everything rendered on the public site uses `fv/Button`.

- [ ] **Step 5: Theme conformance pass (added 2026-10-06 — Vikrant: "all page design should follow the design theme")**

The codemod only swaps exact strings. After it, bring every remaining public page up to the spec's "Theme conformance" checklist (7 rules), structure/copy/logic unchanged. Dispatched as three groups, each its own implement → review loop:
- **10-G1 Calculators:** `/calculators` hub + the 5 calculator pages, `app/components/calculators/*`, public-only `ui/RangeSlider`, `ui/RadioGroup`, `ui/Checkbox`, `ui/Badge` (restyle in place), and new public twins `app/components/fv/Input.tsx`, `fv/TextArea.tsx`, `fv/Select.tsx` (same props/forwardRef behaviour as `ui/Input`, `ui/TextArea`, `ui/Select`, which admin also imports; themed per rule 5) with EVERY public import of `ui/Input`, `ui/TextArea`, `ui/Select` swapped to them (incl. `services/ServiceForm.tsx`, the contact form and calculators) — added 2026-10-06 after Task 6 found ServiceForm still on the admin-shared inputs.
- **10-G2 Content:** `/blog`, `/blog/[slug]`, `app/components/blog/*`; `/team`, `/team/[id]`, `app/components/team/*` (bios stay justified); `/contact`.
- **10-G3 Remaining:** `/compliance` + `app/components/dashboard/*`; `/login`, `/signup` (still mocks, still unlinked); `/privacy` `/terms` `/cookies` page wrappers outside `LegalPage`; anything else `scratch/oldtheme.sh` still lists outside Tasks 6–9 and 11.
Gate per group: `bash .superpowers/sdd/2026-10-05-l3-site-redesign/scratch/oldtheme.sh` lists none of the group's files; `npx tsc --noEmit` exit 0; screenshots of every route in the group at 1440 and 390 match the theme (light hero, fv cards, navy headings) with no element overflowing its box; calculators still produce the same results for the same inputs (spot-check 2 inputs per calculator before/after).

- [ ] **Step 6: Checkpoint (no commit)**

Show `git diff --stat` to Vikrant.

---

### Task 11: Legal pages and 404

**Files:**
- Rewrite: `app/components/legal/LegalPage.tsx`, `app/not-found.tsx`

- [ ] **Step 1: Rewrite `LegalPage.tsx` (props unchanged; still a server component)**

```tsx
import type { ReactNode } from 'react';
import LightHero from '@/app/components/fv/LightHero';

/**
 * Shared layout for legal pages (Privacy, Terms, Cookies).
 * Server component — static content, fully prerendered for SEO. L3 light hero + sticky TOC.
 */
interface LegalSectionDef {
  id: string;
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSectionDef[];
}

export default function LegalPage({ title, intro, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="bg-white">
      <LightHero title={title} subtitle={intro} breadcrumb={[{ label: 'Home', href: '/' }, { label: title }]}>
        <p className="inline-flex items-center rounded-full border border-fv-line bg-white px-4 py-1.5 text-sm text-fv-slate">
          Last updated: {lastUpdated}
        </p>
      </LightHero>

      <div className="fv-wrap grid gap-10 py-12 lg:grid-cols-[260px_1fr] lg:py-16">
        <nav aria-label="Table of contents" className="lg:sticky lg:top-24 lg:self-start">
          <div className="fv-card p-5">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fv-muted">On this page</h2>
            <ol className="space-y-2 text-sm">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex gap-2 text-fv-slate hover:text-fv-blue-d">
                    <span className="font-semibold text-fv-navy">{i + 1}.</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 max-w-[720px]">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.02em] text-fv-navy">
                  {i + 1}. {section.heading}
                </h2>
                <div className="space-y-4 leading-relaxed text-fv-slate [&_a]:font-semibold [&_a]:text-fv-blue-d [&_strong]:text-fv-navy [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-[18px] border border-fv-line bg-fv-wash p-8 text-center">
            <h2 className="mb-2 text-xl font-extrabold text-fv-navy">Questions about this policy?</h2>
            <p className="mb-4 text-fv-slate">
              Reach us at{' '}
              <a href="mailto:finvidhi@gmail.com" className="font-semibold text-fv-blue-d hover:underline">
                finvidhi@gmail.com
              </a>{' '}
              or call{' '}
              <a href="tel:+919625675722" className="font-semibold text-fv-blue-d hover:underline">
                +91 96256 75722
              </a>
              .
            </p>
            <p className="text-sm text-fv-muted">
              FinVidhi, D-239, First Floor, Flat No-06, Street-10, Laxmi Nagar, Delhi — 110092, India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `app/not-found.tsx`**

The root 404 sits outside `(site)/layout`, so it carries `fv-site` itself.
```tsx
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import LightHero from './components/fv/LightHero';
import SearchBar from './components/fv/SearchBar';
import { ButtonLink } from './components/fv/Button';

const TOP_CATEGORIES = [
  { label: 'GST Services', href: '/services/gst' },
  { label: 'Business Registration', href: '/services/registration' },
  { label: 'Income Tax', href: '/services/income-tax' },
  { label: 'Trademarks & IP', href: '/services/trademarks' },
];

export default function NotFound() {
  return (
    <div className="fv-site min-h-screen bg-white">
      <LightHero
        badge="Error 404"
        icon={FileQuestion}
        title="Page not found"
        subtitle="Sorry, the page you're looking for doesn't exist or has been moved. Try searching for a service instead."
      >
        <SearchBar id="not-found-search" className="mx-auto max-w-[560px]" />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" size="lg">
            Go to Homepage
          </ButtonLink>
          <ButtonLink href="/services" variant="outline" size="lg">
            Browse all services
          </ButtonLink>
        </div>
      </LightHero>
      <div className="fv-wrap py-12">
        <h2 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-fv-muted">Popular categories</h2>
        <ul className="flex flex-wrap justify-center gap-2">
          {TOP_CATEGORIES.map((category) => (
            <li key={category.href}>
              <Link
                href={category.href}
                className="inline-flex rounded-full border border-fv-line bg-white px-4 py-2 text-sm font-semibold text-fv-navy hover:border-fv-blue hover:text-fv-blue-d"
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → exit 0. Open `/privacy` (TOC links jump to their sections) and `/does-not-exist` (404 with search).

- [ ] **Step 4: Checkpoint (no commit)**

---

### Task 12: Full verification sweep

**Files:**
- Create: `scripts/fv-audit.cjs`
- Modify: `.gitignore` (add `.audit/`)

- [ ] **Step 1: Create `scripts/fv-audit.cjs`**

```js
#!/usr/bin/env node
/**
 * Screenshot + horizontal-overflow audit for the L3 redesign.
 *   node scripts/fv-audit.cjs [baseUrl] [outDir]
 * Needs the site running, Google Chrome installed, and playwright-core from the npx cache
 * (override with PLAYWRIGHT_CORE=/path/to/playwright-core, CHROME_PATH=/path/to/chrome).
 * Routes: AUDIT_ROUTES="/,/services" to override.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const PW = process.env.PLAYWRIGHT_CORE || path.join(os.homedir(), '.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { chromium } = require(PW);

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = process.argv[3] || path.join(process.cwd(), '.audit');
const WIDTHS = [1440, 1280, 1100, 820, 500, 390];
const ROUTES = (
  process.env.AUDIT_ROUTES ||
  '/,/services,/services/gst,/services/ipo,/services/gst/registration,/blog,/team,/contact,/compliance,/calculators,/calculators/income-tax,/privacy,/login,/this-page-does-not-exist'
).split(',');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  let failures = 0;
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.log(`  warn ${route}: ${e.message}`));
      await page.waitForTimeout(800);
      const result = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const offenders = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const box = el.getBoundingClientRect();
            if (!box.width || box.right <= vw + 1) return false;
            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
              if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX)) return false;
            }
            return true;
          })
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 4).join('.')} →${Math.round(el.getBoundingClientRect().right)}`);
        return { scrollW: document.documentElement.scrollWidth, vw, offenders };
      });
      const ok = result.scrollW <= result.vw && result.offenders.length === 0;
      if (!ok) failures += 1;
      const file = `${route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_')}-${width}.png`;
      await page.screenshot({ path: path.join(OUT, file), fullPage: true });
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${String(width).padStart(4)}px ${route}  scrollW=${result.scrollW} vw=${result.vw} ${result.offenders.join(' | ')}`);
      await page.close();
    }
  }
  await browser.close();
  console.log(failures ? `\n${failures} overflow failure(s)` : '\nNo horizontal overflow on any route/width.');
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
```
Run: `printf '.audit/\n' >> .gitignore`

- [ ] **Step 2: Unit tests, types, production build**

Run (with the backend running on :4000): `./scripts/test-pure.sh && npx tsc --noEmit && npm run build`
Expected: all tests pass, tsc exit 0, `next build` exit 0. If the build reports a CSR bailout, a `useSearchParams` was introduced: remove it.

- [ ] **Step 3: Overflow audit on the production server**

Run: `npm run start` (port 3000) in one terminal, then `node scripts/fv-audit.cjs http://localhost:3000`.
Expected: every line `ok`, exit 0. For each `FAIL`, fix the named element (usually a missing `min-w-0`, `flex-wrap` or `break-words`), rebuild, and re-run until clean.

- [ ] **Step 4: Behaviour spot checks**

Each of these must work, and each covers a Review Focus item:
1. `/contact`: submit the form → success message (proves `fv/Button` still submits; Review Focus #1).
2. `/calculators/emi` and `/calculators/income-tax`: press Calculate → results render.
3. `/services/gst/registration`: inquiry form submits; "Get Started Now" scrolls to it.
4. Home: Request Callback (hero and nav) opens the modal and submits → the inquiry appears in `/admin/inquiries`.
5. Home explorer: every tab panel's links open real pages. Spot-check one row per area (no "No data found").

- [ ] **Step 5: Keyboard-only pass (Review Focus #5)**

Using only Tab, Shift+Tab, Enter, Space, Escape and the arrow keys:
- Nav: the Services chevron opens with Enter, closes with Escape and closes when you Tab out.
- Resources opens and closes the same way.
- Explorer: arrow keys and Home/End move between tabs, and Tab enters the panel.
- FAQ: Enter toggles an item.
- At 390px: the drawer opens and closes, and every link in it is reachable.
- The focus ring is visible at every step.

- [ ] **Step 6: Admin untouched**

Run:
```bash
git status --porcelain -- 'app/(admin)' 'app/(admin-public)' app/components/admin app/lib/admin \
  app/components/ui/Button.tsx app/components/ui/Input.tsx app/components/ui/TextArea.tsx
```
Expected: no output. Then open `/admin/login`, log in, and confirm `/admin/home`, `/admin/services` and `/admin/home-info` look exactly as before (Poppins headings, dark theme).

- [ ] **Step 7: Hand-off checkpoint (no commit)**

Share with Vikrant: the `.audit/` screenshots for home, `/services`, `/services/ipo`, a service detail and `/contact` at 1440 and 390, the `git diff --stat`, and the list of now-unrendered home components (kept on disk). **Do not commit or push.** Wait for his review on local.
