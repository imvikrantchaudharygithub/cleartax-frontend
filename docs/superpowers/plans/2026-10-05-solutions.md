# Solutions ("Start a Business") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin-managed "solutions": curated, sectioned bundles of existing services. Each one appears as an app-style icon on the home hero rail and in a "Solutions ▾" menu, and has a `/solutions/<slug>` page where visitors tick services, see a live starting-price total and send one callback. "Start a Business" is seeded as the first solution.

**Architecture:** A new `Solution` Mongo collection stores **references** to services, grouped in sections with a per-item "popular" flag. Public endpoints populate live price, duration and a server-computed `href`, and silently drop unpublished or unlinkable services. Drafts are never public. The admin uses a full-page react-hook-form editor in the existing dark style. The public UI is built from Plan 1's `fv` primitives, and the plan's callback reuses the existing inquiry flow.

**Tech Stack:** Express + Mongoose + zod v3 (backend); Next.js 16 + React 19 + react-hook-form + zod v4 + `@hookform/resolvers` (frontend); `node:test` + `ts-node` (backend unit tests) and `node:test` + `tsc` (frontend pure helpers); curl + jq smoke scripts.

**Spec:** `docs/superpowers/specs/2026-10-05-solutions-design.md` (frontend repo). **Depends on:** `docs/superpowers/plans/2026-10-05-l3-site-redesign.md`. It uses `fv/*`, `HomeHero`'s `rail` prop, `Navigation`'s `solutions` prop, `scripts/test-pure.sh` and `scripts/fv-audit.cjs`. **Execute Plan 1 first.**

## Global Constraints

- **No `git commit` / `git push` in either repo.** Vikrant reviews on local first.
- **No new npm dependencies** in either repo.
- **Production database:** the backend `.env` points at the production Atlas cluster. Writes are allowed **only** to the new `solutions` collection. Smoke-test documents use slugs starting `zz-smoke-` and are deleted by a `trap`. The seed writes exactly one document (`start-a-business`). Never write to `services`, `servicecategories` or any other collection.
- **No credentials in files.** Scripts read `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the environment (the 2026-08-27 rule).
- **Drafts are never public.** No public route accepts a status or drafts parameter.
- Colour keys (exact, shared with Plan 1 `FV_COLOR_KEYS`): `blue, purple, green, orange, red, teal, yellow, pink`.
- Field limits (exact, client = server): slug `^[a-z0-9]+(?:-[a-z0-9]+)*$` ≤ 80 · title 2–60 · subtitle ≤ 120 · iconName 1–50 · pageHeading ≤ 120 · pageDescription ≤ 300 · ≤ 10 sections · section title 2–80 · ≤ 40 items per section.
- The inquiry `message` is capped at **1000** characters (Inquiry model).
- Admin: every sidebar link has `prefetch={false}`. No native `confirm()` / `alert()`; use `useConfirm()`.
- DB-driven icon names render only through `getIconFromName` (via `fv/IconTile`).
- Build order (spec S7): backend → admin → seed → public UI.

## Review Focus

1. **All services in a published solution become unavailable** (unpublished or deleted later). The solution must vanish from the rail and nav (no "0 services" tile), and its page must show "Talk to an expert" instead of empty steps. Pinned by the `buildPublicSections` tests (Task 1), the `listPublished` filter (Task 2, Step 6) and the empty-state check (Task 10, Step 5).
2. **Slug collisions and edits:** a duplicate slug must land as an inline error on the slug field (409 → `slug`), not a generic toast. Editing a published slug must warn. Pinned by the `mapServerErrors` tests (Task 4) and smoke check 409 (Task 3).
3. **Long plans:** a 22-service plan with long titles must still produce a callback message ≤ 1000 characters, ending in "…and N more". Pinned by the `buildPlanMessage` tests (Task 8).
4. **Malformed reorder payloads** (duplicate ids, missing ids, foreign ids) must be rejected with 400 and must not partially reorder. Pinned by the smoke reorder checks (Task 3).
5. **The admin form must not send server-managed fields** (`_id`, `itemsMeta`, `createdAt`, …). The strict body schema rejects them, so `toPayload` must strip them. Pinned by the `toPayload` test (Task 4) and the smoke "strict body" check (Task 3).

---

## File Structure

**Backend (`cleartax backend`)**

| File | Status | Responsibility |
|---|---|---|
| `src/services/solution.helpers.ts` | create | Pure: `resolveServiceHref`, `findCategory`, `isPublished`, `collectServiceIds`, `findDuplicateServiceIds`, `buildPublicSections` |
| `tests/solution.helpers.test.ts` | create | Unit tests (`node --test` + `ts-node`) |
| `src/types/solution.types.ts` | create | Shared types + `SOLUTION_COLORS` |
| `src/models/Solution.model.ts` | create | Mongoose model |
| `src/validations/solution.validations.ts` | create | zod schemas for every route |
| `src/services/solution.service.ts` | create | DB access, integrity rules, population |
| `src/controllers/solution.controller.ts` | create | HTTP layer |
| `src/routes/solution.routes.ts` | create | Routes (admin first) |
| `src/routes/index.ts` | modify | Mount `/solutions` |
| `src/scripts/seedSolutions.ts` | create | Seed / dry-run / remove "Start a Business" |
| `scripts/smoke-solutions.sh`, `scripts/check-solution-links.sh` | create | Integration checks (curl + jq) |

**Frontend (`cleartax frontend`)**

| File | Status | Responsibility |
|---|---|---|
| `app/lib/api/types.ts` | modify | Solution types |
| `app/lib/api/services/solution.service.ts` | create | Admin API client |
| `app/lib/solutions/publicApi.ts` | create | Server-side fetchers (`revalidate: 300`) |
| `app/lib/solutions/form.ts` + `tests/solutions-form.test.ts` | create | Pure: `slugify`, `mapServerErrors`, `toPayload`, `toFormValues` |
| `app/lib/solutions/formSchema.ts` | create | zod v4 form schema (client limits = server limits) |
| `app/lib/solutions/plan.ts` + `tests/solutions-plan.test.ts` | create | Pure: `planTotal`, `initialSelection`, `buildPlanMessage` |
| `app/lib/solutions/rail.ts` + `tests/solutions-rail.test.ts` | create | Pure: `railLayout` |
| `app/lib/admin/useUnsavedChangesGuard.ts` | create | `beforeunload` + in-app link guard via `useConfirm` |
| `app/components/admin/AdminSidebar.tsx` | modify | "Solutions" link after Services |
| `app/(admin)/admin/solutions/page.tsx` | create | List page |
| `app/(admin)/admin/solutions/new/page.tsx`, `[id]/page.tsx` | create | Editor routes |
| `app/components/admin/solutions/{SolutionForm,SectionEditor,ServicePicker,ColorSwatches,SolutionPreview}.tsx` | create | Editor pieces |
| `app/components/solutions/{SolutionRail,SolutionHero,StepBar,PlanServiceCard,PlanSummary,SolutionPlanner}.tsx` | create | Public UI |
| `app/(site)/solutions/[slug]/page.tsx` | create | Solution page |
| `app/(site)/layout.tsx`, `app/(site)/homepage-data.ts`, `app/(site)/page.tsx`, `app/sitemap.ts` | modify | Nav data, rail data, sitemap |
| `app/components/home/RequestCallbackModal.tsx` | modify | Optional `prefillNotes` / `interestLabel` |

## Amendments 2026-10-07 (after Plan 1 executed — BINDING, they override task text below)

Plan 1 (L3 redesign) was executed and its final review changed interfaces this plan consumes. Where a task's code below disagrees, follow these:

- **A1 Icons by name:** `app/components/fv/IconTile.tsx` now takes ONLY a static `icon` (LucideIcon). DB/admin icon NAMES render through `app/components/fv/IconTileByName.tsx` (`<IconTileByName name={…} color size solid className />`, same props as the old `IconTile name=`). Replace every `<IconTile name={…}` in this plan's code with `<IconTileByName name={…}` (Tasks 5, 6, 9, 10). Never import `getIconFromName`/`IconTileByName` into `common/Navigation.tsx`, `home/RequestCallbackModal.tsx` or anything the site layout renders on every page (it pulls the whole lucide namespace into the shared client bundle).
- **A2 NavSolution:** `export interface NavSolution { slug: string; title: string; subtitle?: string; icon: ReactNode; color: FvColor }` — `icon` is a rendered element, not a name. In `app/(site)/layout.tsx` (server) resolve each solution's `iconName` there (`const Icon = getIconFromName(s.iconName)`; pass `icon: <Icon strokeWidth={1.9} aria-hidden />` — the nav tile frame sizes the svg to 16px, matching the static menu icons).
- **A3 Nav dropdown height:** the desktop Solutions dropdown list gets `max-h-[calc(100vh-84px)] overflow-y-auto` (many solutions must stay reachable).
- **A4 Home rail:** pass `rail` to `HomeHero` only when there is at least one home solution (`rail={homeSolutions.length ? <SolutionRail … /> : undefined}`) — an empty element leaves a 38px gap instead of the 56px spacer. The hero is the centred s3 hero (see Task 9's earlier amendment note).
- **A5 Layout fetch:** fetching solutions in `app/(site)/layout.tsx` must keep public pages static/ISR (use `fetch(…, { next: { revalidate: 300 } })` like `homepage-data.ts`; no `cookies()`/`headers()`); verify with `npm run build` that the route table still shows ○/● (not ƒ) for the public pages that were static before.
- **A6 Callback modal (Task 10 Step 1):** the modal now uses the public form twins: "Interested in" is `<Select name="interest" options={…} defaultValue={…} />` from `@/app/components/fv/Select` (it renders ONLY the `options` prop and ignores JSX children) and Notes is `<TextArea name="notes" … />` from `@/app/components/fv/TextArea`. So: build `const interestOptions = [ ...(interestLabel && !DEFAULT_INTERESTS.includes(interestLabel) ? [interestLabel] : []), ...DEFAULT_INTERESTS ].map((v) => ({ value: v, label: v }))`, pass `options={interestOptions}` and `defaultValue={interestLabel ?? 'GST Services'}`; on the notes `TextArea` pass `rows={prefillNotes ? 5 : 3}`, `defaultValue={prefillNotes}`, `maxLength={1000}`. Do NOT reintroduce raw `<select>`/`<textarea>` or `gray-*`/`primary` classes. Also add an optional `returnFocusRef?: React.RefObject<HTMLElement>` prop used as the focus-return fallback before the current mobile-menu fallback.
- **A7 Theme:** every new public component follows the L3 spec's "Theme conformance" rules; `bash .superpowers/sdd/2026-10-05-l3-site-redesign/scratch/oldtheme.sh` must list nothing new. Small text never uses `text-fv-muted` (icons/placeholders only); hover lifts use `motion-safe:`; framer motion is already governed by the site `MotionProvider`.
- **A8 Runtime:** the backend rate-limits at 300 requests / 15 min / IP — link checks and smoke loops run sequentially and sparingly. Port :3001 belongs to another project.

---

### Task 1: Backend pure helpers (TDD)

**Files:**
- Create: `cleartax backend/src/services/solution.helpers.ts`, `cleartax backend/tests/solution.helpers.test.ts`

**Interfaces:**
- Produces (used by Task 2):
  - `COMPLEX_CATEGORY_TYPES: Set<string>`
  - `interface CategoryLike { _id: unknown; id?: string; slug?: string; categoryType?: string }`
  - `interface ServiceLike { _id: unknown; slug?: string; title?: string; shortDescription?: string; iconName?: string; price?: { min?: number; max?: number; currency?: string }; duration?: string; category?: unknown; subcategory?: unknown; status?: string | null; categoryName?: string }`
  - `interface SectionLike { title: string; items: { service: unknown; popular?: boolean }[] }`
  - `interface PublicItem { id: string; title: string; shortDescription: string; iconName: string; price: { min: number; max: number; currency: string }; duration: string; href: string; popular: boolean }`
  - `findCategory(ref: unknown, categories: CategoryLike[]): CategoryLike | null`
  - `resolveServiceHref(service: ServiceLike, categories: CategoryLike[]): string | null`
  - `isPublished(service: { status?: string | null }): boolean`
  - `collectServiceIds(sections?: SectionLike[]): string[]` (unique, in order)
  - `findDuplicateServiceIds(sections?: SectionLike[]): string[]`
  - `buildPublicSections(sections, services: Map<string, ServiceLike>, categories): { sections: { title: string; items: PublicItem[] }[]; stats: { serviceCount: number; startingPrice: number; sectionCount: number }; dropped: number }`

All commands in this task run from `cleartax backend/`.

- [ ] **Step 1: Write the failing tests**

`tests/solution.helpers.test.ts`:
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Types } from 'mongoose';
import {
  buildPublicSections,
  collectServiceIds,
  findCategory,
  findDuplicateServiceIds,
  isPublished,
  resolveServiceHref,
} from '../src/services/solution.helpers';

const GST_ID = new Types.ObjectId();
const REG_ID = new Types.ObjectId();
const IPO_SUB_ID = new Types.ObjectId();
const CATEGORIES = [
  { _id: GST_ID, id: 'gst', slug: 'gst-services', categoryType: 'simple' },
  { _id: REG_ID, id: 'registration', slug: 'registration', categoryType: 'simple' },
  { _id: IPO_SUB_ID, id: 'ipo-advisory', slug: 'ipo-advisory-strategy', categoryType: 'ipo' },
];

test('findCategory matches by _id, then id/slug case-insensitively', () => {
  assert.equal(findCategory(GST_ID, CATEGORIES)?.id, 'gst');
  assert.equal(findCategory(String(GST_ID), CATEGORIES)?.id, 'gst');
  assert.equal(findCategory('GST', CATEGORIES)?.id, 'gst');
  assert.equal(findCategory('gst-services', CATEGORIES)?.id, 'gst');
  assert.equal(findCategory('nope', CATEGORIES), null);
  assert.equal(findCategory(undefined, CATEGORIES), null);
});

test('simple categories link at /services/<category id>/<slug>', () => {
  assert.equal(resolveServiceHref({ _id: 1, slug: 'gst-registration', category: GST_ID }, CATEGORIES), '/services/gst/gst-registration');
  assert.equal(resolveServiceHref({ _id: 1, slug: 'gst-registration', category: 'gst-services' }, CATEGORIES), '/services/gst/gst-registration');
});

test('complex (virtual-parent) categories link at /services/<type>/<sub slug>/<slug>', () => {
  assert.equal(
    resolveServiceHref({ _id: 1, slug: 'ipo-readiness', category: 'ipo', subcategory: IPO_SUB_ID }, CATEGORIES),
    '/services/ipo/ipo-advisory-strategy/ipo-readiness',
  );
  assert.equal(
    resolveServiceHref({ _id: 1, slug: 'ipo-readiness', category: String(IPO_SUB_ID) }, CATEGORIES),
    '/services/ipo/ipo-advisory-strategy/ipo-readiness',
  );
});

test('unresolvable services return null', () => {
  assert.equal(resolveServiceHref({ _id: 1, slug: 'legacy', category: 'ipo' }, CATEGORIES), null);
  assert.equal(resolveServiceHref({ _id: 1, slug: 'x', category: new Types.ObjectId() }, CATEGORIES), null);
  assert.equal(resolveServiceHref({ _id: 1, slug: '', category: GST_ID }, CATEGORIES), null);
});

test('isPublished treats legacy docs without status as published', () => {
  assert.equal(isPublished({ status: 'published' }), true);
  assert.equal(isPublished({}), true);
  assert.equal(isPublished({ status: null }), true);
  assert.equal(isPublished({ status: 'draft' }), false);
});

test('collectServiceIds dedupes and stringifies; findDuplicateServiceIds reports repeats', () => {
  const a = new Types.ObjectId();
  const b = new Types.ObjectId();
  const sections = [
    { title: 'One', items: [{ service: a }, { service: String(b) }] },
    { title: 'Two', items: [{ service: String(a) }] },
  ];
  assert.deepEqual(collectServiceIds(sections), [String(a), String(b)]);
  assert.deepEqual(findDuplicateServiceIds(sections), [String(a)]);
  assert.deepEqual(collectServiceIds(undefined), []);
});

test('buildPublicSections drops drafts, missing and unlinkable services and empty sections', () => {
  const pub = new Types.ObjectId();
  const draft = new Types.ObjectId();
  const orphan = new Types.ObjectId();
  const missing = new Types.ObjectId();
  const services = new Map<string, any>([
    [String(pub), { _id: pub, slug: 'pvt-ltd', title: 'Private Limited', price: { min: 6999 }, duration: '10 days', category: REG_ID, status: 'published' }],
    [String(draft), { _id: draft, slug: 'draft-one', title: 'Draft', price: { min: 100 }, category: REG_ID, status: 'draft' }],
    [String(orphan), { _id: orphan, slug: 'orphan', title: 'Orphan', price: { min: 50 }, category: 'nowhere', status: 'published' }],
  ]);
  const result = buildPublicSections(
    [
      { title: 'Structure', items: [{ service: pub, popular: true }, { service: draft }] },
      { title: 'Empty after filtering', items: [{ service: missing }, { service: orphan }] },
    ],
    services,
    CATEGORIES,
  );
  assert.equal(result.dropped, 3);
  assert.deepEqual(result.stats, { serviceCount: 1, startingPrice: 6999, sectionCount: 1 });
  assert.deepEqual(result.sections, [
    {
      title: 'Structure',
      items: [
        {
          id: String(pub),
          title: 'Private Limited',
          shortDescription: '',
          iconName: 'FileText',
          price: { min: 6999, max: 6999, currency: 'INR' },
          duration: '10 days',
          href: '/services/registration/pvt-ltd',
          popular: true,
        },
      ],
    },
  ]);
});

test('startingPrice ignores zero prices and is 0 when nothing is priced', () => {
  const a = new Types.ObjectId();
  const b = new Types.ObjectId();
  const services = new Map<string, any>([
    [String(a), { _id: a, slug: 'a', title: 'A', price: { min: 0 }, category: GST_ID }],
    [String(b), { _id: b, slug: 'b', title: 'B', price: { min: 300 }, category: GST_ID }],
  ]);
  assert.equal(buildPublicSections([{ title: 'S', items: [{ service: a }, { service: b }] }], services, CATEGORIES).stats.startingPrice, 300);
  assert.equal(buildPublicSections([{ title: 'S', items: [{ service: a }] }], services, CATEGORIES).stats.startingPrice, 0);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `TS_NODE_TRANSPILE_ONLY=1 node --require ts-node/register --test tests/solution.helpers.test.ts`
Expected: FAIL, `Cannot find module '../src/services/solution.helpers'`.

- [ ] **Step 3: Implement `src/services/solution.helpers.ts`**

```ts
/**
 * Pure helpers for the Solutions feature (spec: frontend repo
 * docs/superpowers/specs/2026-10-05-solutions-design.md). No DB access here.
 *
 * Data model facts (read from getServicesByCategory / getServicesBySubcategory, 2026-10-05):
 * - simple categories are ServiceCategory docs addressed by their `id` (gst, registration, …);
 * - ipo / legal / banking-finance are virtual parents addressed by categoryType, and every
 *   ServiceCategory doc of those types IS a subcategory: /services/<type>/<sub.slug>/<slug>.
 */
