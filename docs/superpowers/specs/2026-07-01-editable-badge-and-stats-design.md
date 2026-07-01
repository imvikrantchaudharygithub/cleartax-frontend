# Design: Editable Hero Badge + Stats Grid (Admin → Home Info)

**Date:** 2026-07-01
**Status:** Approved
**Repos:** `cleartax-frontend` (primary + admin), `cleartax-backend`

## Problem

Two pieces of the home page are hardcoded and cannot be edited from the admin panel:

1. **Hero badge** — the pill `Trusted by 50,000+ Businesses` is literal text in
   `HeroSection.tsx` (~line 131), not bound to `bannerData`.
2. **Stats grid** — the four cards (Invoices Processed / Businesses Trusted /
   Trade Value / Returns Filed) live in a hardcoded `stats` array in
   `StatsSection.tsx`, which does not read `HomeInfo` at all. Its
   `CounterAnimation` division math (`value / 1000000`) also renders the buggy
   **"0M+"** currently visible on the site.

Both should be editable from **Admin → Home Info**, using the same pattern the
`banner` / `benefits` / `services` sections already use.

## Goals

- Admin can edit the hero badge text.
- Admin can edit the four stat cards: number, prefix, suffix, label, and icon.
- Fix the "0M+" rendering as a side effect (no more auto-format division).
- Keep the count-up animation.
- Backward compatible: the existing single `HomeInfo` document (which has no
  `badge`/`stats` yet) and any in-flight clients keep working via defaults.

## Non-goals (YAGNI)

- No add/remove of stat cards — exactly 4.
- No per-stat color picker — keep the existing gradient cycling.
- Badge stays plain text — no icon/color options for it.

## Data model additions (both OPTIONAL for backward-compat)

### `banner.badge: string`
- Default when absent: `"Trusted by 50,000+ Businesses"`.

### `stats` section
```ts
stats?: {
  items: Array<{
    value: number;      // e.g. 10
    prefix?: string;    // e.g. "₹"
    suffix?: string;    // e.g. "M+", "Cr+", "K+"
    label: string;      // e.g. "Invoices Processed"
    icon: StatIcon;     // enum, see below
  }>; // exactly 4 items
}
```

`StatIcon` enum (fixed set, admin picks from a dropdown):
`'FileText' | 'Users' | 'TrendingUp' | 'FileCheck' | 'Award' | 'Building2' | 'Receipt' | 'Calculator'`

Default when absent (preserves current look):
1. value 10, suffix `M+`, label `Invoices Processed`, icon `FileText`
2. value 50, suffix `K+`, label `Businesses Trusted`, icon `Users`
3. value 27, prefix `₹`, suffix `Cr+`, label `Trade Value`, icon `TrendingUp`
4. value 15, suffix `L+`, label `Returns Filed`, icon `FileCheck`

## Layers touched

| Layer | File | Change |
|---|---|---|
| Backend model | `backend/src/models/HomeInfo.model.ts` | Add `badge?` to `IBanner` + schema; add `IStatItem`, `IStats`; add `stats?` to `IHomeInfo` + schema (items length-4 validator, all optional at doc level) |
| Backend validation | `backend/src/validations/homeInfo.validations.ts` | `badge: z.string().max(100).optional()` on `bannerSchema`; new `statItemSchema` + `statsSchema` (`items` length 4); add `stats: statsSchema.optional()` to `homeInfoSchema.body` |
| Backend controller | `backend/src/controllers/homeInfo.controller.ts` | Add `if (body.stats) homeInfoSchema.shape.body.shape.stats... .parse(body.stats)` alongside the existing per-section validation |
| Backend service | `backend/src/services/homeInfo.service.ts` | Merge-save `data.stats` (`homeInfo.stats = { ...existing, ...data.stats }`) like `benefits`/`services` |
| Shared type | `frontend/app/lib/api/types.ts` | Add `badge?: string` to `banner`; add `stats?` block to `HomeInfo` |
| Hero | `frontend/app/components/home/HeroSection.tsx` | Add `badge` to `defaultBanner`; render `{bannerData.badge ?? default}` instead of literal text |
| Stats | `frontend/app/components/home/StatsSection.tsx` | Accept `statsData?: HomeInfo['stats']` prop + client-fetch fallback (mirror `BenefitsSection`); icon-name→component map; `CounterAnimation end={value}` with `prefix`/`suffix`; remove `/1000000` math; keep default array as fallback |
| Home page | `frontend/app/(site)/page.tsx` | Pass `statsData={homeInfo?.stats}` into `<StatsSection>` (badge already flows via existing `bannerData`) |
| Admin form | `frontend/app/(admin)/admin/home-info/page.tsx` | Add badge `<input>` to the Banner section; add a collapsible **Stats** section with 4 cards (value/prefix/suffix/label/icon dropdown); extend `expandedSections`, add `handleStatChange`, validation, and include `stats[...]` + `banner[badge]` in both JSON and FormData submit paths; hydrate defaults on load when GET lacks these fields |
| Counter (true 0M+ cause) | `frontend/app/components/animations/CounterAnimation.tsx` | **The actual cause of "0M+" — not the division math.** `onEnter: () => setHasAnimated(true)` forced a React re-render whose effect-cleanup killed the count-up tween right after it started, freezing the number near 0. Fix: remove the `hasAnimated` state and rely on ScrollTrigger `once: true`. Fixes counters everywhere `CounterAnimation` is used. |

> **Implementation note (discovered during build):** the "0M+" the user reported
> was primarily this `CounterAnimation` re-render/kill bug, not the `/1000000`
> formatting. Both are addressed; the counter fix is the decisive one.

## Data flow & fallbacks

`GET /api/home-info` → home page passes `banner` (incl. `badge`) and `stats` to
components. When `badge`/`stats` are absent (existing doc before first save), the
components fall back to built-in defaults — nothing breaks. Admin edit →
`PUT /api/home-info` (existing partial section-merge) → persisted → live on next load.

No migration script needed; the first admin save writes the fields.

## Error handling

- Zod validates a section only when present; new fields are optional → safe partial updates.
- `StatsSection` wraps its client fetch in try/catch and falls back to defaults
  (same as `BenefitsSection`).
- Admin validation: exactly 4 stats, each with a non-empty label and a numeric value.

## Verification

1. **Backend:** `npx tsc --noEmit` + `npm run build`; PUT `/api/home-info` with
   `banner.badge` and a `stats.items[4]`, then GET returns them.
2. **Frontend/admin:** log in → Home Info → edit badge + one stat value → save →
   reload home page → confirm the hero badge and stat card reflect the change,
   the count-up runs, and "0M+" is gone. Browser-verify computed text.
3. No new console errors.

## Rollout

Both repos push to `main` (per prior session convention). Server already has the
working DB creds after the previous fix; deploy = `git pull` + rebuild + restart.
No env changes required for this feature.
