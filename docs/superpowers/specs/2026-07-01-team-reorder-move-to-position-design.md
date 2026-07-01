# Design: Team Reorder — Move-to-Position (no duplicate indexes)

**Date:** 2026-07-01
**Status:** Implemented
**Repos:** `cleartax-frontend`, `cleartax-backend`

## Problem

Display order was a free-typed number, so two members could share the same index
(duplicates) and gaps could appear. Ordering should always be a clean, unique
`1..N` sequence.

## Solution — move-to-position + shift, auto-saved

**Backend (new endpoint):**
- `PUT /api/team/reorder` (admin), body `{ orderedIds: string[] }` — full list of
  member ids in the desired order.
- `reorderTeamMembers` sets `displayOrder = index + 1` for each via `bulkWrite`,
  guaranteeing a unique, gapless `1..N`. Returns the updated list.
- Route declared **before** `/:id` so `reorder` isn't parsed as an id.
- Validation: `orderedIds` non-empty array of strings.

**Frontend (admin team page):**
- Each card shows the `#N` badge + a **"Move to #k" dropdown (1..N)**. Selecting a
  position removes the member and re-inserts them there, renumbers `1..N`
  optimistically, then calls `teamService.reorder(orderedIds)` — **auto-saves**,
  toast on success, reverts on failure.
- The free "Display Order" number input was **removed** from the add/edit modal.
- New members are **appended at the end** (`displayOrder = max + 1`); the edit form
  no longer sends `displayOrder` (ordering is owned by the reorder endpoint).

**Frontend (public `/team`):** unchanged — already sorts by `displayOrder`.

## Verified

- API: moving a member renumbers to `[1,2,3,4,5]`, unique & gapless.
- UI: moving the last member to #1 shifted everyone down by one; badges stayed
  unique `1..N`; auto-saved and persisted.

## Scope guardrails

- Reorder works on the full list (not affected by the search box).
- Dropdown only (no drag-and-drop).