export const COMPLEX_CATEGORY_TYPES = new Set(['ipo', 'legal', 'banking-finance']);

export interface CategoryLike {
  _id: unknown;
  id?: string;
  slug?: string;
  categoryType?: string;
}

export interface ServiceLike {
  _id: unknown;
  slug?: string;
  title?: string;
  shortDescription?: string;
  iconName?: string;
  price?: { min?: number; max?: number; currency?: string };
  duration?: string;
  category?: unknown;
  subcategory?: unknown;
  status?: string | null;
  categoryName?: string;
}

export interface SectionLike {
  title: string;
  items: { service: unknown; popular?: boolean }[];
}

export interface PublicItem {
  id: string;
  title: string;
  shortDescription: string;
  iconName: string;
  price: { min: number; max: number; currency: string };
  duration: string;
  href: string;
  popular: boolean;
}

const refString = (ref: unknown): string => {
  if (ref === null || ref === undefined) return '';
  if (typeof ref === 'string') return ref.trim();
  if (typeof ref === 'object') return String(ref).trim();
  return '';
};

export function findCategory(ref: unknown, categories: CategoryLike[]): CategoryLike | null {
  const key = refString(ref);
  if (!key) return null;
  const lower = key.toLowerCase();
  return (
    categories.find((c) => String(c._id) === key) ??
    categories.find((c) => (c.id ?? '').toLowerCase() === lower || (c.slug ?? '').toLowerCase() === lower) ??
    null
  );
}

const isComplex = (category: CategoryLike | null): category is CategoryLike =>
  !!category && COMPLEX_CATEGORY_TYPES.has((category.categoryType ?? '').toLowerCase());

export function resolveServiceHref(service: ServiceLike, categories: CategoryLike[]): string | null {
  const slug = (service.slug ?? '').trim();
  if (!slug) return null;

  const sub = findCategory(service.subcategory, categories);
  if (isComplex(sub) && sub.slug) return `/services/${sub.categoryType!.toLowerCase()}/${sub.slug}/${slug}`;

  const category = findCategory(service.category, categories);
  if (!category) return null;
  if (isComplex(category)) {
    return category.slug ? `/services/${category.categoryType!.toLowerCase()}/${category.slug}/${slug}` : null;
  }
  const segment = category.id || category.slug;
  return segment ? `/services/${segment}/${slug}` : null;
}

/** Matches the backend's public filter: published, or legacy docs with no status. */
export function isPublished(service: { status?: string | null }): boolean {
  return !service.status || service.status === 'published';
}

export function collectServiceIds(sections?: SectionLike[]): string[] {
  const seen = new Set<string>();
  for (const section of sections ?? []) {
    for (const item of section.items ?? []) {
      const id = refString(item.service);
      if (id) seen.add(id);
    }
  }
  return [...seen];
}

export function findDuplicateServiceIds(sections?: SectionLike[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const section of sections ?? []) {
    for (const item of section.items ?? []) {
      const id = refString(item.service);
      if (!id) continue;
      if (seen.has(id)) dupes.add(id);
      seen.add(id);
    }
  }
  return [...dupes];
}

