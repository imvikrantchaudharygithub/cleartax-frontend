# Design: Admin Services Search & Filter

**Date:** 2026-08-27
**Status:** Approved — revised 2026-08-27 after implementation feedback
**Scope:** Frontend only (`cleartax frontend`) — no backend change

> **Revision (2026-08-27):** two constraints added by request after initial approval.
> **(1) Purely additive** — no existing code, UI, or route is removed or rewritten. The static
> tile grid on `/admin/services` stays exactly as it is; the global list is added above it.
> **(2) Scope narrowed to search + filter.** Bulk publish/unpublish is deferred, so
> `runBulkAction.ts` is not built in this pass. Everything about it below is retained as the
> agreed design for when it is picked up.

## Purpose

The admin now holds ~450 services across 11 categories. Today there is no way to find one
without already knowing its category: `/admin/services` is a static tile grid, and all real
work happens in `/admin/services/[category]`, which renders every service in that category as
an unfiltered card grid.

Two jobs need to work:

1. **Find one service to edit** — "the GST annual return one" — in a couple of keystrokes,
   without knowing which category it lives in.
2. **Work the draft backlog** — ~439 services are unpublished drafts from the 2026-08-27 bulk
   import; reviewing and publishing them in batches must be possible.

This builds a global, searchable, filterable services list at `/admin/services`, and reuses the
same filter logic on the existing per-category page.

## Approach

Client-side filtering over a single full fetch. All ~450 services are pulled once, held in
memory, and filtered/sorted/searched with pure functions. No backend change.

Chosen over server-side filtering deliberately: zero keystroke latency, and bulk-select across
the entire result set is trivial because every row is already in memory. The accepted cost is a
~1.5MB initial fetch (measured: the 11 source content files total 821KB across ~450 services,
≈1.8KB of body content each, before the API adds category info and Mongo metadata).

### Known limitations accepted with this approach

These are consequences of choosing the no-backend-change path. They are recorded so the next
person does not mistake them for oversights.

| Limitation | Consequence | Trigger to revisit |
|---|---|---|
| ~1.5MB fetch per cold admin load | 1–3s initial wait | If it becomes noticeable on real connections |
| Hardcoded server ceiling of 1000 services | Silent truncation past 1000 | Tripwire banner ships in this work (see below) |
| `GET /services` `$or` bug left unfixed | Endpoint unusable for filtered queries | Only if something starts calling it with filters |
| Drafts publicly readable | Unpublished content is exposed | **Security — tracked separately, see below** |

## Two backend facts this design depends on

Both are non-obvious and both would break this silently if violated.

### 1. Never send `page` or `limit`

`src/services/service.service.ts:381-386`:

```js
const usePagination = query.page !== undefined || query.limit !== undefined;
const limit = usePagination
  ? Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)  // MAX_LIMIT = 100
  : 1000;
```

`PAGINATION.MAX_LIMIT` is **100** (`src/config/constants.ts:5`). Passing `?limit=1000` clamps to
100 — you get 100 of 450 services and the UI looks like it is working. Omitting both params
flips `usePagination` false and takes the unclamped `1000` branch.

**The correct call is `GET /services?includeDrafts=true` with no other params.**

This must carry an explanatory comment at the call site. It is precisely the kind of thing a
later cleanup "tidies up" by adding an explicit limit.

To make that guarantee testable without mocking `fetch`, `useServiceIndex.ts` exports the URL
construction as a pure function:

```ts
export function buildIndexUrl(baseUrl: string): string   // no page, no limit — see above
```

### 2. The `$or` bug is sidestepped, not fixed

`src/services/service.service.ts:479-497` pushes category clauses, search clauses, and status
clauses into a single `$or` array, so filters OR together instead of AND-ing. `?category=gst&includeDrafts=false`
returns every published service in the database.

This design never triggers it: with `includeDrafts=true` and no `category` or `search` params,
the filter object is `{}` and the broken branch never runs. All filtering happens client-side.

The bug is left in place. It has **no in-repo consumers** — `serviceService.getAll` appears only
in `app/lib/api/README.md:97` and `app/lib/api/INTEGRATION_GUIDE.md:61`, never in application
code. Do not build anything new on that endpoint's filter params without fixing it first.

## What gets built

Five new files, two edits.

| File | |
|---|---|
| `app/lib/admin/useServiceIndex.ts` | new — the only file that touches the network |
| `app/lib/admin/serviceFilters.ts` | new — pure filter/sort logic |
| `app/components/admin/ServiceToolbar.tsx` | new — search + chips + dropdowns |
| `app/components/admin/ServiceRow.tsx` | new — dense row |
| `app/(admin)/admin/services/page.tsx` | **add** global list above the existing tiles; tiles untouched |
| `app/(admin)/admin/services/[category]/page.tsx` | **add** toolbar + filtering; nothing removed |
| ~~`app/lib/admin/runBulkAction.ts`~~ | deferred — see revision note |

