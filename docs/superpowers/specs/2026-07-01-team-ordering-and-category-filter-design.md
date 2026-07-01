# Design: Team Display-Ordering + Client-Side Category Filter

**Date:** 2026-07-01
**Status:** Approved
**Repos:** `cleartax-frontend`, `cleartax-backend`

## Feature 1 — Admin-controlled display ordering

- **Model:** add `displayOrder: number` (default `0`) to the `Team` schema.
- **Sort:** `team.service.ts` sorts `{ displayOrder: 1, createdAt: -1 }` — ascending
  by order, newest-first as tiebreaker. Public `/team`, home `TeamSection`, and the
  admin list all inherit this server-side order.
- **Admin (`admin/team/page.tsx`):**
  - "Display Order" number input in the add + edit forms (wired into FormData and
    JSON submit paths).
  - A visible `#N` badge on each admin team card showing the member's `displayOrder`.
  - Admin list sorted by `displayOrder` so the admin view matches the live order.
- **Types/validation:** `displayOrder` (optional number, min 0) added to backend
  `team.types.ts` + `team.validations.ts`, and frontend `TeamMember` +
  `CreateTeamMemberDto`.

## Feature 2 — Client-side category filter (uses `role`)

- **Public `/team` page only** (`app/(site)/team/page.tsx`):
  - Derive distinct `role` values from the fetched members.
  - Dropdown: `All categories` + each distinct role.
  - Filtering is 100% client-side over the already-fetched, already-ordered list.
    No backend call, no model change.
  - Empty-state message when a filtered category has no members.

## Interaction

Server returns members pre-sorted by `displayOrder`; the client-side role filter
narrows that list, so members stay in the chosen order within any category.

## Scope guardrails (YAGNI)

- No drag-and-drop (number field only).
- No new category taxonomy — filter built from existing `role` values.
- Filter only on the `/team` listing page (not the home section).

## Backward compatibility

`displayOrder` is optional with default `0`; existing members (no field) sort as
`0` and keep their `createdAt` order until the admin assigns numbers.

## Verification

- Backend `tsc` + a GET `/team` returns members sorted by `displayOrder`.
- Admin: set orders, see `#N` badges, save persists, list re-sorts.
- Public `/team`: dropdown lists distinct roles; selecting one filters the grid;
  order preserved; "All" restores full list.