export function buildPublicSections(
  sections: SectionLike[] | undefined,
  services: Map<string, ServiceLike>,
  categories: CategoryLike[],
): {
  sections: { title: string; items: PublicItem[] }[];
  stats: { serviceCount: number; startingPrice: number; sectionCount: number };
  dropped: number;
} {
  const out: { title: string; items: PublicItem[] }[] = [];
  let dropped = 0;

  for (const section of sections ?? []) {
    const items: PublicItem[] = [];
    for (const item of section.items ?? []) {
      const service = services.get(refString(item.service));
      const href = service && isPublished(service) ? resolveServiceHref(service, categories) : null;
      if (!service || !href) {
        dropped += 1;
        continue;
      }
      const min = Number(service.price?.min) || 0;
      items.push({
        id: String(service._id),
        title: service.title ?? '',
        shortDescription: service.shortDescription ?? '',
        iconName: service.iconName || 'FileText',
        price: { min, max: Number(service.price?.max) || min, currency: service.price?.currency || 'INR' },
        duration: service.duration ?? '',
        href,
        popular: !!item.popular,
      });
    }
    if (items.length > 0) out.push({ title: section.title, items });
  }

  const all = out.flatMap((s) => s.items);
  const priced = all.map((i) => i.price.min).filter((p) => p > 0);
  return {
    sections: out,
    stats: { serviceCount: all.length, startingPrice: priced.length ? Math.min(...priced) : 0, sectionCount: out.length },
    dropped,
  };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `TS_NODE_TRANSPILE_ONLY=1 node --require ts-node/register --test tests/solution.helpers.test.ts`
Expected: `# pass 8`, `# fail 0`.

- [ ] **Step 5: Checkpoint (no commit)**

`npx tsc --noEmit` → exit 0 (`tests/` is outside `rootDir`/`include`, so the build ignores it).

---

### Task 2: Backend resource: types, model, validation, service, routes

**Files:**
- Create: `src/types/solution.types.ts`, `src/models/Solution.model.ts`, `src/validations/solution.validations.ts`, `src/services/solution.service.ts`, `src/controllers/solution.controller.ts`, `src/routes/solution.routes.ts`
- Modify: `src/routes/index.ts`

**Interfaces:**
- Consumes: Task 1 helpers; `Service` (`src/models/Service.model`), `ServiceCategory` (`src/models/ServiceCategory.model`), `AppError` (`src/utils/AppError`), `validate` (`src/middlewares/validation.middleware`), `authenticate` / `authorize` (`src/middlewares/auth.middleware`), `publicCache` (`src/middlewares/cache.middleware`).
- Produces the HTTP API (frontend Tasks 4–10 rely on these exact shapes):
  - `GET /api/solutions[?home=true]` → `{ success, data: SolutionSummary[] }`
  - `GET /api/solutions/:slug` → `{ success, data: SolutionDetail }` | 404
  - `GET /api/solutions/admin/all` → `{ success, data: SolutionAdminRow[] }` (admin)
  - `GET /api/solutions/admin/:id` → `{ success, data: SolutionAdminDetail }` (admin)
  - `POST /api/solutions/admin` → 201 `{ success, data, message }` (admin)
  - `PUT /api/solutions/admin/:id` (partial) → `{ success, data, message }` (admin)
  - `DELETE /api/solutions/admin/:id` → `{ success, message }` (admin)
  - `PUT /api/solutions/admin/reorder` body `{ ids }` → `{ success, data: SolutionAdminRow[] }` (admin)

- [ ] **Step 1: `src/types/solution.types.ts`**

```ts
export const SOLUTION_COLORS = ['blue', 'purple', 'green', 'orange', 'red', 'teal', 'yellow', 'pink'] as const;
export type SolutionColor = (typeof SOLUTION_COLORS)[number];
export type SolutionStatus = 'draft' | 'published';

export interface SolutionItemInput {
  service: string;
  popular?: boolean;
}

export interface SolutionSectionInput {
  title: string;
  items: SolutionItemInput[];
}

export interface SolutionInput {
  slug: string;
  title: string;
  subtitle?: string;
  iconName: string;
  color?: SolutionColor;
  pageHeading?: string;
  pageDescription?: string;
  sections?: SolutionSectionInput[];
  showOnHome?: boolean;
  order?: number;
  status?: SolutionStatus;
}

export interface SolutionSummary {
  slug: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: SolutionColor;
  serviceCount: number;
}

export interface SolutionDetail extends SolutionSummary {
  pageHeading: string;
  pageDescription: string;
  stats: { serviceCount: number; startingPrice: number; sectionCount: number };
  sections: {
    title: string;
    items: {
      id: string;
      title: string;
      shortDescription: string;
      iconName: string;
      price: { min: number; max: number; currency: string };
      duration: string;
      href: string;
      popular: boolean;
    }[];
  }[];
}

export interface SolutionAdminRow {
  _id: string;
  slug: string;
  title: string;
  iconName: string;
  color: SolutionColor;
  status: SolutionStatus;
  showOnHome: boolean;
  order: number;
  itemCount: number;
  unavailableCount: number;
  updatedAt: string;
}

export interface SolutionItemMeta {
  title: string;
  status: string;
  categoryName: string;
  priceMin: number;
  available: boolean;
}
```

- [ ] **Step 2: `src/models/Solution.model.ts`**

```ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import { SOLUTION_COLORS, SolutionColor, SolutionStatus } from '../types/solution.types';

export interface ISolutionItem {
  service: Types.ObjectId;
  popular: boolean;
}

export interface ISolutionSection {
  title: string;
  items: ISolutionItem[];
}

export interface ISolution extends Document {
  slug: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: SolutionColor;
  pageHeading: string;
  pageDescription: string;
  sections: ISolutionSection[];
  showOnHome: boolean;
  order: number;
  status: SolutionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SolutionItemSchema = new Schema<ISolutionItem>(
  {
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: [true, 'Service is required'] },
    popular: { type: Boolean, default: false },
  },
  { _id: false },
);

const SolutionSectionSchema = new Schema<ISolutionSection>(
  {
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      minlength: [2, 'Section title must be at least 2 characters'],
      maxlength: [80, 'Section title cannot exceed 80 characters'],
    },
    items: {
      type: [SolutionItemSchema],
      default: [],
      validate: [(v: unknown[]) => v.length <= 40, 'A section can hold at most 40 services'],
    },
  },
  { _id: false },
);

const SolutionSchema = new Schema<ISolution>(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [80, 'Slug cannot exceed 80 characters'],
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words separated by hyphens'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [60, 'Title cannot exceed 60 characters'],
    },
    subtitle: { type: String, trim: true, maxlength: [120, 'Subtitle cannot exceed 120 characters'], default: '' },
    iconName: { type: String, required: [true, 'Icon is required'], trim: true, maxlength: 50 },
    color: { type: String, enum: SOLUTION_COLORS, default: 'blue' },
    pageHeading: { type: String, trim: true, maxlength: [120, 'Page heading cannot exceed 120 characters'], default: '' },
    pageDescription: { type: String, trim: true, maxlength: [300, 'Page description cannot exceed 300 characters'], default: '' },
    sections: {
      type: [SolutionSectionSchema],
      default: [],
      validate: [(v: unknown[]) => v.length <= 10, 'A solution can have at most 10 sections'],
    },
    showOnHome: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true },
);

SolutionSchema.index({ status: 1, showOnHome: 1, order: 1 });

export const Solution = mongoose.model<ISolution>('Solution', SolutionSchema);
```

- [ ] **Step 3: `src/validations/solution.validations.ts`**

The `validate()` middleware parses `{ body, query, params }`. Bodies are `.strict()`, so server-managed fields are rejected (Review Focus #5).
```ts
import { z } from 'zod';
import { SOLUTION_COLORS } from '../types/solution.types';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

const itemSchema = z.object({ service: objectId, popular: z.boolean().optional() }).strict();

const sectionSchema = z
  .object({
    title: z.string().trim().min(2, 'Section title must be at least 2 characters').max(80, 'Section title cannot exceed 80 characters'),
    items: z.array(itemSchema).max(40, 'A section can hold at most 40 services'),
  })
  .strict();

const solutionBody = z
  .object({
    slug: z
      .string()
      .trim()
      .max(80, 'Slug cannot exceed 80 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words separated by hyphens'),
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(60, 'Title cannot exceed 60 characters'),
    subtitle: z.string().trim().max(120, 'Subtitle cannot exceed 120 characters').optional(),
    iconName: z.string().trim().min(1, 'Icon is required').max(50),
    color: z.enum(SOLUTION_COLORS).optional(),
    pageHeading: z.string().trim().max(120, 'Page heading cannot exceed 120 characters').optional(),
    pageDescription: z.string().trim().max(300, 'Page description cannot exceed 300 characters').optional(),
    sections: z.array(sectionSchema).max(10, 'A solution can have at most 10 sections').optional(),
    showOnHome: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
    status: z.enum(['draft', 'published']).optional(),
  })
  .strict();

export const createSolutionSchema = z.object({ body: solutionBody });

export const updateSolutionSchema = z.object({
  params: z.object({ id: objectId }),
  body: solutionBody.partial().strict(),
});

export const solutionIdSchema = z.object({ params: z.object({ id: objectId }) });

export const solutionSlugSchema = z.object({ params: z.object({ slug: z.string().trim().min(1).max(80) }) });

export const reorderSolutionsSchema = z.object({
  body: z.object({ ids: z.array(objectId).min(1).max(200) }).strict(),
});

export const listSolutionsQuerySchema = z.object({
  query: z.object({ home: z.enum(['true', 'false']).optional() }).passthrough(),
});
```

- [ ] **Step 4: `src/services/solution.service.ts`**

```ts
import mongoose from 'mongoose';
import { Solution } from '../models/Solution.model';
import { Service } from '../models/Service.model';
import { ServiceCategory } from '../models/ServiceCategory.model';
import { AppError } from '../utils/AppError';
import {
  buildPublicSections,
  collectServiceIds,
  findDuplicateServiceIds,
  isPublished,
  resolveServiceHref,
  type CategoryLike,
  type SectionLike,
  type ServiceLike,
} from './solution.helpers';
import type {
  SolutionAdminRow,
  SolutionDetail,
  SolutionInput,
  SolutionItemMeta,
  SolutionSummary,
} from '../types/solution.types';

const SERVICE_FIELDS = 'title slug shortDescription iconName price duration category subcategory status categoryName';

async function loadCategories(): Promise<CategoryLike[]> {
  return (await ServiceCategory.find({}, '_id id slug categoryType').lean()) as unknown as CategoryLike[];
}

async function loadServices(ids: string[]): Promise<Map<string, ServiceLike>> {
  if (ids.length === 0) return new Map();
  const docs = await Service.find({ _id: { $in: ids } }, SERVICE_FIELDS).lean();
  return new Map(docs.map((doc) => [String(doc._id), doc as unknown as ServiceLike]));
}

const assertObjectId = (id: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid solution id', 400);
};

/** Integrity rules, always run on the full (merged) document. Spec: Service-layer rules 1–2. */
async function assertValid(doc: Pick<SolutionInput, 'sections' | 'status'>): Promise<void> {
  const sections = (doc.sections ?? []) as SectionLike[];
  const dupes = findDuplicateServiceIds(sections);
  if (dupes.length > 0) {
    const names = await loadServices(dupes);
    throw new AppError(`Service listed twice: ${dupes.map((id) => names.get(id)?.title ?? id).join(', ')}`, 400);
  }
  const ids = collectServiceIds(sections);
  if (ids.length > 0) {
    const found = await Service.find({ _id: { $in: ids } }, '_id').lean();
    const have = new Set(found.map((f) => String(f._id)));
    const missing = ids.filter((id) => !have.has(id));
    if (missing.length > 0) throw new AppError(`Unknown service id(s): ${missing.join(', ')}`, 400);
  }
  if (doc.status === 'published' && ids.length === 0) {
    throw new AppError('Add at least one service before publishing', 400);
  }
}

const toSummary = (solution: any, serviceCount: number): SolutionSummary => ({
  slug: solution.slug,
  title: solution.title,
  subtitle: solution.subtitle ?? '',
  iconName: solution.iconName,
  color: solution.color,
  serviceCount,
});

/** Public list. Solutions with 0 available services are omitted (Review Focus #1). */
export async function listPublished(homeOnly: boolean): Promise<SolutionSummary[]> {
  const filter: Record<string, unknown> = { status: 'published' };
  if (homeOnly) filter.showOnHome = true;
  const solutions = await Solution.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  if (solutions.length === 0) return [];
  const [categories, services] = await Promise.all([
    loadCategories(),
    loadServices(solutions.flatMap((s) => collectServiceIds(s.sections as unknown as SectionLike[]))),
  ]);
  return solutions
    .map((s) => toSummary(s, buildPublicSections(s.sections as unknown as SectionLike[], services, categories).stats.serviceCount))
    .filter((summary) => summary.serviceCount > 0);
}

export async function getPublishedBySlug(slug: string): Promise<SolutionDetail> {
  const solution = await Solution.findOne({ slug: slug.toLowerCase(), status: 'published' }).lean();
  if (!solution) throw new AppError('Solution not found', 404);
  const sections = solution.sections as unknown as SectionLike[];
  const [categories, services] = await Promise.all([loadCategories(), loadServices(collectServiceIds(sections))]);
  const built = buildPublicSections(sections, services, categories);
  if (built.dropped > 0) console.warn(`[solutions] ${solution.slug}: ${built.dropped} unavailable item(s) hidden`);
  return {
    ...toSummary(solution, built.stats.serviceCount),
    pageHeading: solution.pageHeading || solution.title,
    pageDescription: solution.pageDescription ?? '',
    stats: built.stats,
    sections: built.sections,
  };
}

export async function listAdmin(): Promise<SolutionAdminRow[]> {
  const solutions = await Solution.find().sort({ order: 1, createdAt: 1 }).lean();
  if (solutions.length === 0) return [];
  const [categories, services] = await Promise.all([
    loadCategories(),
    loadServices(solutions.flatMap((s) => collectServiceIds(s.sections as unknown as SectionLike[]))),
  ]);
  return solutions.map((s) => {
    const sections = s.sections as unknown as SectionLike[];
    const itemCount = collectServiceIds(sections).length;
    const available = buildPublicSections(sections, services, categories).stats.serviceCount;
    return {
      _id: String(s._id),
      slug: s.slug,
      title: s.title,
      iconName: s.iconName,
      color: s.color,
      status: s.status,
      showOnHome: s.showOnHome,
      order: s.order,
      itemCount,
      unavailableCount: itemCount - available,
      updatedAt: new Date(s.updatedAt).toISOString(),
    };
  });
}

export async function getAdminById(id: string) {
  assertObjectId(id);
  const solution = await Solution.findById(id).lean();
  if (!solution) throw new AppError('Solution not found', 404);
  const ids = collectServiceIds(solution.sections as unknown as SectionLike[]);
  const [categories, services] = await Promise.all([loadCategories(), loadServices(ids)]);
  const itemsMeta: Record<string, SolutionItemMeta> = {};
  for (const sid of ids) {
    const service = services.get(sid);
    itemsMeta[sid] = service
      ? {
          title: service.title ?? '',
          status: service.status ?? 'published',
          categoryName: service.categoryName ?? '',
          priceMin: Number(service.price?.min) || 0,
          available: isPublished(service) && resolveServiceHref(service, categories) !== null,
        }
      : { title: 'Deleted service', status: 'deleted', categoryName: '', priceMin: 0, available: false };
  }
  return {
    ...solution,
    _id: String(solution._id),
    sections: (solution.sections ?? []).map((section) => ({
      title: section.title,
      items: section.items.map((item) => ({ service: String(item.service), popular: !!item.popular })),
    })),
    itemsMeta,
  };
}

export async function createSolution(input: SolutionInput) {
  await assertValid(input);
  // Duplicate slug → E11000 → existing errorMiddleware → 409 { field: 'slug' }.
  const created = await Solution.create(input);
  return getAdminById(String(created._id));
}

export async function updateSolution(id: string, patch: Partial<SolutionInput>) {
  assertObjectId(id);
  const existing = await Solution.findById(id);
  if (!existing) throw new AppError('Solution not found', 404);
  const current = existing.toObject();
  await assertValid({
    sections: (patch.sections ?? (current.sections as unknown as SolutionInput['sections'])) ?? [],
    status: patch.status ?? current.status,
  });
  existing.set(patch);
  await existing.save();
  return getAdminById(id);
}

export async function deleteSolution(id: string): Promise<void> {
  assertObjectId(id);
  const deleted = await Solution.findByIdAndDelete(id);
  if (!deleted) throw new AppError('Solution not found', 404);
}

/** `ids` must list every solution exactly once; nothing is written otherwise (Review Focus #4). */
export async function reorderSolutions(ids: string[]): Promise<SolutionAdminRow[]> {
  const stored = new Set((await Solution.find({}, '_id').lean()).map((s) => String(s._id)));
  const given = new Set(ids);
  const valid = given.size === ids.length && given.size === stored.size && ids.every((id) => stored.has(id));
  if (!valid) throw new AppError('ids must list every solution exactly once', 400);
  await Solution.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } })));
  return listAdmin();
}
```

- [ ] **Step 5: `src/controllers/solution.controller.ts`**

```ts
import { NextFunction, Request, Response } from 'express';
import * as solutionService from '../services/solution.service';

export const listPublishedSolutions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await solutionService.listPublished(req.query.home === 'true');
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPublishedSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await solutionService.getPublishedBySlug(req.params.slug);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const listAdminSolutions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await solutionService.listAdmin();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await solutionService.getAdminById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await solutionService.createSolution(req.body);
    res.status(201).json({ success: true, data, message: 'Solution created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await solutionService.updateSolution(req.params.id, req.body);
    res.status(200).json({ success: true, data, message: 'Solution updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await solutionService.deleteSolution(req.params.id);
    res.status(200).json({ success: true, message: 'Solution deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderSolutions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await solutionService.reorderSolutions(req.body.ids);
    res.status(200).json({ success: true, data, message: 'Order saved' });
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 6: `src/routes/solution.routes.ts` and mount**

```ts
import { Router } from 'express';
import * as solutionController from '../controllers/solution.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { publicCache } from '../middlewares/cache.middleware';
import {
  createSolutionSchema,
  listSolutionsQuerySchema,
  reorderSolutionsSchema,
  solutionIdSchema,
  solutionSlugSchema,
  updateSolutionSchema,
} from '../validations/solution.validations';

const router = Router();
const admin = [authenticate, authorize('admin')];

// Admin routes FIRST, so the public '/:slug' route can never swallow '/admin/...'.
router.get('/admin/all', ...admin, solutionController.listAdminSolutions);
router.put('/admin/reorder', ...admin, validate(reorderSolutionsSchema), solutionController.reorderSolutions);
router.get('/admin/:id', ...admin, validate(solutionIdSchema), solutionController.getAdminSolution);
router.post('/admin', ...admin, validate(createSolutionSchema), solutionController.createSolution);
router.put('/admin/:id', ...admin, validate(updateSolutionSchema), solutionController.updateSolution);
router.delete('/admin/:id', ...admin, validate(solutionIdSchema), solutionController.deleteSolution);

// Public — published only; no status / drafts parameter exists (spec: "Drafts are never public").
router.get('/', publicCache, validate(listSolutionsQuerySchema), solutionController.listPublishedSolutions);
router.get('/:slug', publicCache, validate(solutionSlugSchema), solutionController.getPublishedSolution);

export default router;
```
In `src/routes/index.ts` add `import solutionRoutes from './solution.routes';` next to the other imports, and `router.use('/solutions', solutionRoutes);` after `router.use('/stats', statsRoutes);`.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit` → exit 0. Then `npm run dev` and:
```bash
curl -s http://localhost:4000/api/solutions | jq '.success, (.data | length)'          # true, 0
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4000/api/solutions/admin/all  # 401
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4000/api/solutions/nope      # 404
```
Run the unit tests again: `TS_NODE_TRANSPILE_ONLY=1 node --require ts-node/register --test tests/solution.helpers.test.ts` → pass.

- [ ] **Step 8: Checkpoint (no commit)**

---

### Task 3: Backend smoke suite

**Files:**
- Create: `cleartax backend/scripts/smoke-solutions.sh`

**Interfaces:**
- Consumes: the Task 2 API, `POST /api/auth/login` → `data.accessToken`, and `GET /api/services?includeDrafts=true` (public, unclamped; used only to read one published and one draft service id).

- [ ] **Step 1: Create the script**

```bash
#!/usr/bin/env bash
# Integration smoke suite for /api/solutions (spec B2).
# Writes ONLY to the `solutions` collection, ONLY documents whose slug starts with zz-smoke-,
# and removes them on exit (trap), even after a failure.
#   ADMIN_EMAIL=… ADMIN_PASSWORD=… ./scripts/smoke-solutions.sh [http://localhost:4000/api]
set -uo pipefail
API="${1:-http://localhost:4000/api}"
: "${ADMIN_EMAIL:?set ADMIN_EMAIL}"
: "${ADMIN_PASSWORD:?set ADMIN_PASSWORD}"

PASS=0; FAIL=0
BODY="$(mktemp)"
ok()  { PASS=$((PASS + 1)); echo "  ok    $1"; }
bad() { FAIL=$((FAIL + 1)); echo "  FAIL  $1"; }
expect() { if [ "$3" = "$2" ]; then ok "$1 ($3)"; else bad "$1: expected $2, got $3 — $(head -c 300 "$BODY")"; fi; }
req() { curl -s -o "$BODY" -w '%{http_code}' "$@"; }

TOKEN="$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.data.accessToken // empty')"
[ -n "$TOKEN" ] || { echo "Login failed for $ADMIN_EMAIL"; exit 1; }
AUTH=(-H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json')

cleanup() {
  curl -s "$API/solutions/admin/all?_t=$(date +%s)" "${AUTH[@]}" \
    | jq -r '.data[]? | select(.slug | startswith("zz-smoke-")) | ._id' \
    | while read -r id; do curl -s -o /dev/null -X DELETE "$API/solutions/admin/$id" "${AUTH[@]}"; done
  rm -f "$BODY"
}
trap cleanup EXIT

SERVICES="$(curl -s "$API/services?includeDrafts=true")"
PUB="$(echo "$SERVICES" | jq -r '[.data[] | select(.status == "published")][0]._id')"
DRAFT="$(echo "$SERVICES" | jq -r '[.data[] | select(.status == "draft")][0]._id // empty')"
[ -n "$PUB" ] && [ "$PUB" != "null" ] || { echo "No published service found"; exit 1; }
SLUG="zz-smoke-$(date +%s)"
echo "API=$API  slug=$SLUG  published=$PUB  draft=${DRAFT:-none}"

echo "1. auth"
expect "list admin without token" 401 "$(req "$API/solutions/admin/all")"
expect "create without token" 401 "$(req -X POST "$API/solutions/admin" -H 'Content-Type: application/json' -d '{}')"
expect "reorder without token" 401 "$(req -X PUT "$API/solutions/admin/reorder" -H 'Content-Type: application/json' -d '{"ids":[]}')"
expect "delete without token" 401 "$(req -X DELETE "$API/solutions/admin/000000000000000000000000")"

echo "2. create draft, invisible publicly"
ITEMS="{\"service\":\"$PUB\",\"popular\":true}"
[ -n "$DRAFT" ] && ITEMS="$ITEMS,{\"service\":\"$DRAFT\"}"
CREATE="{\"slug\":\"$SLUG\",\"title\":\"Smoke Test\",\"iconName\":\"Rocket\",\"color\":\"teal\",\"status\":\"draft\",\"sections\":[{\"title\":\"Step one\",\"items\":[$ITEMS]}]}"
expect "create draft" 201 "$(req -X POST "$API/solutions/admin" "${AUTH[@]}" -d "$CREATE")"
ID="$(jq -r '.data._id' "$BODY")"
expect "draft is 404 publicly" 404 "$(req "$API/solutions/$SLUG")"
expect "admin get by id" 200 "$(req "$API/solutions/admin/$ID?_t=1" "${AUTH[@]}")"
expect "itemsMeta has the published service" true "$(jq -r --arg s "$PUB" '.data.itemsMeta[$s].available' "$BODY")"

echo "3. publish, visible publicly, drafts dropped"
expect "publish (partial PUT)" 200 "$(req -X PUT "$API/solutions/admin/$ID" "${AUTH[@]}" -d '{"status":"published"}')"
expect "public detail" 200 "$(req "$API/solutions/$SLUG")"
expect "only the published service is served" 1 "$(jq -r '.data.stats.serviceCount' "$BODY")"
expect "popular flag carried" true "$(jq -r '.data.sections[0].items[0].popular' "$BODY")"
expect "href is a /services path" true "$(jq -r '.data.sections[0].items[0].href | startswith("/services/")' "$BODY")"
expect "listed on home" true "$(curl -s "$API/solutions?home=true" | jq -r --arg s "$SLUG" '[.data[].slug] | index($s) != null')"
expect "show-on-home off (partial PUT)" 200 "$(req -X PUT "$API/solutions/admin/$ID" "${AUTH[@]}" -d '{"showOnHome":false}')"
expect "hidden from home list" false "$(curl -s "$API/solutions?home=true" | jq -r --arg s "$SLUG" '[.data[].slug] | index($s) != null')"

echo "4. validation"
DUP="{\"sections\":[{\"title\":\"Dup\",\"items\":[{\"service\":\"$PUB\"},{\"service\":\"$PUB\"}]}]}"
expect "duplicate service rejected" 400 "$(req -X PUT "$API/solutions/admin/$ID" "${AUTH[@]}" -d "$DUP")"
expect "publish with no items rejected" 400 "$(req -X POST "$API/solutions/admin" "${AUTH[@]}" -d "{\"slug\":\"$SLUG-empty\",\"title\":\"Empty\",\"iconName\":\"Rocket\",\"status\":\"published\"}")"
expect "bad colour rejected" 400 "$(req -X POST "$API/solutions/admin" "${AUTH[@]}" -d "{\"slug\":\"$SLUG-c\",\"title\":\"Colour\",\"iconName\":\"Rocket\",\"color\":\"amber\"}")"
expect "unknown service rejected" 400 "$(req -X POST "$API/solutions/admin" "${AUTH[@]}" -d "{\"slug\":\"$SLUG-u\",\"title\":\"Unknown\",\"iconName\":\"Rocket\",\"sections\":[{\"title\":\"S1\",\"items\":[{\"service\":\"000000000000000000000000\"}]}]}")"
expect "server-managed field rejected (strict)" 400 "$(req -X POST "$API/solutions/admin" "${AUTH[@]}" -d "{\"_id\":\"$ID\",\"slug\":\"$SLUG-s\",\"title\":\"Strict\",\"iconName\":\"Rocket\"}")"
expect "malformed id" 400 "$(req "$API/solutions/admin/not-an-id" "${AUTH[@]}")"
expect "duplicate slug" 409 "$(req -X POST "$API/solutions/admin" "${AUTH[@]}" -d "{\"slug\":\"$SLUG\",\"title\":\"Again\",\"iconName\":\"Rocket\"}")"
expect "409 names the slug field" slug "$(jq -r '.errors[0].field' "$BODY")"

echo "5. reorder"
ORIG="$(curl -s "$API/solutions/admin/all?_t=$(date +%s)" "${AUTH[@]}" | jq -c '[.data[]._id]')"
expect "reorder with duplicate ids rejected" 400 "$(req -X PUT "$API/solutions/admin/reorder" "${AUTH[@]}" -d "{\"ids\":[\"$ID\",\"$ID\"]}")"
expect "reorder with a foreign id rejected" 400 "$(req -X PUT "$API/solutions/admin/reorder" "${AUTH[@]}" -d '{"ids":["000000000000000000000000"]}')"
REVERSED="$(echo "$ORIG" | jq -c 'reverse')"
expect "reorder reversed" 200 "$(req -X PUT "$API/solutions/admin/reorder" "${AUTH[@]}" -d "{\"ids\":$REVERSED}")"
expect "first row is the old last" "$(echo "$ORIG" | jq -r '.[-1]')" "$(jq -r '.data[0]._id' "$BODY")"
expect "restore original order" 200 "$(req -X PUT "$API/solutions/admin/reorder" "${AUTH[@]}" -d "{\"ids\":$ORIG}")"

echo "6. delete"
expect "delete" 200 "$(req -X DELETE "$API/solutions/admin/$ID" "${AUTH[@]}")"
expect "deleted is 404 publicly" 404 "$(req "$API/solutions/$SLUG")"
expect "deleted is 404 for admin" 404 "$(req "$API/solutions/admin/$ID?_t=2" "${AUTH[@]}")"

echo
echo "passed: $PASS   failed: $FAIL"
[ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Run it**

Run (backend running; credentials typed in the shell, never saved to a file):
`chmod +x scripts/smoke-solutions.sh && ADMIN_EMAIL='…' ADMIN_PASSWORD='…' ./scripts/smoke-solutions.sh`
Expected: `failed: 0`. Then `curl -s http://localhost:4000/api/solutions | jq '.data | length'` → `0` (cleanup worked). If no draft service exists, the "only the published service is served" check still expects 1.

- [ ] **Step 3: Checkpoint (no commit)**

---

### Task 4: Frontend types, API client, pure form helpers (TDD)

**Files:**
- Modify: `cleartax frontend/app/lib/api/types.ts` (append)
- Create: `app/lib/api/services/solution.service.ts`, `app/lib/solutions/form.ts`, `app/lib/solutions/formSchema.ts`, `tests/solutions-form.test.ts`

**Interfaces:**
- Consumes: `FvColor` and `FV_COLOR_KEYS` (Plan 1, `app/lib/fv/colors.ts`), `apiGet` / `apiPut` / `apiDelete` / `apiRequest` (`app/lib/api/axios.ts`).
- Produces:
  - Types `SolutionColor`, `SolutionServiceItem`, `SolutionSummary`, `SolutionDetail`, `SolutionInput`, `SolutionAdminRow`, `SolutionItemMeta`, `SolutionAdminDetail`
  - `solutionService.{listAdmin, getAdmin, create, update, remove, reorder}`
  - `slugify(input: string): string`
  - `mapServerErrors(errors?: {field: string; message: string}[]): Record<string, string>`
  - `interface SolutionFormValues`
  - `toPayload(values: SolutionFormValues, status: 'draft' | 'published')` → `SolutionPayload`
  - `toFormValues(detail?)` → `SolutionFormValues`
  - `solutionFormSchema` (zod v4)
  - `type SolutionFormSchemaValues`

All commands run from `cleartax frontend/`.

- [ ] **Step 1: Append the types to `app/lib/api/types.ts`**

```ts
// ── Solutions (spec 2026-10-05-solutions-design) ─────────────────────────────
export type SolutionColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'teal' | 'yellow' | 'pink';

export interface SolutionServiceItem {
  id: string;
  title: string;
  shortDescription: string;
  iconName: string;
  price: { min: number; max: number; currency: string };
  duration: string;
  href: string;
  popular: boolean;
}

export interface SolutionSummary {
  slug: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: SolutionColor;
  serviceCount: number;
}

export interface SolutionDetail extends SolutionSummary {
  pageHeading: string;
  pageDescription: string;
  stats: { serviceCount: number; startingPrice: number; sectionCount: number };
  sections: { title: string; items: SolutionServiceItem[] }[];
}

export interface SolutionInput {
  slug: string;
  title: string;
  subtitle?: string;
  iconName: string;
  color?: SolutionColor;
  pageHeading?: string;
  pageDescription?: string;
  sections?: { title: string; items: { service: string; popular?: boolean }[] }[];
  showOnHome?: boolean;
  order?: number;
  status?: 'draft' | 'published';
}

export interface SolutionAdminRow {
  _id: string;
  slug: string;
  title: string;
  iconName: string;
  color: SolutionColor;
  status: 'draft' | 'published';
  showOnHome: boolean;
  order: number;
  itemCount: number;
  unavailableCount: number;
  updatedAt: string;
}

export interface SolutionItemMeta {
  title: string;
  status: string;
  categoryName: string;
  priceMin: number;
  available: boolean;
}

export interface SolutionAdminDetail {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: SolutionColor;
  pageHeading: string;
  pageDescription: string;
  sections: { title: string; items: { service: string; popular: boolean }[] }[];
  showOnHome: boolean;
  order: number;
  status: 'draft' | 'published';
  itemsMeta: Record<string, SolutionItemMeta>;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Create `app/lib/api/services/solution.service.ts`**

```ts
import { apiDelete, apiGet, apiPut, apiRequest } from '../axios';
import type { SolutionAdminDetail, SolutionAdminRow, SolutionInput } from '../types';

/** Admin API for solutions (JWT added by the axios interceptor). Public reads live in lib/solutions/publicApi.ts. */
export const solutionService = {
  listAdmin: async (): Promise<SolutionAdminRow[]> => (await apiGet<SolutionAdminRow[]>('/solutions/admin/all')).data ?? [],

  getAdmin: async (id: string): Promise<SolutionAdminDetail> => (await apiGet<SolutionAdminDetail>(`/solutions/admin/${id}`)).data,

  // apiRequest, not apiPost: apiPost toasts every error, but the editor maps field errors inline.
  create: async (input: SolutionInput): Promise<SolutionAdminDetail> =>
    (await apiRequest<SolutionAdminDetail>({ method: 'POST', url: '/solutions/admin', data: input })).data,

  update: async (id: string, patch: Partial<SolutionInput>): Promise<SolutionAdminDetail> =>
    (await apiPut<SolutionAdminDetail>(`/solutions/admin/${id}`, patch)).data,

  remove: async (id: string): Promise<void> => {
    await apiDelete(`/solutions/admin/${id}`);
  },

  reorder: async (ids: string[]): Promise<SolutionAdminRow[]> =>
    (await apiPut<SolutionAdminRow[]>('/solutions/admin/reorder', { ids })).data ?? [],
};
```

- [ ] **Step 3: Write the failing tests**

`tests/solutions-form.test.ts`:
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapServerErrors, slugify, toFormValues, toPayload } from '../app/lib/solutions/form';

test('slugify', () => {
  assert.equal(slugify('Start a Business'), 'start-a-business');
  assert.equal(slugify('Tax & Compliance'), 'tax-and-compliance');
  assert.equal(slugify('  Go Public (IPO)!! '), 'go-public-ipo');
  assert.equal(slugify(''), '');
  assert.equal(slugify('x'.repeat(100)).length, 80);
});

test('mapServerErrors strips the body. prefix and keeps the first message per field', () => {
  assert.deepEqual(
    mapServerErrors([
      { field: 'body.sections.0.title', message: 'Section title must be at least 2 characters' },
      { field: 'slug', message: 'slug is already taken' },
      { field: 'slug', message: 'second message ignored' },
      { field: '', message: 'no field' },
    ]),
    { 'sections.0.title': 'Section title must be at least 2 characters', slug: 'slug is already taken' },
  );
  assert.deepEqual(mapServerErrors(undefined), {});
});

test('toPayload trims, sets status and drops server-managed fields', () => {
  const values = {
    ...toFormValues(),
    title: '  Start a Business ',
    slug: ' start-a-business ',
    subtitle: ' Company & more ',
    sections: [{ title: ' Structure ', items: [{ service: 'a'.repeat(24), popular: true }] }],
    _id: 'should-not-be-sent',
    itemsMeta: {},
  } as unknown as Parameters<typeof toPayload>[0];
  const payload = toPayload(values, 'published');
  assert.deepEqual(Object.keys(payload).sort(), [
    'color', 'iconName', 'pageDescription', 'pageHeading', 'sections', 'showOnHome', 'slug', 'status', 'subtitle', 'title',
  ]);
  assert.equal(payload.title, 'Start a Business');
  assert.equal(payload.slug, 'start-a-business');
  assert.equal(payload.status, 'published');
  assert.deepEqual(payload.sections, [{ title: 'Structure', items: [{ service: 'a'.repeat(24), popular: true }] }]);
});

test('toFormValues: defaults for a new solution, picks known fields from a detail', () => {
  assert.deepEqual(toFormValues(), {
    title: '', slug: '', iconName: 'Rocket', color: 'blue', subtitle: '', pageHeading: '', pageDescription: '', showOnHome: true, sections: [],
  });
  // A variable (not an inline literal) so the extra server fields don't trip TS excess-property checks.
  const detail = {
    _id: 'x', slug: 's', title: 'T', subtitle: 'Sub', iconName: 'Scale', color: 'teal' as const, pageHeading: 'H', pageDescription: 'D',
    sections: [{ title: 'One', items: [{ service: 'b'.repeat(24), popular: false }] }], showOnHome: false, order: 3,
    status: 'published', itemsMeta: {}, createdAt: '', updatedAt: '',
  };
  const values = toFormValues(detail);
  assert.equal(values.color, 'teal');
  assert.equal(values.showOnHome, false);
  assert.equal('itemsMeta' in values, false);
  assert.equal(values.sections[0].items[0].popular, false);
});
```
Run: `./scripts/test-pure.sh` → FAIL (module not found).

- [ ] **Step 4: Implement `app/lib/solutions/form.ts`**

Pure: relative imports only, no zod and no React.
```ts
import type { FvColor } from '../fv/colors';

export interface SolutionFormValues {
  title: string;
  slug: string;
  iconName: string;
  color: FvColor;
  subtitle: string;
  pageHeading: string;
  pageDescription: string;
  showOnHome: boolean;
  sections: { title: string; items: { service: string; popular: boolean }[] }[];
}

export interface SolutionPayload {
  slug: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: FvColor;
  pageHeading: string;
  pageDescription: string;
  showOnHome: boolean;
  status: 'draft' | 'published';
  sections: { title: string; items: { service: string; popular: boolean }[] }[];
}

export function slugify(input: string): string {
  return (input ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/** Server 400/409 `errors[]` → react-hook-form field paths (`body.sections.0.title` → `sections.0.title`). */
export function mapServerErrors(errors?: { field: string; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const error of errors ?? []) {
    if (!error?.field) continue;
    const key = error.field.replace(/^body\./, '');
    if (!(key in out)) out[key] = error.message;
  }
  return out;
}

/** Builds the request body from scratch, so server-managed fields can never leak (Review Focus #5). */
export function toPayload(values: SolutionFormValues, status: 'draft' | 'published'): SolutionPayload {
  return {
    slug: values.slug.trim(),
    title: values.title.trim(),
    subtitle: values.subtitle.trim(),
    iconName: values.iconName.trim(),
    color: values.color,
    pageHeading: values.pageHeading.trim(),
    pageDescription: values.pageDescription.trim(),
    showOnHome: values.showOnHome,
    status,
    sections: values.sections.map((section) => ({
      title: section.title.trim(),
      items: section.items.map((item) => ({ service: item.service, popular: !!item.popular })),
    })),
  };
}

interface DetailLike {
  slug: string;
  title: string;
  subtitle?: string;
  iconName: string;
  color: FvColor;
  pageHeading?: string;
  pageDescription?: string;
  showOnHome: boolean;
  sections: { title: string; items: { service: string; popular: boolean }[] }[];
}

export function toFormValues(detail?: DetailLike): SolutionFormValues {
  if (!detail) {
    return { title: '', slug: '', iconName: 'Rocket', color: 'blue', subtitle: '', pageHeading: '', pageDescription: '', showOnHome: true, sections: [] };
  }
  return {
    title: detail.title,
    slug: detail.slug,
    iconName: detail.iconName,
    color: detail.color,
    subtitle: detail.subtitle ?? '',
    pageHeading: detail.pageHeading ?? '',
    pageDescription: detail.pageDescription ?? '',
    showOnHome: detail.showOnHome,
    sections: detail.sections.map((section) => ({
      title: section.title,
      items: section.items.map((item) => ({ service: item.service, popular: !!item.popular })),
    })),
  };
}
```
Run: `./scripts/test-pure.sh` → all pass.

- [ ] **Step 5: Create `app/lib/solutions/formSchema.ts`**

Its limits match the backend exactly (Global Constraints).
```ts
import { z } from 'zod';
import { FV_COLOR_KEYS } from '@/app/lib/fv/colors';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const solutionFormSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(60, 'Title cannot exceed 60 characters'),
  slug: z
    .string()
    .trim()
    .min(1, 'URL is required')
    .max(80, 'URL cannot exceed 80 characters')
    .regex(SLUG_PATTERN, 'Use lowercase words separated by hyphens'),
  iconName: z.string().trim().min(1, 'Pick an icon').max(50),
  color: z.enum(FV_COLOR_KEYS),
  subtitle: z.string().trim().max(120, 'Subtitle cannot exceed 120 characters'),
  pageHeading: z.string().trim().max(120, 'Page heading cannot exceed 120 characters'),
  pageDescription: z.string().trim().max(300, 'Page description cannot exceed 300 characters'),
  showOnHome: z.boolean(),
  sections: z
    .array(
      z.object({
        title: z.string().trim().min(2, 'Section title must be at least 2 characters').max(80, 'Section title cannot exceed 80 characters'),
        items: z
          .array(z.object({ service: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid service'), popular: z.boolean() }))
          .max(40, 'A section can hold at most 40 services'),
      }),
    )
    .max(10, 'A solution can have at most 10 sections'),
});

export type SolutionFormSchemaValues = z.infer<typeof solutionFormSchema>;
```

- [ ] **Step 6: Verify**

Run: `./scripts/test-pure.sh && npx tsc --noEmit` → pass, exit 0.

- [ ] **Step 7: Checkpoint (no commit)**

---

### Task 5: Admin sidebar + Solutions list page

> **Amendment A1 (2026-10-07):** use `IconTileByName` for `iconName` rendering (see "Amendments" at the top).

**Files:**
- Modify: `app/components/admin/AdminSidebar.tsx`
- Create: `app/(admin)/admin/solutions/page.tsx`

**Interfaces:**
- Consumes: `solutionService` (Task 4), `useConfirm` (`app/components/admin/ConfirmDialog`, options `{title, message?, confirmLabel?, cancelLabel?, variant?: 'danger' | 'warning' | 'success' | 'info'}`), `IconTile` (Plan 1), `isFvColor`.

- [ ] **Step 1: Sidebar link**

In `AdminSidebar.tsx`:
1. Add `Rocket` to the lucide import list.
2. Insert this block between the closing `</div>` of the `{/* Services Dropdown */}` block and `{/* Migration Link */}`:
```tsx
            {/* Solutions (spec 2026-10-05-solutions-design) */}
            <Link
              href="/admin/solutions"
              prefetch={false}
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                pathname?.startsWith('/admin/solutions')
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Rocket className="w-5 h-5" />
              <span className="font-medium">Solutions</span>
            </Link>
```

- [ ] **Step 2: Create `app/(admin)/admin/solutions/page.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowDown, ArrowUp, ExternalLink, Loader2, Pencil, Plus, Rocket, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import IconTile from '@/app/components/fv/IconTile';
import { useConfirm } from '@/app/components/admin/ConfirmDialog';
import { solutionService } from '@/app/lib/api/services/solution.service';
import { isFvColor } from '@/app/lib/fv/colors';
import type { SolutionAdminRow } from '@/app/lib/api/types';

export default function SolutionsAdminPage() {
  const confirm = useConfirm();
  const [rows, setRows] = useState<SolutionAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await solutionService.listAdmin());
    } catch (err: any) {
      setError(err?.message || 'Failed to load solutions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const ids = rows.map((row) => row._id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusy('reorder');
    try {
      setRows(await solutionService.reorder(ids));
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the order');
    } finally {
      setBusy(null);
    }
  };

  const toggleHome = async (row: SolutionAdminRow) => {
    setBusy(row._id);
    try {
      await solutionService.update(row._id, { showOnHome: !row.showOnHome });
      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, showOnHome: !r.showOnHome } : r)));
      toast.success(row.showOnHome ? 'Hidden from the home page' : 'Shown on the home page');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update the solution');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (row: SolutionAdminRow) => {
    const confirmed = await confirm({
      title: `Delete "${row.title}"?`,
      message: 'Its page stops working and its icon disappears from the home page. The services themselves are not affected.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;
    setBusy(row._id);
    try {
      await solutionService.remove(row._id);
      setRows((prev) => prev.filter((r) => r._id !== row._id));
      toast.success('Solution deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete the solution');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Solutions</h1>
          <p className="text-gray-400">Curated bundles of services shown on the home banner and at /solutions/&lt;url&gt;.</p>
        </div>
        <Link
          href="/admin/solutions/new"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500"
        >
          <Plus className="h-5 w-5" />
          Add Solution
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-red-300">
          {error}{' '}
          <button type="button" onClick={load} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800/50 p-12 text-center">
          <Rocket className="mx-auto mb-3 h-10 w-10 text-gray-500" />
          <p className="mb-4 text-gray-300">No solutions yet.</p>
          <Link href="/admin/solutions/new" prefetch={false} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500">
            <Plus className="h-5 w-5" />
            Add your first solution
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-700 overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
          {rows.map((row, index) => (
            <li key={row._id} className="flex flex-wrap items-center gap-4 p-4">
              <IconTile name={row.iconName} color={isFvColor(row.color) ? row.color : 'blue'} size="md" solid />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold text-white">{row.title}</h2>
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      row.status === 'published' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-300',
                    )}
                  >
                    {row.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="truncate font-mono text-sm text-gray-400">/solutions/{row.slug}</p>
                <p className={clsx('mt-1 flex items-center gap-1 text-sm', row.unavailableCount > 0 ? 'text-amber-300' : 'text-gray-400')}>
                  {row.unavailableCount > 0 && <AlertTriangle className="h-4 w-4" />}
                  {row.itemCount} services{row.unavailableCount > 0 ? ` · ${row.unavailableCount} unavailable` : ''}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.showOnHome}
                  aria-label={`Show ${row.title} on the home page`}
                  disabled={busy !== null}
                  onClick={() => toggleHome(row)}
                  className={clsx('relative h-6 w-11 rounded-full transition-colors disabled:opacity-50', row.showOnHome ? 'bg-blue-600' : 'bg-gray-600')}
                >
                  <span className={clsx('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all', row.showOnHome ? 'left-[22px]' : 'left-0.5')} />
                </button>
                Home
              </label>
              <div className="flex items-center gap-1">
                <IconAction label="Move up" disabled={index === 0 || busy !== null} onClick={() => move(index, -1)}>
                  <ArrowUp />
                </IconAction>
                <IconAction label="Move down" disabled={index === rows.length - 1 || busy !== null} onClick={() => move(index, 1)}>
                  <ArrowDown />
                </IconAction>
                {row.status === 'published' && (
                  <a
                    href={`/solutions/${row.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${row.title}`}
                    title="View page"
                    className="grid h-9 w-9 place-items-center rounded-md text-gray-400 hover:bg-gray-700 hover:text-white [&>svg]:h-4 [&>svg]:w-4"
                  >
                    <ExternalLink />
                  </a>
                )}
                <Link
                  href={`/admin/solutions/${row._id}`}
                  prefetch={false}
                  aria-label={`Edit ${row.title}`}
                  title="Edit"
                  className="grid h-9 w-9 place-items-center rounded-md text-blue-400 hover:bg-gray-700 hover:text-blue-300 [&>svg]:h-4 [&>svg]:w-4"
                >
                  <Pencil />
                </Link>
                <IconAction label={`Delete ${row.title}`} danger disabled={busy !== null} onClick={() => remove(row)}>
                  <Trash2 />
                </IconAction>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'grid h-9 w-9 place-items-center rounded-md text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent [&>svg]:h-4 [&>svg]:w-4',
        danger && 'hover:!bg-red-900/40 hover:!text-red-300',
      )}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → exit 0. With both servers running, log in to `/admin`: the "Solutions" sidebar item appears after Services, and `/admin/solutions` shows the empty state.

- [ ] **Step 4: Checkpoint (no commit)**

---

### Task 6: Admin editor (new + edit)

> **Amendment A1 (2026-10-07):** `SolutionPreview` renders `iconName` via `IconTileByName` (see "Amendments" at the top).

**Files:**
- Create: `app/lib/admin/useUnsavedChangesGuard.ts`, `app/components/admin/solutions/ColorSwatches.tsx`, `ServicePicker.tsx`, `SectionEditor.tsx`, `SolutionPreview.tsx`, `SolutionForm.tsx`, `app/(admin)/admin/solutions/new/page.tsx`, `app/(admin)/admin/solutions/[id]/page.tsx`

**Interfaces:**
- Consumes:
  - Task 4 (`solutionFormSchema`, `SolutionFormSchemaValues`, `toFormValues`, `toPayload`, `mapServerErrors`, `slugify`, `solutionService`)
  - `useServiceIndex()` → `{ rows: ServiceRow[]; loading; error; truncated; refresh }`
  - `applyFilters(rows, FilterState)` and `DEFAULT_FILTER_STATE` (`app/lib/admin/serviceFilters`)
  - `ServiceRow` `{ id, title, status, categoryTitle, raw: Service }`
  - `IconPicker({ value, onChange, label?, error? })`
  - `useConfirm`
  - `IconTile`, `FV_COLOR_KEYS`, `FV_COLOR_HEX`, `formatFromPrice`, `splitHeading`, `plural` (Plan 1)
- Produces: `<SolutionForm initial?: SolutionAdminDetail />`

- [ ] **Step 1: `app/lib/admin/useUnsavedChangesGuard.ts`**

```ts
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/app/components/admin/ConfirmDialog';

/**
 * Warns before leaving with unsaved changes: browser unload (native prompt) and in-app
 * <a> clicks (ConfirmDialog — never window.confirm, per the 2026-07-05 admin rule).
 * The capture-phase listener runs before Next's <Link> handler and stops it.
 */
export function useUnsavedChangesGuard(dirty: boolean): void {
  const confirm = useConfirm();
  const router = useRouter();
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    const onClick = async (event: MouseEvent) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      event.preventDefault();
      event.stopPropagation();
      const leave = await confirm({
        title: 'Discard unsaved changes?',
        message: 'You have edits that are not saved yet.',
        confirmLabel: 'Discard changes',
        cancelLabel: 'Keep editing',
        variant: 'warning',
      });
      if (leave) {
        dirtyRef.current = false;
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [confirm, router]);
}
```

- [ ] **Step 2: `ColorSwatches.tsx` and `SolutionPreview.tsx`**

`app/components/admin/solutions/ColorSwatches.tsx`:
```tsx
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { FV_COLOR_HEX, FV_COLOR_KEYS, type FvColor } from '@/app/lib/fv/colors';

export default function ColorSwatches({
  value,
  onChange,
  labelledBy,
}: {
  value: FvColor;
  onChange: (color: FvColor) => void;
  labelledBy: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {FV_COLOR_KEYS.map((key) => {
        const on = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={key}
            title={key}
            onClick={() => onChange(key)}
            style={{ background: FV_COLOR_HEX[key].fg }}
            className={clsx(
              'grid h-9 w-9 place-items-center rounded-lg text-white ring-offset-2 ring-offset-gray-800 transition',
              on ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-gray-500',
            )}
          >
            {on && <Check className="h-4 w-4" />}
          </button>
        );
      })}
    </div>
  );
}
```

`app/components/admin/solutions/SolutionPreview.tsx`:
```tsx
import IconTile from '@/app/components/fv/IconTile';
import { plural, splitHeading } from '@/app/lib/fv/text';
import type { FvColor } from '@/app/lib/fv/colors';

interface SolutionPreviewProps {
  title: string;
  subtitle: string;
  iconName: string;
  color: FvColor;
  heading: string;
  description: string;
  serviceCount: number;
}

/** Renders public-site styles (fv-site) inside the dark admin so admins see the real look. */
export default function SolutionPreview({ title, subtitle, iconName, color, heading, description, serviceCount }: SolutionPreviewProps) {
  const [line1, line2] = splitHeading(heading);
  return (
    <aside aria-label="Live preview" className="space-y-3 xl:sticky xl:top-6 xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live preview · home rail</p>
      <div className="fv-site rounded-xl bg-white p-6 text-center">
        <IconTile name={iconName} color={color} size="xl" solid className="mx-auto" />
        <p className="mt-3 text-[15px] font-bold text-fv-navy">{title || 'Solution title'}</p>
        <p className="text-[13px] text-fv-muted">{plural(serviceCount, 'service')}</p>
        {subtitle && <p className="mt-2 text-xs text-fv-slate">{subtitle}</p>}
      </div>
      <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Live preview · page header</p>
      <div className="fv-site rounded-xl bg-[linear-gradient(180deg,#F3F9FD,#ffffff)] p-6 text-center">
        <IconTile name={iconName} color={color} size="lg" solid className="mx-auto" />
        <p className="mt-3 text-xl font-extrabold leading-tight text-fv-navy">
          {line1 || 'Page heading'}
          {line2 && (
            <>
              <br />
              <span className="text-fv-blue">{line2}</span>
            </>
          )}
        </p>
        {description && <p className="mt-2 text-sm text-fv-slate">{description}</p>}
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        Prices and timelines aren&apos;t typed here. They come from each service, so a price change in Services shows up everywhere.
      </p>
    </aside>
  );
}
```

- [ ] **Step 3: `ServicePicker.tsx`**

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { applyFilters, DEFAULT_FILTER_STATE, type ServiceRow } from '@/app/lib/admin/serviceFilters';
import { formatFromPrice } from '@/app/lib/fv/text';

interface ServicePickerProps {
  rows: ServiceRow[];
  loading: boolean;
  selectedIds: Set<string>;
  disabled?: boolean;
  inputId: string;
  onAdd: (serviceId: string) => void;
}

/** Search-and-add over the admin service index (drafts listed but not addable). */
export default function ServicePicker({ rows, loading, selectedIds, disabled, inputId, onAdd }: ServicePickerProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(
    () => (query.trim().length < 2 ? [] : applyFilters(rows, { ...DEFAULT_FILTER_STATE, q: query }).slice(0, 8)),
    [rows, query],
  );

  return (
    <div className="mt-3">
      <label htmlFor={inputId} className="sr-only">
        Search services to add
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          id={inputId}
          type="search"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loading ? 'Loading services…' : disabled ? 'This section is full (40 services)' : 'Search services to add (2+ letters)'}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>
      {results.length > 0 && (
        <ul className="mt-1 divide-y divide-gray-700 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
          {results.map((row) => {
            const added = selectedIds.has(row.id);
            const draft = row.status !== 'published';
            const price = formatFromPrice(row.raw?.price);
            return (
              <li key={row.id}>
                <button
                  type="button"
                  disabled={added || draft}
                  onClick={() => {
                    onAdd(row.id);
                    setQuery('');
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-white">{row.title}</span>
                    <span className="block truncate text-xs text-gray-400">
                      {row.categoryTitle}
                      {price ? ` · ${price}` : ''}
                    </span>
                  </span>
                  {added ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <Check className="h-3.5 w-3.5" />
                      Added
                    </span>
                  ) : draft ? (
                    <span className="rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-300">Draft</span>
                  ) : (
                    <Plus className="h-4 w-4 text-blue-400" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <p className="mt-1 text-xs text-gray-500">No services match &ldquo;{query}&rdquo;.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: `SectionEditor.tsx`**

```tsx
'use client';

import { useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { AlertTriangle, ArrowDown, ArrowUp, Star, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useConfirm } from '@/app/components/admin/ConfirmDialog';
import ServicePicker from './ServicePicker';
import { formatFromPrice } from '@/app/lib/fv/text';
import type { ServiceRow } from '@/app/lib/admin/serviceFilters';
import type { SolutionItemMeta } from '@/app/lib/api/types';
import type { SolutionFormSchemaValues } from '@/app/lib/solutions/formSchema';

interface SectionEditorProps {
  index: number;
  count: number;
  rows: ServiceRow[];
  loadingRows: boolean;
  selectedIds: Set<string>;
  itemsMeta: Record<string, SolutionItemMeta>;
  onMove: (to: number) => void;
  onRemove: () => void;
}

export default function SectionEditor({ index, count, rows, loadingRows, selectedIds, itemsMeta, onMove, onRemove }: SectionEditorProps) {
  const confirm = useConfirm();
  const { register, control, setValue, formState } = useFormContext<SolutionFormSchemaValues>();
  const items = useFieldArray({ control, name: `sections.${index}.items` });
  const watched = useWatch({ control, name: `sections.${index}.items` }) ?? [];
  const rowById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const sectionErrors = formState.errors.sections?.[index];

  const removeSection = async () => {
    if (items.fields.length > 0) {
      const confirmed = await confirm({
        title: 'Delete this section?',
        message: `Its ${items.fields.length} service(s) will be removed from the solution.`,
        confirmLabel: 'Delete section',
        variant: 'danger',
      });
      if (!confirmed) return;
    }
    onRemove();
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-300">{index + 1}</span>
        <label htmlFor={`section-${index}-title`} className="sr-only">
          Section {index + 1} title
        </label>
        <input
          id={`section-${index}-title`}
          {...register(`sections.${index}.title`)}
          placeholder="e.g. Choose your business structure"
          className="min-w-0 flex-1 border-b border-dashed border-gray-600 bg-transparent px-1 py-1.5 font-semibold text-white outline-none placeholder:font-normal placeholder:text-gray-500 focus:border-blue-400"
        />
        <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">{items.fields.length}</span>
        <SmallButton label="Move section up" disabled={index === 0} onClick={() => onMove(index - 1)}>
          <ArrowUp />
        </SmallButton>
        <SmallButton label="Move section down" disabled={index === count - 1} onClick={() => onMove(index + 1)}>
          <ArrowDown />
        </SmallButton>
        <SmallButton label="Delete section" danger onClick={removeSection}>
          <Trash2 />
        </SmallButton>
      </div>
      {sectionErrors?.title?.message && <p className="mt-1 text-sm text-red-400">{sectionErrors.title.message}</p>}
      {sectionErrors?.items?.message && <p className="mt-1 text-sm text-red-400">{sectionErrors.items.message}</p>}

      {items.fields.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.fields.map((field, i) => {
            const serviceId = watched[i]?.service ?? field.service;
            const row = rowById.get(serviceId);
            const meta = itemsMeta[serviceId];
            const title = row?.title ?? meta?.title ?? 'Unknown service';
            const unavailable = !loadingRows && (!row || row.status !== 'published' || meta?.available === false);
            const price = row ? formatFromPrice(row.raw?.price) : meta && meta.priceMin > 0 ? formatFromPrice({ min: meta.priceMin }) : null;
            const popular = !!watched[i]?.popular;
            return (
              <li
                key={field.id}
                className={clsx(
                  'flex items-center gap-2 rounded-lg border px-2 py-1.5',
                  unavailable ? 'border-amber-500/40 bg-amber-500/10' : 'border-gray-700 bg-gray-800',
                )}
              >
                <button
                  type="button"
                  aria-pressed={popular}
                  aria-label={popular ? `Unmark ${title} as most popular` : `Mark ${title} as most popular`}
                  title="Most popular"
                  onClick={() => setValue(`sections.${index}.items.${i}.popular`, !popular, { shouldDirty: true })}
                  className={clsx('grid h-8 w-8 flex-none place-items-center rounded', popular ? 'text-amber-300' : 'text-gray-500 hover:text-gray-300')}
                >
                  <Star className={clsx('h-4 w-4', popular && 'fill-current')} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{title}</p>
                  {unavailable ? (
                    <p className="flex items-center gap-1 truncate text-xs text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 flex-none" />
                      Unavailable: unpublished or deleted. Remove it or publish the service.
                    </p>
                  ) : (
                    <p className="truncate text-xs text-gray-400">
                      {row?.categoryTitle ?? meta?.categoryName ?? ''}
                      {price ? ` · From ${price}` : ''}
                    </p>
                  )}
                </div>
                <SmallButton label={`Move ${title} up`} disabled={i === 0} onClick={() => items.move(i, i - 1)}>
                  <ArrowUp />
                </SmallButton>
                <SmallButton label={`Move ${title} down`} disabled={i === items.fields.length - 1} onClick={() => items.move(i, i + 1)}>
                  <ArrowDown />
                </SmallButton>
                <SmallButton label={`Remove ${title}`} onClick={() => items.remove(i)}>
                  <X />
                </SmallButton>
              </li>
            );
          })}
        </ul>
      )}

      <ServicePicker
        rows={rows}
        loading={loadingRows}
        selectedIds={selectedIds}
        disabled={items.fields.length >= 40}
        inputId={`section-${index}-search`}
        onAdd={(serviceId) => items.append({ service: serviceId, popular: false })}
      />
    </div>
  );
}

function SmallButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'grid h-8 w-8 flex-none place-items-center rounded-md text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent [&>svg]:h-4 [&>svg]:w-4',
        danger && 'hover:!bg-red-900/40 hover:!text-red-300',
      )}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 5: `SolutionForm.tsx`**

```tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, FormProvider, useFieldArray, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, Loader2, Plus, Save, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import IconPicker from '@/app/components/admin/IconPicker';
import ColorSwatches from './ColorSwatches';
import SectionEditor from './SectionEditor';
import SolutionPreview from './SolutionPreview';
import { solutionFormSchema, type SolutionFormSchemaValues } from '@/app/lib/solutions/formSchema';
import { mapServerErrors, slugify, toFormValues, toPayload } from '@/app/lib/solutions/form';
import { solutionService } from '@/app/lib/api/services/solution.service';
import { useServiceIndex } from '@/app/lib/admin/useServiceIndex';
import { useUnsavedChangesGuard } from '@/app/lib/admin/useUnsavedChangesGuard';
import type { SolutionAdminDetail } from '@/app/lib/api/types';

const INPUT =
  'w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';
const LABEL = 'mb-1.5 block text-sm font-medium text-gray-300';
const PANEL = 'rounded-xl border border-gray-700 bg-gray-800 p-5';

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-400">{message}</p> : null;
}

export default function SolutionForm({ initial }: { initial?: SolutionAdminDetail }) {
  const router = useRouter();
  const isEdit = !!initial;
  const wasPublished = initial?.status === 'published';
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState<null | 'draft' | 'published'>(null);
  const serviceIndex = useServiceIndex();

  const methods = useForm<SolutionFormSchemaValues>({
    resolver: zodResolver(solutionFormSchema),
    defaultValues: toFormValues(initial),
    mode: 'onTouched',
  });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isDirty },
  } = methods;
  const sections = useFieldArray({ control, name: 'sections' });
  const values = useWatch({ control });
  useUnsavedChangesGuard(isDirty && saving === null);

  const selectedIds = useMemo(
    () => new Set((values.sections ?? []).flatMap((s) => (s?.items ?? []).map((i) => i?.service).filter((id): id is string => !!id))),
    [values.sections],
  );
  const slugChanged = isEdit && wasPublished && (values.slug ?? '') !== initial!.slug;

  const submit = (status: 'draft' | 'published') =>
    handleSubmit(
      async (formValues) => {
        if (status === 'published' && formValues.sections.every((s) => s.items.length === 0)) {
          setError('sections', { type: 'manual', message: 'Add at least one service before publishing' });
          toast.error('Add at least one service before publishing');
          return;
        }
        setSaving(status);
        try {
          const payload = toPayload(formValues, status);
          if (isEdit) await solutionService.update(initial!._id, payload);
          else await solutionService.create(payload);
          toast.success(status === 'published' ? (wasPublished ? 'Solution updated' : 'Solution published') : 'Draft saved');
          reset(formValues);
          router.push('/admin/solutions');
        } catch (err: any) {
          const fieldErrors = Object.entries(mapServerErrors(err?.errors));
          fieldErrors.forEach(([field, message]) =>
            setError(field as FieldPath<SolutionFormSchemaValues>, { type: 'server', message }),
          );
          toast.error(fieldErrors.length > 0 ? 'Please fix the highlighted fields' : err?.message || 'Could not save the solution');
        } finally {
          setSaving(null);
        }
      },
      () => toast.error('Please fix the highlighted fields'),
    );

  const titleField = register('title', {
    onChange: (event) => {
      if (!slugTouched) setValue('slug', slugify(event.target.value), { shouldDirty: true });
    },
  });
  const sectionsError = errors.sections?.message ?? errors.sections?.root?.message;

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/solutions" prefetch={false} className="mb-2 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              All solutions
            </Link>
            <h1 className="text-3xl font-bold text-white">{isEdit ? `Edit “${initial!.title}”` : 'Add Solution'}</h1>
            <p className="mt-1 text-gray-400">Shows as an icon on the home banner and as its own page.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submit('draft')}
              disabled={saving !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2.5 font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
            >
              {saving === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {wasPublished ? 'Unpublish & save draft' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={submit('published')}
              disabled={saving !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {saving === 'published' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {wasPublished ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-6">
            <section className={PANEL} aria-labelledby="solution-card-panel">
              <h2 id="solution-card-panel" className="mb-4 text-lg font-semibold text-white">Card</h2>
              <div className="grid gap-4 md:grid-cols-[1fr_240px]">
                <div>
                  <label htmlFor="solution-title" className={LABEL}>Title</label>
                  <input id="solution-title" {...titleField} placeholder="Start a Business" className={INPUT} />
                  <FieldError message={errors.title?.message} />
                </div>
                <div>
                  <span className={LABEL}>Icon</span>
                  <Controller
                    control={control}
                    name="iconName"
                    render={({ field }) => (
                      <IconPicker value={field.value} onChange={field.onChange} label="solution icon" error={!!errors.iconName} />
                    )}
                  />
                  <FieldError message={errors.iconName?.message} />
                </div>
              </div>
              <div className="mt-4">
                <span id="solution-colour-label" className={LABEL}>Colour</span>
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => <ColorSwatches value={field.value} onChange={field.onChange} labelledBy="solution-colour-label" />}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="solution-subtitle" className={LABEL}>
                  Card subtitle <span className="text-gray-500">(optional)</span>
                </label>
                <input id="solution-subtitle" {...register('subtitle')} placeholder="Company, LLP, Proprietorship & more" className={INPUT} />
                <FieldError message={errors.subtitle?.message} />
              </div>
              <label className="mt-4 flex items-center gap-3 text-sm text-gray-300">
                <input type="checkbox" {...register('showOnHome')} className="h-4 w-4 rounded border-gray-600 bg-gray-900" />
                Show on the home page
              </label>
            </section>

            <section className={PANEL} aria-labelledby="solution-page-panel">
              <h2 id="solution-page-panel" className="mb-4 text-lg font-semibold text-white">Page</h2>
              <label htmlFor="solution-slug" className={LABEL}>Page URL</label>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-700 bg-gray-900 focus-within:ring-2 focus-within:ring-blue-500">
                <span className="flex items-center border-r border-gray-700 px-3 text-sm text-gray-500">finvidhi.com/solutions/</span>
                <input
                  id="solution-slug"
                  {...register('slug', { onChange: () => setSlugTouched(true) })}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-white outline-none"
                />
              </div>
              <FieldError message={errors.slug?.message} />
              {slugChanged && (
                <p className="mt-2 flex items-center gap-2 text-sm text-amber-300">
                  <AlertTriangle className="h-4 w-4 flex-none" />
                  This solution is live. Changing the URL breaks existing links to /solutions/{initial!.slug}.
                </p>
              )}
              <div className="mt-4">
                <label htmlFor="solution-heading" className={LABEL}>
                  Page heading <span className="text-gray-500">(optional, defaults to the title)</span>
                </label>
                <input id="solution-heading" {...register('pageHeading')} placeholder={values.title || 'Start Your Business The Right Way'} className={INPUT} />
                <FieldError message={errors.pageHeading?.message} />
              </div>
              <div className="mt-4">
                <label htmlFor="solution-description" className={LABEL}>Page description</label>
                <textarea id="solution-description" rows={3} {...register('pageDescription')} placeholder="From idea to incorporation, we make it simple." className={INPUT} />
                <div className="flex justify-between">
                  <FieldError message={errors.pageDescription?.message} />
                  <p className="ml-auto mt-1 text-xs text-gray-500">{(values.pageDescription ?? '').length}/300</p>
                </div>
              </div>
            </section>

            <section className={PANEL} aria-labelledby="solution-services-panel">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="solution-services-panel" className="text-lg font-semibold text-white">Services</h2>
                <p className="text-sm text-gray-400">
                  {selectedIds.size} selected in {sections.fields.length} section{sections.fields.length === 1 ? '' : 's'} · ★ = Most popular
                </p>
              </div>
              {serviceIndex.error && (
                <p className="mb-3 text-sm text-red-400">
                  Could not load the service list ({serviceIndex.error}).{' '}
                  <button type="button" onClick={() => serviceIndex.refresh()} className="font-semibold underline">
                    Retry
                  </button>
                </p>
              )}
              <FieldError message={sectionsError} />
              <div className="space-y-4">
                {sections.fields.map((field, index) => (
                  <SectionEditor
                    key={field.id}
                    index={index}
                    count={sections.fields.length}
                    rows={serviceIndex.rows}
                    loadingRows={serviceIndex.loading}
                    selectedIds={selectedIds}
                    itemsMeta={initial?.itemsMeta ?? {}}
                    onMove={(to) => sections.move(index, to)}
                    onRemove={() => sections.remove(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => sections.append({ title: '', items: [] })}
                disabled={sections.fields.length >= 10}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-3 text-sm font-semibold text-gray-300 hover:border-blue-400 hover:text-white disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Add section
              </button>
            </section>
          </div>

          <SolutionPreview
            title={values.title ?? ''}
            subtitle={values.subtitle ?? ''}
            iconName={values.iconName ?? ''}
            color={values.color ?? 'blue'}
            heading={values.pageHeading || values.title || ''}
            description={values.pageDescription ?? ''}
            serviceCount={selectedIds.size}
          />
        </div>
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 6: Routes**

`app/(admin)/admin/solutions/new/page.tsx`:
```tsx
'use client';