### 1. `app/lib/admin/useServiceIndex.ts` (new)

The **only** file in this feature that touches the network. Isolating it is deliberate: moving
to a server-side or projected-payload approach later should change this file and nothing else.

- Fetches `GET ${API_CONFIG.BASE_URL}/services?includeDrafts=true`, `cache: 'no-store'`
- Normalizes each service into a flat `ServiceRow`:

  ```ts
  type ServiceRow = {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    status: 'draft' | 'published';
    categorySlug: string;
    categoryTitle: string;
    createdAt: string;
    updatedAt: string;
    raw: Service;   // full object, so the edit modal opens with no extra request
  };
  ```

  Sources: the flat transform at `src/services/service.service.ts:556-575` returns `status`,
  `createdAt`, `updatedAt`; `categoryInfo` (`:576-600`) resolves `_id`/`id`/`slug`/`title`.
  Services with an unresolvable category get `categorySlug: 'uncategorized'` and are shown, not
  dropped — with 450 bulk-imported records, silently hiding rows is the worse failure.

- Module-scope cache so moving between admin pages does not refetch
- Exports `invalidate()` and `patchRows(ids, changes)` for post-mutation updates
- **Tripwire:** if the response length is ≥ 1000, expose `truncated: true`; the page renders a
  visible banner. Fails loudly rather than silently showing a partial list.

### 2. `app/lib/admin/serviceFilters.ts` (new)

Pure functions. No React, no fetch, no DOM. This is where the logic worth testing lives.

```ts
type FilterState = {
  q: string;
  status: 'all' | 'draft' | 'published';
  category: string;              // slug, or 'all'
  sort: 'updated' | 'created' | 'title' | 'category';
};

applyFilters(rows: ServiceRow[], state: FilterState): ServiceRow[]
```

**Search** matches `title`, `shortDescription`, `categoryTitle`, `slug`. Deliberately **not**
`longDescription` — every GST service mentions "GST" in its body, which drowns the signal.

- Case-insensitive, whitespace-normalized
- Multi-token **AND**: `gst annual` matches a title containing both, in any order
- Ranked: title-prefix → title-contains → description-contains. Ranking is what makes this
  usable; an unranked `.includes('gst')` returns ~50 rows in arbitrary order.
- No fuzzy/typo matching — at this scale it adds confusion, not recall

**Filters AND together.** A row must satisfy status *and* category *and* search. Stated
explicitly because the backend gets exactly this wrong.

**Sort:** `updated` (default) → `created` → `title` A→Z → `category` then title. Ties break on
title so ordering is stable across renders.

`updatedAt` is the default rather than `createdAt` because all ~439 imported drafts were created
within roughly one hour on 2026-08-27 — `createdAt` sorting produces one flat, arbitrarily
ordered block. `updatedAt` floats actual work to the top and sinks the untouched import.

### 3. `app/lib/admin/runBulkAction.ts` (new)

Pure async function. No React, no direct API coupling — the caller passes the per-id action in.

```ts
runBulkAction(
  ids: string[],
  action: (id: string) => Promise<void>,
  opts: { concurrency: number; signal: AbortSignal; onProgress: (done: number) => void },
): Promise<{ succeeded: string[]; failed: { id: string; message: string }[] }>
```

Holds the three things that must not be reimplemented inline: the concurrency cap, the 429
backoff, and partial-failure accounting. See the bulk-actions subsection under
`/admin/services/page.tsx` for the constraints it enforces.

### 4. `app/components/admin/ServiceToolbar.tsx` (new)

Presentational. Props in, callbacks out, no data fetching.

- Search input, `⌘K` or `/` to focus, `Esc` to clear
- Status chips with counts computed from the loaded rows, e.g. `All 497` · `Drafts 439` ·
  `Live 58`
- Category dropdown, single-select, "All categories" default (multi-select is a contained
  change later if wanted)
- Sort dropdown
- Result count and `Clear all` when any filter is active

Reused verbatim on both pages so behavior cannot drift between them.

### 5. `app/components/admin/ServiceRow.tsx` (new)

Dense row: title, category badge, status pill, relative `updatedAt`, and per-row publish /
unpublish / edit / delete actions matching `ServiceCard`'s existing semantics.

A row, not a card — the existing 3-across card grid is unusable at 450 items. `ServiceCard`
stays as-is for the category page.

450 rendered rows is fine without virtualization. No `react-window`.

### 6. `app/(admin)/admin/services/page.tsx` (rewrite)

**Additive.** The existing hardcoded 7-tile array and its section stay exactly as written. The
global search list is inserted **above** them, under a "Find a service" heading; the tiles remain
below as category shortcuts.

(Note for later, not acted on: the tile array lists 7 categories while `AdminSidebar` lists 11,
so it is already stale. Left alone under the no-deletion constraint.)