import SolutionForm from '@/app/components/admin/solutions/SolutionForm';

export default function NewSolutionPage() {
  return <SolutionForm />;
}
```

`app/(admin)/admin/solutions/[id]/page.tsx`:
```tsx
'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import SolutionForm from '@/app/components/admin/solutions/SolutionForm';
import { solutionService } from '@/app/lib/api/services/solution.service';
import type { SolutionAdminDetail } from '@/app/lib/api/types';

export default function EditSolutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [solution, setSolution] = useState<SolutionAdminDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    solutionService
      .getAdmin(id)
      .then((data) => active && setSolution(data))
      .catch((err) => active && setError(err?.message || 'Could not load this solution'));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-red-300">
        {error}{' '}
        <Link href="/admin/solutions" prefetch={false} className="font-semibold underline">
          Back to solutions
        </Link>
      </div>
    );
  }
  if (!solution) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }
  return <SolutionForm initial={solution} />;
}
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit` → exit 0. In the browser, on `/admin/solutions/new`:
1. Type the title "Test Draft". The URL becomes `test-draft`. Editing the URL by hand stops the auto-fill.
2. Click **Publish** with no sections → inline "Add at least one service before publishing".
3. Add a section titled "One". Search "gst" → results show category · price. A draft result reads "Draft" and is disabled.
4. Add 2 services and star one. Move a service down, then move the section; the preview updates.
5. Click the sidebar "Dashboard" → the "Discard unsaved changes?" dialog appears. Choose "Keep editing".
6. **Save draft** → toast, back to the list, row shows "Draft · 2 services".
7. Edit it, set the URL to the slug of another solution, and save → inline 409 on the URL field.
8. Delete it with the dialog.

This exercises Review Focus #2 and #5.

- [ ] **Step 8: Checkpoint (no commit)**

---

### Task 7: Seed "Start a Business" + link check (backend)

**Files:**
- Create: `cleartax backend/src/scripts/seedSolutions.ts`, `cleartax backend/scripts/check-solution-links.sh`

**Interfaces:**
- Consumes: `Solution` (Task 2), `Service`; the public API (Task 2) for the link check.

- [ ] **Step 1: Create `src/scripts/seedSolutions.ts`**

```ts
/**
 * Seed the "Start a Business" solution (spec 2026-10-05-solutions-design § Seed).
 * Writes to whatever MONGODB_URI .env points at — currently the PRODUCTION cluster.
 * Touches only the `solutions` collection, one document (slug start-a-business).
 *
 *   npx ts-node src/scripts/seedSolutions.ts --dry-run   # resolve + print, write nothing
 *   npx ts-node src/scripts/seedSolutions.ts             # upsert (idempotent)
 *   npx ts-node src/scripts/seedSolutions.ts --remove    # delete it
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

type SeedItem = [slug: string, popular?: boolean];

const SEED = {
  slug: 'start-a-business',
  title: 'Start a Business',
  subtitle: 'Company, LLP, Proprietorship & more',
  iconName: 'Rocket',
  color: 'blue' as const,
  pageHeading: 'Start Your Business The Right Way',
  pageDescription: 'From idea to incorporation, we make it simple.',
  showOnHome: true,
  order: 0,
  status: 'published' as const,
  sections: [
    {
      title: 'Choose your business structure',
      items: [
        ['private-limited-company-registration', true],
        ['limited-liability-partnership-llp-registration'],
        ['one-person-company-opc-registration'],
        ['partnership-firm-registration'],
        ['sole-proprietorship-registration'],
        ['section-8-company-registration-ngo'],
      ] as SeedItem[],
    },
    {
      title: 'Get the basics in place',
      items: [
        ['company-name-approval'],
        ['digital-signature-certificate-dsc-registration'],
        ['din-application'],
        ['pan'],
        ['tan'],
        ['bank-account-opening'],
      ] as SeedItem[],
    },
    {
      title: 'Register for tax',
      items: [['gst-registration'], ['professional-tax-registration'], ['udyam-msme-registration'], ['import-export-code-iec']] as SeedItem[],
    },
    {
      title: 'Licences & recognition',
      items: [['shops-establishment-registration'], ['trade-licence'], ['startup-india-recognition'], ['dpiit-recognition']] as SeedItem[],
    },
    {
      title: 'Protect your brand',
      items: [['trademark-search'], ['trademark-registration', true]] as SeedItem[],
    },
  ],
};

const PUBLISHED = { $or: [{ status: 'published' }, { status: { $exists: false } }, { status: null }] };

async function main(): Promise<void> {
  const mode = process.argv.includes('--remove') ? 'remove' : process.argv.includes('--dry-run') ? 'dry-run' : 'write';
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to database "${mongoose.connection.name}" on ${mongoose.connection.host} — mode: ${mode}`);

  const { Solution } = await import('../models/Solution.model');
  const { Service } = await import('../models/Service.model');

  if (mode === 'remove') {
    const result = await Solution.deleteOne({ slug: SEED.slug });
    console.log(result.deletedCount ? `Removed "${SEED.slug}".` : `Nothing to remove: "${SEED.slug}" does not exist.`);
    return;
  }

  const slugs = SEED.sections.flatMap((s) => s.items.map(([slug]) => slug));
  const found = await Service.find({ slug: { $in: slugs }, ...PUBLISHED }, '_id slug title price').lean();
  const bySlug = new Map<string, typeof found>();
  for (const doc of found) bySlug.set(doc.slug, [...(bySlug.get(doc.slug) ?? []), doc]);

  const table = slugs.map((slug) => {
    const matches = bySlug.get(slug) ?? [];
    return {
      slug,
      matches: matches.length,
      title: matches[0]?.title ?? '—',
      priceMin: matches[0]?.price?.min ?? '—',
      id: matches.length === 1 ? String(matches[0]._id) : '—',
    };
  });
  console.table(table);

  const problems = table.filter((row) => row.matches !== 1);
  if (problems.length > 0) {
    console.error(
      `Aborting without writing: ${problems.length} slug(s) do not match exactly one published service:\n` +
        problems.map((p) => `  - ${p.slug} (${p.matches} matches)`).join('\n'),
    );
    process.exitCode = 1;
    return;
  }
  console.log(`All ${slugs.length} services resolved.`);
  if (mode === 'dry-run') {
    console.log('Dry run — nothing written.');
    return;
  }

  const doc = {
    ...SEED,
    sections: SEED.sections.map((section) => ({
      title: section.title,
      items: section.items.map(([slug, popular]) => ({ service: bySlug.get(slug)![0]._id, popular: !!popular })),
    })),
  };

  const before = await Solution.findOne({ slug: SEED.slug }).lean();
  const fingerprint = (d: any) =>
    JSON.stringify({
      ...['slug', 'title', 'subtitle', 'iconName', 'color', 'pageHeading', 'pageDescription', 'showOnHome', 'order', 'status'].reduce<
        Record<string, unknown>
      >((acc, key) => ({ ...acc, [key]: d?.[key] }), {}),
      sections: (d?.sections ?? []).map((s: any) => ({ title: s.title, items: s.items.map((i: any) => [String(i.service), !!i.popular]) })),
    });

  if (before && fingerprint(before) === fingerprint(doc)) {
    console.log(`No change: "${SEED.slug}" is already up to date.`);
    return;
  }
  await Solution.findOneAndUpdate({ slug: SEED.slug }, doc, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  console.log(before ? `Updated "${SEED.slug}".` : `Created "${SEED.slug}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
```

- [ ] **Step 2: Dry run**

Run: `npx ts-node src/scripts/seedSolutions.ts --dry-run`
Expected: it prints `Connected to database "cleartax" …`, a 22-row table with `matches = 1` on every row, `All 22 services resolved.` and `Dry run — nothing written.`
**If any row has 0 or more than 1 matches: stop. Show Vikrant the table and ask which published service to use (or whether to drop that row). Do not guess.**

- [ ] **Step 3: Write, then confirm it's idempotent**

Run: `npx ts-node src/scripts/seedSolutions.ts` → `Created "start-a-business".`
Run it again → `No change: "start-a-business" is already up to date.`

- [ ] **Step 4: Create `scripts/check-solution-links.sh`**

```bash
#!/usr/bin/env bash
# Spec B4: every href of a published solution resolves through the SAME API routes its
# (client-rendered) page calls — a frontend HTTP 200 would prove nothing.
#   ./scripts/check-solution-links.sh [slug] [http://localhost:4000/api]
set -uo pipefail
SLUG="${1:-start-a-business}"
API="${2:-http://localhost:4000/api}"

DETAIL="$(curl -s "$API/solutions/$SLUG")"
[ "$(echo "$DETAIL" | jq -r '.success')" = "true" ] || { echo "Solution \"$SLUG\" is not published or does not exist"; exit 1; }

FAIL=0
N=0
while IFS=$'\t' read -r href title; do
  N=$((N + 1))
  IFS='/' read -r _ _ a b c <<< "$href"
  if [ -n "$c" ]; then
    url="$API/services/$a/$b/$c"; want="$c"
  else
    if [ "$(curl -s "$API/services/$a" | jq -r '.category.hasSubcategories // false')" = "true" ]; then
      echo "FAIL $href — /services/$a has subcategories, so a 2-segment URL is a listing, not a service"
      FAIL=$((FAIL + 1)); continue
    fi
    url="$API/services/$a/$b"; want="$b"
  fi
  resp="$(curl -s -w '\n%{http_code}' "$url")"
  code="${resp##*$'\n'}"
  json="${resp%$'\n'*}"
  found="$(echo "$json" | jq -r --arg s "$want" '[.. | objects | .slug? | select(. == $s)] | length > 0' 2>/dev/null)"
  if [ "$code" = "200" ] && [ "$found" = "true" ]; then
    echo "ok   $href"
  else
    echo "FAIL $href (HTTP $code, slug present: ${found:-no}) — $title"
    FAIL=$((FAIL + 1))
  fi
done < <(echo "$DETAIL" | jq -r '.data.sections[].items[] | [.href, .title] | @tsv')

echo
echo "$N link(s), $FAIL failure(s)"
[ "$FAIL" -eq 0 ]
```
Run: `chmod +x scripts/check-solution-links.sh && ./scripts/check-solution-links.sh`
Expected: 22 `ok` lines and `22 link(s), 0 failure(s)`. On a failure, fix `resolveServiceHref` (Task 1): add a failing unit test that reproduces the failing service's category shape first, then fix it and re-run.

- [ ] **Step 5: Checkpoint (no commit)**

`/admin/solutions` now lists "Start a Business · Published · 22 services".

---

### Task 8: Public pure helpers: plan maths, callback message, rail layout (TDD)

**Files:**
- Create: `app/lib/solutions/plan.ts`, `app/lib/solutions/rail.ts`, `tests/solutions-plan.test.ts`, `tests/solutions-rail.test.ts`

**Interfaces:**
- Consumes: `formatINR` (Plan 1, `app/lib/fv/text.ts`).
- Produces:
  - `interface PlanItem { id: string; title: string; price: { min: number } }`
  - `planTotal(items: PlanItem[]): number`
  - `initialSelection(sections: { items: { id: string; popular: boolean }[] }[]): string[]`
  - `buildPlanMessage(solutionTitle: string, items: PlanItem[], max?: number): string`
  - `type RailLayout = 'none' | 'row' | 'grid' | 'scroll'`
  - `railLayout(count: number): RailLayout`

- [ ] **Step 1: Write the failing tests**

`tests/solutions-plan.test.ts`:
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlanMessage, initialSelection, planTotal } from '../app/lib/solutions/plan';

const item = (id: string, title: string, min: number) => ({ id, title, price: { min } });

test('planTotal sums positive starting prices only', () => {
  assert.equal(planTotal([item('a', 'A', 6999), item('b', 'B', 1500), item('c', 'C', 0), item('d', 'D', -5)]), 8499);
  assert.equal(planTotal([]), 0);
});

test('initialSelection pre-ticks popular services in order', () => {
  assert.deepEqual(
    initialSelection([
      { items: [{ id: 'a', popular: true }, { id: 'b', popular: false }] },
      { items: [{ id: 'c', popular: true }] },
    ]),
    ['a', 'c'],
  );
});

test('buildPlanMessage lists services with prices and the total', () => {
  assert.equal(
    buildPlanMessage('Start a Business', [item('a', 'Private Limited Company Registration', 6999), item('b', 'GST Registration', 1500)]),
    'Plan: Start a Business: Private Limited Company Registration (₹6,999), GST Registration (₹1,500). Starting total ₹8,499+',
  );
  assert.equal(buildPlanMessage('X', [item('a', 'Free thing', 0)]), 'Plan: X: Free thing (price on request). Starting total ₹0+');
});

test('buildPlanMessage never exceeds max and summarises the overflow', () => {
  const many = Array.from({ length: 22 }, (_, i) => item(String(i), `Very Long Service Name Number ${i} With Extra Words For Length`, 1000 + i));
  const message = buildPlanMessage('Start a Business', many, 1000);
  assert.ok(message.length <= 1000, `length ${message.length}`);
  assert.match(message, /…and \d+ more\. Starting total ₹22,231\+$/);
  const tiny = buildPlanMessage('Start a Business', many, 120);
  assert.ok(tiny.length <= 120, `length ${tiny.length}`);
});

test('buildPlanMessage with nothing selected', () => {
  assert.equal(buildPlanMessage('X', []), 'Plan: X (no services selected yet).');
});
```
(The total: 22 × 1000 + (0+1+…+21) = 22,000 + 231 = 22,231.)

`tests/solutions-rail.test.ts`:
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { railLayout } from '../app/lib/solutions/rail';

test('railLayout picks a layout for any number of solutions', () => {
  assert.equal(railLayout(0), 'none');
  assert.equal(railLayout(-1), 'none');
  assert.equal(railLayout(1), 'row');
  assert.equal(railLayout(4), 'row');
  assert.equal(railLayout(5), 'grid');
  assert.equal(railLayout(8), 'grid');
  assert.equal(railLayout(9), 'scroll');
});
```
Run: `./scripts/test-pure.sh` → FAIL (modules not found).

- [ ] **Step 2: Implement `app/lib/solutions/plan.ts` and `rail.ts`**

`app/lib/solutions/plan.ts`:
```ts
import { formatINR } from '../fv/text';

export interface PlanItem {
  id: string;
  title: string;
  price: { min: number };
}

export function planTotal(items: PlanItem[]): number {
  return items.reduce((sum, item) => sum + Math.max(0, Number(item.price?.min) || 0), 0);
}

/** Popular services start ticked (spec S4). */
export function initialSelection(sections: { items: { id: string; popular: boolean }[] }[]): string[] {
  return sections.flatMap((section) => section.items.filter((item) => item.popular).map((item) => item.id));
}

/**
 * Callback message for the whole plan. The Inquiry model caps `message` at 1000 chars,
 * so trailing services collapse into "…and N more" until it fits (Review Focus #3).
 */
export function buildPlanMessage(solutionTitle: string, items: PlanItem[], max = 1000): string {
  if (items.length === 0) return `Plan: ${solutionTitle} (no services selected yet).`;
  const head = `Plan: ${solutionTitle}: `;
  const tail = ` Starting total ${formatINR(planTotal(items))}+`;
  const parts = items.map((item) => `${item.title} (${item.price?.min > 0 ? formatINR(item.price.min) : 'price on request'})`);
  for (let shown = parts.length; shown >= 0; shown -= 1) {
    const hidden = parts.length - shown;
    const list = parts.slice(0, shown).join(', ');
    const more = hidden > 0 ? `${shown > 0 ? ', ' : ''}…and ${hidden} more` : '';
    const message = `${head}${list}${more}.${tail}`;
    if (message.length <= max) return message;
  }
  return `${head}${items.length} services.${tail}`.slice(0, max);
}
```

`app/lib/solutions/rail.ts`:
```ts
export type RailLayout = 'none' | 'row' | 'grid' | 'scroll';

/** 1–4 → centred row · 5–8 → equal grid · 9+ → horizontal scroll (spec: Home rail). */
export function railLayout(count: number): RailLayout {
  if (!count || count < 1) return 'none';
  if (count <= 4) return 'row';
  if (count <= 8) return 'grid';
  return 'scroll';
}
```
Run: `./scripts/test-pure.sh` → all pass.

- [ ] **Step 3: Checkpoint (no commit)**

---

### Task 9: Rail on the home hero, Solutions menu, sitemap

> **Amendments A1–A5, A7 (2026-10-07):** `NavSolution.icon` is a ReactNode rendered by the server layout (A2); dropdown max-height (A3); pass `rail` only when there are home solutions (A4); keep public pages static (A5). See "Amendments" at the top.

> **Amendment 2026-10-06 (L3 plan Task 5 revised to design 3 "Icon Rail"):** the home hero is now the centred s3 hero. `HomeHero({ banner, rail })` keeps the `rail?: ReactNode` slot (rendered under the search box, rail card sits on the hero's bottom edge, 8 across ≥1024px, 4×2 on mobile — s3 `.rail/.ri/.rb`). In addition, `app/(site)/page.tsx` must feed `<PopularServices items={…} />` (`app/components/home/PopularServices.tsx`, `PopularServiceItem { id, title, description?, href, iconName?, color: FvColor, price?, duration? }`) with the ★ popular items of all published solutions (deduplicated by service id, in solution order, colour = the solution's colour, href = the item's resolved href). Re-read the revised L3 Task 5 before executing this task; where the code below assumes the old split hero (`cards`, `team` props), follow the revised interfaces.

**Files:**
- Create: `app/lib/solutions/publicApi.ts`, `app/components/solutions/SolutionRail.tsx`
- Modify: `app/(site)/layout.tsx`, `app/(site)/homepage-data.ts`, `app/(site)/page.tsx`, `app/sitemap.ts`

**Interfaces:**
- Consumes: `NavSolution` and `Navigation({ solutions })` (Plan 1 Task 4), `HomeHero({ rail })` (Plan 1 Task 5), `IconTile`, `isFvColor`, `plural`, `railLayout`, `SolutionSummary`, `SolutionDetail`.
- Produces:
  - `fetchPublishedSolutions(homeOnly?: boolean): Promise<SolutionSummary[]>`
  - `fetchSolution(slug: string): Promise<SolutionDetail | null>`
  - `<SolutionRail solutions />` with anchor `id="solutions"` (the solution page breadcrumb links to `/#solutions`)