- `useServiceIndex()` → `useMemo(() => applyFilters(rows, state), [rows, state])`
- Filter state synced to the URL (`?q=&status=&category=&sort=`), so a filtered view is
  shareable and the back button behaves
- Keyboard: `↑`/`↓` move the row cursor, `Enter` opens the edit modal for the cursored row
- Row click / `Enter` opens the existing `AddServiceModal` in edit mode using `row.raw`

**Bulk actions — DEFERRED, not built in this pass.** Retained below as the agreed design.

Select-all selects every row matching the current filter, not just what is
visible — there is no pagination, everything is in memory.

Ships **bulk publish** and **bulk unpublish**. **Bulk delete is deliberately omitted**: deleting
439 services on a misclick is irreversible, and the per-row delete with its existing confirm
dialog covers the real need.

The rate limiter is the governing constraint. `apiRateLimiter` allows **300 requests per
15-minute window per IP** (`src/config/constants.ts:73-76`, applied to all API routes) — the
same limit that 429'd the populate script during the bulk import.

- Concurrency 3. Never fan out.
- On 429, read the `RateLimit-Reset` header (`standardHeaders: true` is set) and wait, rather
  than retrying immediately.
- Progress with cancel: `Publishing 47 of 120…`
- If a selection exceeds 250, warn **before starting** that it will not fit in one window
- **Partial failure is the normal path, not the edge case.** `publishServiceDraft` validates
  required fields server-side and rejects incomplete drafts; many of the 439 imported drafts
  will fail. Summary toast `Published 9 of 12 · 3 failed validation`; failures stay selected
  with the server's message shown inline on their row.

**States:**
- Loading → skeleton rows, not a centered spinner (a ~1.5MB fetch is a real 1–3s wait)
- Error → inline retry, toolbar stays interactive
- No matches → `Clear filters` button
- Genuinely zero services → keep the existing `/admin/migrate` hint

**After mutations**, `patchRows()` updates affected rows in the cached array. No refetch —
re-pulling 1.5MB after each publish would make the tool slower than it is today. Full refetch
only on explicit Refresh.

### 7. `app/(admin)/admin/services/[category]/page.tsx` (edit)

Keeps its own `/services/:category` fetch — it needs full service objects for the edit modal
plus category hero/stats that the flat endpoint does not return. It does **not** use
`useServiceIndex`.

What is shared is `serviceFilters.ts`, applied to its already-in-memory list. Sharing the pure
functions rather than the fetching is what keeps behavior identical without coupling the pages.

- Mount `<ServiceToolbar />` above the category sections
- `convertApiCategoryToDisplay` (`:44`) currently drops `createdAt` and `updatedAt` — add them
  to the mapped object so sort works here too
- `ServiceCategorySection` takes the filtered list

## Testing

The frontend has no test framework today — no Jest, no Vitest, no test files, and `package.json`
carries only `dev`/`build`/`start`/`lint`.

Add **Vitest scoped to the pure modules only** — `serviceFilters.ts`, `buildIndexUrl`, and the
bulk runner. None of them touch React, so this needs no component-testing infrastructure, no
jsdom, and no React Testing Library. Six tests:

1. **Filters AND together** — `status=draft` + `category=gst` returns only GST drafts, and
   nothing published, and nothing from another category. This is the client-side mirror of the
   bug the backend has; pin it so it is not reinvented.
2. **Search ranking** — a title match sorts above a description match for the same query.
3. **Multi-token AND** — `gst annual` matches "GSTR-9 Annual Return", does not match a service
   matching only one token.
4. **Sort stability** — equal `updatedAt` values break on title, deterministically.
5. **`buildIndexUrl` carries no `limit` and no `page`** — the regression guard for the 100-clamp
   landmine. Pure string assertion, no mocking.
6. **Bulk partial failure** — 3 of 12 reject; summary counts are correct and the 3 failures
   remain selected.

Test 6 is why `runBulkAction` (§3) is extracted rather than written inline in the page
component. That extraction is required, not optional — the concurrency limit, the 429 backoff,
and the partial-failure accounting all live there, and all three are worth pinning.

## Explicitly out of scope

- **No backend change of any kind.** No `$or` fix, no new endpoint, no projection.
- No fuzzy/typo-tolerant search.
- No bulk delete.
- No virtualized list.
- No multi-select category filter.
- No saved/named filter views.
- No component-level test infrastructure — Vitest covers the pure modules only.

## Tracked separately — security

`GET /services?includeDrafts=true` and `GET /services/drafts` have **no `authenticate`
middleware** (`src/routes/service.routes.ts:25-27`). All ~439 unpublished drafts are readable by
anyone without credentials.

This is pre-existing and independent of this work — but this feature reads that endpoint, and
the exposure should not be discovered later and assumed to have been introduced here. It needs
its own fix: add `authenticate` + `authorize('admin')` to both routes, and gate `includeDrafts`
so the public path cannot request drafts at all. Not included here because this design is
frontend-only by decision.