- [ ] **Step 1: Create `app/lib/solutions/publicApi.ts`**

```ts
import { API_CONFIG } from '@/app/lib/api/config';
import type { SolutionDetail, SolutionSummary } from '@/app/lib/api/types';

const REVALIDATE = 300; // same as the rest of the public site

/** Published solutions for server components. Never throws: a failure renders no rail / no menu. */
export async function fetchPublishedSolutions(homeOnly = false): Promise<SolutionSummary[]> {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/solutions${homeOnly ? '?home=true' : ''}`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

/** One published solution, or null (unknown slug, draft, or API down → the page 404s). */
export async function fetchSolution(slug: string): Promise<SolutionDetail | null> {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/solutions/${encodeURIComponent(slug)}`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Create `app/components/solutions/SolutionRail.tsx`**

```tsx
import Link from 'next/link';
import { clsx } from 'clsx';
import IconTile from '@/app/components/fv/IconTile';
import { isFvColor } from '@/app/lib/fv/colors';
import { plural } from '@/app/lib/fv/text';
import { railLayout } from '@/app/lib/solutions/rail';
import type { SolutionSummary } from '@/app/lib/api/types';

/** App-style solution icons attached to the bottom edge of the home hero (spec S2). */
export default function SolutionRail({ solutions }: { solutions: SolutionSummary[] }) {
  const layout = railLayout(solutions.length);
  if (layout === 'none') return null;

  return (
    <div className="fv-wrap">
      <nav
        id="solutions"
        aria-label="Solutions"
        className="scroll-mt-24 rounded-t-[22px] border border-b-0 border-fv-line bg-white px-3 pb-5 pt-5 shadow-[0_-10px_40px_rgba(30,44,89,.06)] md:px-6 md:pb-6"
      >
        <ul
          className={clsx(
            'flex flex-wrap justify-center gap-x-2 gap-y-4',
            layout === 'row' && 'md:gap-6',
            layout === 'grid' && 'md:grid md:grid-cols-8 md:gap-3',
            layout === 'scroll' && 'md:flex-nowrap md:justify-start md:gap-3 md:overflow-x-auto md:pb-2 md:[scroll-snap-type:x_mandatory]',
          )}
        >
          {solutions.map((solution) => (
            <li
              key={solution.slug}
              className={clsx(
                'w-[calc(25%-0.375rem)] min-w-0',
                layout === 'row' && 'md:w-[128px]',
                layout === 'grid' && 'md:w-auto',
                layout === 'scroll' && 'md:w-[116px] md:flex-none md:[scroll-snap-align:start]',
              )}
            >
              <Link
                href={`/solutions/${solution.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl p-1.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d"
              >
                <IconTile
                  name={solution.iconName}
                  color={isFvColor(solution.color) ? solution.color : 'blue'}
                  size="xl"
                  solid
                  className="transition-transform duration-200 group-hover:-translate-y-1 max-md:!h-14 max-md:!w-14 max-md:[&>svg]:!h-7 max-md:[&>svg]:!w-7"
                />
                <span className="line-clamp-2 text-[13px] font-bold leading-tight text-fv-navy md:text-sm">{solution.title}</span>
                <span className="text-xs text-fv-muted">{plural(solution.serviceCount, 'service')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
```

- [ ] **Step 3: Solutions menu: `app/(site)/layout.tsx`**

Replace the file with:
```tsx
import Navigation, { type NavSolution } from '../components/common/Navigation'
import Footer from '../components/common/Footer'
import { fetchPublishedSolutions } from '../lib/solutions/publicApi'
import { isFvColor } from '../lib/fv/colors'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const solutions = await fetchPublishedSolutions()
  const navSolutions: NavSolution[] = solutions.map((s) => ({
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    iconName: s.iconName,
    color: isFvColor(s.color) ? s.color : 'blue',
  }))

  return (
    <div className="fv-site bg-white">
      <Navigation solutions={navSolutions} />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: Home data + rail: `homepage-data.ts`, `page.tsx`**

In `app/(site)/homepage-data.ts`:
1. Add `import type { SolutionSummary } from '@/app/lib/api/types';`.
2. Add `solutions: SolutionSummary[];` to `interface HomePageData`.
3. Change the destructuring to `const [homeInfoRaw, ipoRaw, legalRaw, bankingRaw, teamRaw, featuredRaw, solutionsRaw] =` and append `serverFetch(`${BASE}/solutions?home=true`),` as the 7th entry of the `Promise.all` array.
4. In the returned object add:
```ts
    solutions: Array.isArray(extractData(solutionsRaw)) ? extractData(solutionsRaw) : [],
```
In `app/(site)/page.tsx`, add `import SolutionRail from '../components/solutions/SolutionRail';` and change the hero line to:
```tsx
      <HomeHero banner={banner} cards={services.cards} team={team} rail={<SolutionRail solutions={data.solutions} />} />
```

- [ ] **Step 5: Sitemap: `app/sitemap.ts`**

Insert this before `return [...staticEntries, ...dynamicEntries]`:
```ts
  // Solutions (published only — the public endpoint never returns drafts).
  try {
    const solutions = asArray(await fetchJson('/solutions'))
    for (const solution of solutions) {
      if (solution?.slug) {
        dynamicEntries.push({
          url: `${SITE_URL}/solutions/${solution.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch {
    // ignore — solutions are optional
  }
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` → exit 0. With both servers running and the seed in place:
- `/` shows one "Start a Business" icon, centred, attached to the bottom of the hero ("22 services").
- The nav has "Solutions ▾" listing it with its subtitle.
- `http://localhost:3000/sitemap.xml` contains `/solutions/start-a-business`.
- In admin, toggle "Home" off. Within the revalidate window (or after restarting `npm run dev`) the rail disappears but the menu keeps the item. Toggle it back on.

- [ ] **Step 7: Checkpoint (no commit)**

---

### Task 10: The solution page

> **Amendments A1, A6, A7 (2026-10-07):** Step 1 is superseded by A6 (modal uses `fv/Select` options + `fv/TextArea`; add `returnFocusRef`); icon names via `IconTileByName`; theme rules apply (see "Amendments" at the top).

**Files:**
- Create: `app/components/solutions/SolutionHero.tsx`, `StepBar.tsx`, `PlanServiceCard.tsx`, `PlanSummary.tsx`, `SolutionPlanner.tsx`, `app/(site)/solutions/[slug]/page.tsx`
- Modify: `app/components/home/RequestCallbackModal.tsx`

**Interfaces:**
- Consumes: Tasks 8–9, `Breadcrumb`, `IconTile`, `fv/Button`, `LIGHT_HERO_BG`, `formatINR`, `formatFromPrice`, `plural`, `splitHeading`, `isFvColor`, `SolutionDetail`, `SolutionServiceItem`.
- Produces: the `/solutions/[slug]` route and `RequestCallbackModal({ open, onClose, prefillNotes?, interestLabel? })`.

- [ ] **Step 1: Extend `RequestCallbackModal` (backwards compatible)**

1. Replace the props type:
```tsx
type RequestCallbackModalProps = {
  open: boolean;
  onClose: () => void;
  /** Prefills "Notes" (e.g. the solution plan summary; ≤1000 chars). */
  prefillNotes?: string;
  /** Adds and preselects an "Interested in" option (e.g. "Start a Business"). */
  interestLabel?: string;
};

const DEFAULT_INTERESTS = ['GST Services', 'Income Tax', 'Business Registration', 'Trademark & IP', 'Other'];
```
2. Change the signature to `export default function RequestCallbackModal({ open, onClose, prefillNotes, interestLabel }: RequestCallbackModalProps) {`.
3. Replace the "Interested in" `<select …>…</select>` with:
```tsx
                  <select
                    name="interest"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                    defaultValue={interestLabel ?? 'GST Services'}
                  >
                    {interestLabel && !DEFAULT_INTERESTS.includes(interestLabel) && <option>{interestLabel}</option>}
                    {DEFAULT_INTERESTS.map((interest) => (
                      <option key={interest}>{interest}</option>
                    ))}
                  </select>
```
4. On the notes `<textarea name="notes" …>`, change `rows={3}` to `rows={prefillNotes ? 5 : 3}` and add `defaultValue={prefillNotes}` and `maxLength={1000}`.

The modal's form fields only mount when `open` becomes true, so `defaultValue` picks up the current plan every time it opens. The submission code is unchanged: `message = notes || "Interested in …"`, `sourcePage = window.location.pathname` (= `/solutions/<slug>`), `type: 'callback'`.

- [ ] **Step 2: `SolutionHero.tsx` (server component)**

```tsx
import Breadcrumb from '@/app/components/common/Breadcrumb';
import IconTile from '@/app/components/fv/IconTile';
import { LIGHT_HERO_BG } from '@/app/components/fv/LightHero';
import { isFvColor } from '@/app/lib/fv/colors';
import { formatINR, splitHeading } from '@/app/lib/fv/text';
import type { SolutionDetail } from '@/app/lib/api/types';

export default function SolutionHero({ solution }: { solution: SolutionDetail }) {
  const color = isFvColor(solution.color) ? solution.color : 'blue';
  const [line1, line2] = splitHeading(solution.pageHeading || solution.title);
  const { serviceCount, startingPrice, sectionCount } = solution.stats;
  const stats = [
    { value: String(serviceCount), label: serviceCount === 1 ? 'service' : 'services' },
    ...(startingPrice > 0 ? [{ value: formatINR(startingPrice), label: 'starting price' }] : []),
    { value: String(sectionCount), label: sectionCount === 1 ? 'step' : 'steps' },
  ];

  return (
    <section className={`border-b border-fv-line ${LIGHT_HERO_BG}`}>
      <div className="fv-wrap py-10 text-center md:py-14">
        <Breadcrumb
          className="mb-6 [&>ol]:justify-center"
          items={[{ label: 'Home', href: '/' }, { label: 'Solutions', href: '/#solutions' }, { label: solution.title }]}
        />
        <IconTile name={solution.iconName} color={color} size="xl" solid className="mx-auto mb-5" />
        <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] text-fv-navy md:text-[50px]">
          {line1}
          {line2 && (
            <>
              <br />
              <span className="text-fv-blue">{line2}</span>
            </>
          )}
        </h1>
        {solution.pageDescription && (
          <p className="mx-auto mt-4 max-w-[620px] text-base leading-relaxed text-fv-slate md:text-lg">{solution.pageDescription}</p>
        )}
        {serviceCount > 0 && (
          <ul className="mx-auto mt-7 flex max-w-[520px] flex-wrap justify-center gap-3">
            {stats.map((stat) => (
              <li key={stat.label} className="fv-card min-w-[112px] px-4 py-3">
                <span className="block text-xl font-extrabold text-fv-navy">{stat.value}</span>
                <span className="block text-xs text-fv-slate">{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `StepBar.tsx`**

```tsx
'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { clsx } from 'clsx';

/** Sticky numbered step chips; highlights the step in view; smooth scroll unless reduced motion. */
export default function StepBar({ steps }: { steps: { id: string; label: string }[] }) {
  const [active, setActive] = useState(steps[0]?.id);
  const ids = steps.map((s) => s.id).join(',');

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
      { rootMargin: '-140px 0px -55% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  const go = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    setActive(id);
  };

  if (steps.length < 2) return null;

  return (
    <nav aria-label="Steps" className="sticky top-[68px] z-30 border-b border-fv-line bg-white/95 backdrop-blur">
      <ol className="fv-wrap flex gap-1 overflow-x-auto py-2">
        {steps.map((step, i) => {
          const on = active === step.id;
          return (
            <li key={step.id} className="flex-none">
              <a
                href={`#${step.id}`}
                onClick={go(step.id)}
                aria-current={on ? 'step' : undefined}
                className={clsx(
                  'flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                  on ? 'bg-fv-blue-50 text-fv-blue-d' : 'text-fv-slate hover:text-fv-navy',
                )}
              >
                <span className={clsx('grid h-6 w-6 place-items-center rounded-full text-xs font-bold', on ? 'bg-fv-blue-d text-white' : 'bg-fv-wash text-fv-navy')}>
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
```

- [ ] **Step 4: `PlanServiceCard.tsx` and `PlanSummary.tsx`**

`app/components/solutions/PlanServiceCard.tsx`: a real checkbox, a whole-card click target, and a title link that keeps working.
```tsx
import Link from 'next/link';
import { Check, Clock, Star } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from '@/app/components/fv/IconTile';
import { formatFromPrice } from '@/app/lib/fv/text';
import type { SolutionServiceItem } from '@/app/lib/api/types';

export default function PlanServiceCard({
  item,
  checked,
  onToggle,
}: {
  item: SolutionServiceItem;
  checked: boolean;
  onToggle: () => void;
}) {
  const price = formatFromPrice(item.price);
  const inputId = `plan-${item.id}`;
  return (
    <div
      className={clsx(
        'fv-card relative flex h-full gap-3 p-4 transition-colors',
        checked ? 'border-fv-blue-d bg-[#F5FAFE] ring-1 ring-fv-blue-d' : 'hover:border-[#CFE2F2]',
      )}
    >
      {item.popular && (
        <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-fv-green-50 px-2 py-0.5 text-[11px] font-bold text-fv-green-d ring-1 ring-[#CBE6C6]">
          <Star className="h-3 w-3 fill-current" aria-hidden="true" />
          Most popular
        </span>
      )}
      <input id={inputId} type="checkbox" checked={checked} onChange={onToggle} className="peer sr-only" />
      <label htmlFor={inputId} className="absolute inset-0 cursor-pointer rounded-[14px]">
        <span className="sr-only">Add {item.title} to your plan</span>
      </label>
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none relative mt-1 grid h-5 w-5 flex-none place-items-center rounded-md border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-fv-blue-d peer-focus-visible:ring-offset-2',
          checked ? 'border-fv-blue-d bg-fv-blue-d text-white' : 'border-[#C5D3E6] bg-white',
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <IconTile name={item.iconName} size="sm" className="pointer-events-none relative" />
      <div className="pointer-events-none relative min-w-0 flex-1">
        <Link
          href={item.href}
          className="pointer-events-auto relative z-10 text-[15px] font-bold leading-snug text-fv-navy hover:text-fv-blue-d hover:underline"
        >
          {item.title}
        </Link>
        {item.shortDescription && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-fv-slate">{item.shortDescription}</p>}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
          <b className="font-extrabold text-fv-navy">{price ? `${price}+` : 'Price on request'}</b>
          {item.duration && (
            <span className="flex items-center gap-1 text-fv-slate">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {item.duration}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
```

`app/components/solutions/PlanSummary.tsx`: a sticky card on desktop and a sticky bottom bar on mobile. The bar sticks inside the planner grid, so it never covers the footer.
```tsx
'use client';

import { useState } from 'react';
import { ChevronUp, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import Button from '@/app/components/fv/Button';
import { formatFromPrice, formatINR, plural } from '@/app/lib/fv/text';
import type { SolutionServiceItem } from '@/app/lib/api/types';

interface PlanSummaryProps {
  items: SolutionServiceItem[];
  total: number;
  onRequest: () => void;
}

export default function PlanSummary({ items, total, onRequest }: PlanSummaryProps) {
  const [open, setOpen] = useState(false);
  const empty = items.length === 0;
  const list = (
    <ul className="max-h-[40vh] space-y-2.5 overflow-y-auto">
      {items.map((item) => (
        <li key={item.id} className="flex justify-between gap-3 text-sm">
          <span className="min-w-0 text-fv-navy">{item.title}</span>
          <b className="whitespace-nowrap text-fv-navy">{formatFromPrice(item.price) ?? '—'}</b>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <aside aria-label="Your plan" className="hidden lg:sticky lg:top-[136px] lg:block">
        <div className="overflow-hidden rounded-[18px] border border-fv-line bg-white shadow-fv-raised">
          <div className="bg-fv-navy px-5 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Your plan</p>
            <p className="mt-1 text-3xl font-extrabold" aria-live="polite">
              {formatINR(total)}+
            </p>
            <p className="text-sm text-white/70">{plural(items.length, 'service')} · starting prices</p>
          </div>
          <div className="space-y-4 p-5">
            {empty ? <p className="text-sm text-fv-slate">Tick the services you need. Your plan adds up here.</p> : list}
            <Button size="lg" className="w-full" disabled={empty} onClick={onRequest}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Request Callback
            </Button>
            <p className="text-center text-xs text-fv-muted">Starting prices; final quote after a quick call.</p>
          </div>
        </div>
      </aside>

      <div className="sticky bottom-0 z-40 -mx-4 border-t border-fv-line bg-white px-4 shadow-[0_-8px_30px_rgba(30,44,89,.12)] sm:-mx-6 sm:px-6 lg:hidden">
        <div id="plan-sheet" hidden={!open || empty} className="border-b border-fv-line py-4">
          {list}
        </div>
        <div className="flex items-center gap-3 py-3">
          <button
            type="button"
            aria-expanded={open && !empty}
            aria-controls="plan-sheet"
            disabled={empty}
            onClick={() => setOpen((value) => !value)}
            className="min-w-0 flex-1 text-left"
          >
            <span className="block text-xs font-bold uppercase tracking-wider text-fv-muted">Your plan · {plural(items.length, 'service')}</span>
            <span className="flex items-center gap-1 text-xl font-extrabold text-fv-navy" aria-live="polite">
              {formatINR(total)}+
              {!empty && <ChevronUp aria-hidden="true" className={clsx('h-4 w-4 transition-transform', !open && 'rotate-180')} />}
            </span>
          </button>
          <Button disabled={empty} onClick={onRequest}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Callback
          </Button>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5: `SolutionPlanner.tsx`**

This includes the empty state (Review Focus #1).
```tsx
'use client';

import { useMemo, useState } from 'react';
import { Phone } from 'lucide-react';
import Button from '@/app/components/fv/Button';
import RequestCallbackModal from '@/app/components/home/RequestCallbackModal';
import StepBar from './StepBar';
import PlanServiceCard from './PlanServiceCard';
import PlanSummary from './PlanSummary';
import { buildPlanMessage, initialSelection, planTotal } from '@/app/lib/solutions/plan';
import type { SolutionDetail } from '@/app/lib/api/types';

export default function SolutionPlanner({ solution }: { solution: SolutionDetail }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelection(solution.sections)));
  const [callbackOpen, setCallbackOpen] = useState(false);
  const allItems = useMemo(() => solution.sections.flatMap((section) => section.items), [solution.sections]);
  const chosen = allItems.filter((item) => selected.has(item.id));
  const total = planTotal(chosen);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const modal = (
    <RequestCallbackModal
      open={callbackOpen}
      onClose={() => setCallbackOpen(false)}
      interestLabel={solution.title}
      prefillNotes={chosen.length > 0 ? buildPlanMessage(solution.title, chosen) : undefined}
    />
  );

  if (solution.sections.length === 0) {
    return (
      <section className="fv-wrap py-14">
        <div className="fv-card mx-auto max-w-[560px] p-8 text-center">
          <h2 className="text-2xl font-extrabold text-fv-navy">Talk to an expert</h2>
          <p className="mt-2 text-fv-slate">We&apos;re updating the services in this plan. Tell us what you need and we&apos;ll call you back.</p>
          <Button size="lg" className="mt-6" onClick={() => setCallbackOpen(true)}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Request Callback
          </Button>
        </div>
        {modal}
      </section>
    );
  }

  const steps = solution.sections.map((section, i) => ({ id: `step-${i + 1}`, label: section.title }));

  return (
    <>
      <StepBar steps={steps} />
      <div className="fv-wrap grid items-start gap-8 pt-10 md:pt-14 lg:grid-cols-[1fr_340px] lg:pb-14">
        <div className="relative min-w-0 lg:pl-14">
          <span aria-hidden="true" className="absolute bottom-6 left-[19px] top-2 hidden border-l-2 border-dashed border-[#CFE2F2] lg:block" />
          <ol className="space-y-12 pb-10">
            {solution.sections.map((section, i) => (
              <li key={`${section.title}-${i}`} id={`step-${i + 1}`} className="relative scroll-mt-36">
                <span
                  aria-hidden="true"
                  className="absolute -left-14 top-0 hidden h-10 w-10 place-items-center rounded-full border-2 border-fv-blue-d bg-white text-[15px] font-extrabold text-fv-blue-d lg:grid"
                >
                  {i + 1}
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-fv-muted">
                  Step {i + 1} of {solution.sections.length}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-fv-navy">{section.title}</h2>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <PlanServiceCard item={item} checked={selected.has(item.id)} onToggle={() => toggle(item.id)} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
        <PlanSummary items={chosen} total={total} onRequest={() => setCallbackOpen(true)} />
      </div>
      {modal}
    </>
  );
}
```

- [ ] **Step 6: The route `app/(site)/solutions/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SolutionHero from '@/app/components/solutions/SolutionHero';
import SolutionPlanner from '@/app/components/solutions/SolutionPlanner';
import { fetchSolution } from '@/app/lib/solutions/publicApi';

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = await fetchSolution(slug);
  if (!solution) return { title: 'Solution not found', robots: { index: false } };
  return {
    title: solution.title,
    description: solution.pageDescription || solution.subtitle || `${solution.title} — expert services by FinVidhi`,
    alternates: { canonical: `/solutions/${solution.slug}` },
  };
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const solution = await fetchSolution(slug);
  if (!solution) notFound();
  return (
    <>
      <SolutionHero solution={solution} />
      <SolutionPlanner solution={solution} />
    </>
  );
}
```

- [ ] **Step 7: Verify**

Run: `./scripts/test-pure.sh && npx tsc --noEmit` → pass, exit 0. On `/solutions/start-a-business`:
- Hero: "Start Your Business" / "The Right Way" (blue), and the stats "22 services · ₹… starting price · 5 steps".
- Private Limited and Trademark Registration start ticked, so the summary shows their total.
- Ticking a card anywhere toggles it. Clicking a title opens the service page (it doesn't toggle).
- The step bar highlights while scrolling. Space toggles a focused checkbox.
- Request Callback opens the modal with "Interested in: Start a Business" and the plan in Notes. Submit it, then confirm in `/admin/inquiries` that the source page is `/solutions/start-a-business` and the message has the plan.
- At 390px the bottom bar shows the total, expands to the list, and doesn't cover the footer at the end of the page.
- `/solutions/does-not-exist` → 404 page.
- Empty state: in admin, create a draft solution whose only service is a draft, publish it, and open its page. It shows "Talk to an expert", and the rail and menu don't list it (Review Focus #1). Then delete it.

- [ ] **Step 8: Checkpoint (no commit)**

---

### Task 11: End-to-end verification sweep

**Files:**
- Create: `cleartax frontend/scripts/check-solution-pages.cjs`

- [ ] **Step 1: Unit tests and types in both repos**

```bash
# frontend
./scripts/test-pure.sh && npx tsc --noEmit
# backend
TS_NODE_TRANSPILE_ONLY=1 node --require ts-node/register --test tests/solution.helpers.test.ts && npx tsc --noEmit
```
Expected: all pass, tsc exit 0 in both.

- [ ] **Step 2: Production builds**

Backend: `npm run build` → exit 0. Frontend (backend running): `npm run build` → exit 0, and the route list includes `/solutions/[slug]`.

- [ ] **Step 3: Backend suites (spec B2–B4)**

```bash
ADMIN_EMAIL='…' ADMIN_PASSWORD='…' ./scripts/smoke-solutions.sh     # failed: 0
npx ts-node src/scripts/seedSolutions.ts --dry-run                  # 22/22, nothing written
npx ts-node src/scripts/seedSolutions.ts                            # No change
./scripts/check-solution-links.sh                                   # 22 link(s), 0 failure(s)
```

- [ ] **Step 4: Rendered service pages for 3 seeded links**

Create `cleartax frontend/scripts/check-solution-pages.cjs`:
```js
#!/usr/bin/env node
/** Spec B4 (rendered half): open the first N service links of a solution and assert the service title is in an <h1>. */
const os = require('os');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || path.join(os.homedir(), '.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core'));

const SITE = process.argv[2] || 'http://localhost:3000';
const API = process.argv[3] || 'http://localhost:4000/api';
const SLUG = process.argv[4] || 'start-a-business';
const COUNT = Number(process.env.COUNT || 3);

(async () => {
  const detail = await (await fetch(`${API}/solutions/${SLUG}`)).json();
  const items = (detail?.data?.sections || []).flatMap((s) => s.items).slice(0, COUNT);
  if (!items.length) throw new Error(`No items for ${SLUG}`);
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  let failures = 0;
  for (const item of items) {
    const page = await browser.newPage();
    await page.goto(SITE + item.href, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {});
    const h1 = ((await page.textContent('h1').catch(() => '')) || '').trim();
    const ok = h1.toLowerCase().includes(item.title.toLowerCase());
    if (!ok) failures += 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${item.href}  h1="${h1}"`);
    await page.close();
  }
  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
```
Run (frontend on :3000 via `npm run start`): `node scripts/check-solution-pages.cjs` → 3 × `ok`.

- [ ] **Step 5: Overflow and screenshots (spec B5)**

Run: `AUDIT_ROUTES="/,/solutions/start-a-business" node scripts/fv-audit.cjs http://localhost:3000` → all `ok`.
For the 8-solution rail: in admin, temporarily create 7 published `zz-smoke-rail-1..7` solutions (each with one published service), re-run `AUDIT_ROUTES="/" node scripts/fv-audit.cjs`, check the grid layout in `.audit/home-1440.png` and `.audit/home-390.png`, then delete the 7 temporary solutions in admin.
Admin pages are behind login, so check `/admin/solutions` and the editor manually at 1440 and 820 with DevTools device mode.

- [ ] **Step 6: Manual admin pass (spec B6)**

On "Start a Business" (or a new test solution):
1. Edit a section title and save → the public page shows it after revalidate (or a dev restart).
2. Reorder solutions with ↑ / ↓.
3. Toggle Home off and back on.
4. Unpublish ("Unpublish & save draft") → `/solutions/start-a-business` is 404, the rail and menu drop it. Re-publish it.
5. Create a throwaway solution and delete it with the dialog.

- [ ] **Step 7: Production-data hygiene**

Run:
```bash
TOKEN="$(curl -s -X POST http://localhost:4000/api/auth/login -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.data.accessToken')"
curl -s "http://localhost:4000/api/solutions/admin/all" -H "Authorization: Bearer $TOKEN" | jq -r '.data[].slug'
```
Expected: exactly `start-a-business` (no `zz-smoke-*` leftovers).

- [ ] **Step 8: Hand-off checkpoint (no commit)**

Show Vikrant, at 1440 and 390:
- the home page with the rail;
- `/solutions/start-a-business`, including the plan bar and the callback modal with the prefilled plan;
- `/admin/solutions` and the editor;
- the inquiry that arrived from the solution page.

Give him `git status` for both repos. **Do not commit or push.** Wait for his local review.
