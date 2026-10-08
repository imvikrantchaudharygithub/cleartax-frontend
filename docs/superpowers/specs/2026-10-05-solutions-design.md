# Design: Admin-Managed Solutions ("Start a Business")

**Date:** 2026-10-05
**Status:** Approved in brainstorming. Written spec awaiting review.
**Scope:** Both repos.
- Backend (`cleartax backend`): new `Solution` resource and a seed script.
- Frontend (`cleartax frontend`): admin page, home rail, nav dropdown, `/solutions/[slug]` page.

**Depends on:** `2026-10-05-l3-site-redesign-design.md` (Spec 1). It uses the `fv` tokens,
the `fv/` primitives, the home hero's rail slot and the nav's `solutions` prop.

## Purpose

Visitors think in goals ("I want to start a business"), not in our category tree.
A **solution** is an admin-curated shortcut. It has a title, an icon, a colour and services
picked from the existing catalogue, grouped into numbered steps.

- It appears as an app-style icon in a rail attached to the home hero.
- It has its own page where visitors tick the services they need, see a live total of
  starting prices, and send one callback request for the whole plan.

**Visual reference:** variant **3 "Icon Rail"** in
`/Users/vikrantchaudhary/Desktop/cleartax/ui-variants/home-solution-cards-variants.html`
(`#s3` home, `#s3/start-a-business` solution page). The admin form follows the dark mock in the
same file's "How it works" tab (`#x`), with the exceptions listed under Admin.

Success means:

1. An admin can create, edit, reorder, hide or publish, and delete solutions without a deploy.
2. A price or title change on a service shows up on every solution page with no second edit.
   Solutions store references, never copies.
3. Drafts and unpublished services are never served publicly.
4. One published "Start a Business" solution exists after seeding and renders correctly at all
   audited widths.

## Decisions (from brainstorming, 2026-10-05)

| # | Decision |
|---|---|
| S1 | New `Solution` collection that references services by ObjectId, with sections and per-item "popular". Not stored in `HomeInfo`, and not done by tagging services. |
| S2 | Home rail sits on the bottom edge of the L3 hero (Spec 1 D1) and adapts to any number of solutions. |
| S3 | Nav gets a **Solutions ▾** dropdown, shown only when at least one solution is published. |
| S4 | Plan builder: popular services start ticked. One callback is sent through the existing inquiry flow. **No backend change for callbacks.** |
| S5 | Seed = **only "Start a Business"**, published, built from real published services. The local backend `.env` points at the **production** Atlas cluster, so this is real production data. It is invisible on finvidhi.com until the new frontend is deployed. |
| S6 | Dropped from the mock (YAGNI): hero image upload and the "looks like a duplicate" hint |
| S7 | Build order: backend → admin → seed → public UI (rail, nav, page) |

## Backend (`cleartax backend`)

### Files (mirror the testimonial resource)

`src/models/Solution.model.ts` · `src/validations/solution.validations.ts` ·
`src/services/solution.service.ts` · `src/controllers/solution.controller.ts` ·
`src/routes/solution.routes.ts` (mounted at `router.use('/solutions', …)` in `routes/index.ts`) ·
`src/types/solution.types.ts` · `src/scripts/seedSolutions.ts` · `scripts/smoke-solutions.sh`

### Model

```ts
SolutionItem    { service: ObjectId (ref 'Service', required), popular: boolean = false }   // _id: false
SolutionSection { title: string (2–80, trimmed), items: SolutionItem[] (0–40) }             // _id: false; empty allowed while drafting, dropped publicly
Solution {
  slug: string            // required, unique, lowercase, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, ≤ 80
  title: string           // 2–60
  subtitle: string        // ≤ 120, default ''
  iconName: string        // ≤ 50, lucide name; rendered through the existing blocklist guard
  color: 'blue'|'purple'|'green'|'orange'|'red'|'teal'|'yellow'|'pink'   // default 'blue'
  pageHeading: string     // ≤ 120, default ''  → falls back to title when empty
  pageDescription: string // ≤ 300, default ''
  sections: SolutionSection[]   // 0–10; publishing requires ≥1 item across all sections
  showOnHome: boolean     // default true
  order: number           // default 0
  status: 'draft'|'published'   // default 'draft'
  timestamps
}
indexes: { slug: 1 } unique · { status: 1, showOnHome: 1, order: 1 }
```

### Routes

Admin routes are registered **before** `/:slug`.

| Method & path | Middleware | Behaviour |
|---|---|---|
| `GET /solutions` | `publicCache` | Published only, sorted `order` asc then `createdAt` asc. `?home=true` adds `showOnHome: true`. A published solution with **0 available services** (all unpublished, deleted or unlinkable) is left out, so the rail and nav never show "0 services". Its page still resolves and shows the "Talk to an expert" block. Returns `SolutionSummary[]`. |
| `GET /solutions/:slug` | `publicCache` | Published only. Otherwise `AppError('Solution not found', 404)`. Returns `SolutionDetail`. |
| `GET /solutions/admin/all` | `authenticate, authorize('admin')` | All statuses. Returns `SolutionAdminRow[]`. |
| `GET /solutions/admin/:id` | admin | Raw document + `itemsMeta` (see below). 404 if missing, 400 if the id is malformed. |
| `POST /solutions/admin` | admin, `validate(createSolutionSchema)` | 201 + document. 409 on duplicate slug. |
| `PUT /solutions/admin/:id` | admin, `validate(updateSolutionSchema)` | **Partial** update (the body schema is the create schema `.partial()`, like testimonials). The service merges the body onto the stored document and re-runs every rule below on the **merged** result. So `{ showOnHome: false }` alone is valid, and `{ status: 'published' }` on an empty solution is still rejected. 404 / 409 as above. |
| `DELETE /solutions/admin/:id` | admin | 200. 404 if missing. |
| `PUT /solutions/admin/reorder` | admin, `validate(reorderSchema)` | Body `{ ids: string[] }` (every solution id, exactly once). Sets `order = index` in one `bulkWrite`. 400 if the ids don't match the stored set. |

There is **no public route that accepts a status or drafts parameter.** That would repeat the
open `/services?includeDrafts=true` leak.

### Service-layer rules (`solution.service.ts`)

1. **Reference integrity on save:** collect every item's service id. Reject duplicates within a
   solution (400 `Service listed twice: <title>`). `Service.find({ _id: { $in } })` must return
   every id (400 with the missing ids). Drafts *may* be referenced; they are dropped publicly.
2. **Publish guard:** `status: 'published'` requires at least 1 item across all sections (400). Empty sections are allowed and are dropped from public payloads.
3. **Slug conflicts:** Mongo `E11000` is already mapped by the existing `errorMiddleware` to **409** with `errors: [{ field: 'slug', … }]`. That handler is reused; there's no custom catch.
4. **Public population** (`getPublishedSolutionBySlug`, `listPublishedSolutions`):
   - Load the solution(s) with `.lean()`.
   - Load the referenced services in **one** query with a projection:
     `title slug shortDescription iconName price duration category subcategory status`.
   - Load all `ServiceCategory` docs once with `id slug categoryType` projected. The collection is small.
   - Keep an item only if its service exists, `status === 'published'`, and `resolveServiceHref`
     returns a value. Drop empty sections.
   - `serviceCount` = kept items. `startingPrice` = the smallest `price.min` among kept items.
     `sectionCount` = kept sections.
5. **`resolveServiceHref(service, categories)`**, a pure function in
   `src/services/solution.helpers.ts`, exported for unit tests. It follows the real data model (read
   from `getServicesByCategory` / the `getServicesBySubcategory` controller on 2026-10-05):
   - A **simple** category is a `ServiceCategory` doc with `categoryType: 'simple'`. Its URL segment
     is its `id` (`gst`, `registration`, …). The frontend `[category]/[slug]` page treats the second
     segment as a service slug because `GET /services/<id>` reports `hasSubcategories: false`.
   - **IPO / Legal / Banking** are *virtual parents* addressed by `categoryType` (`ipo`, `legal`,
     `banking-finance`). Every `ServiceCategory` doc of those types **is a subcategory**, and its
     services live at `/services/<categoryType>/<subDoc.slug>/<service.slug>`.
   - A reference matches a category doc when its string form equals the doc's `_id`, or
     (lowercased) its `id` or `slug`.
   - Rules, in order:
     1. `service.subcategory` resolves to a doc whose `categoryType` is complex →
        `/services/<doc.categoryType>/<doc.slug>/<service.slug>`.
     2. `service.category` resolves to a doc whose `categoryType` is complex → same 3-segment form.
     3. `service.category` resolves to a simple doc → `/services/<doc.id || doc.slug>/<service.slug>`.
     4. Anything else, including a legacy bare `category: 'ipo'` string with no subcategory, gives `null`.
        The item is dropped, and a warning is logged once per request.

### Response shapes

```jsonc
// SolutionSummary  (GET /solutions)
{ "slug": "start-a-business", "title": "Start a Business", "subtitle": "Company, LLP, Proprietorship & more",
  "iconName": "Rocket", "color": "blue", "serviceCount": 22 }

// SolutionDetail  (GET /solutions/:slug)
{ "slug": "...", "title": "...", "subtitle": "...", "iconName": "Rocket", "color": "blue",
  "pageHeading": "Start Your Business The Right Way", "pageDescription": "From idea to incorporation, we make it simple.",
  "stats": { "serviceCount": 22, "startingPrice": 300, "sectionCount": 5 },
  "sections": [ { "title": "Choose your business structure", "items": [
      { "id": "<serviceObjectId>", "title": "Private Limited Company Registration", "shortDescription": "...",
        "iconName": "Building2", "price": { "min": 6999, "max": 6999, "currency": "INR" },
        "duration": "10-15 business days", "href": "/services/registration/private-limited-company-registration",
        "popular": true } ] } ] }

// SolutionAdminRow  (GET /solutions/admin/all)
{ "_id": "...", "slug": "...", "title": "...", "iconName": "...", "color": "...", "status": "published",
  "showOnHome": true, "order": 0, "itemCount": 22, "unavailableCount": 0, "updatedAt": "..." }

// GET /solutions/admin/:id → the raw document plus:
"itemsMeta": { "<serviceId>": { "title": "...", "status": "published", "categoryName": "...",
                                "priceMin": 6999, "available": true } }
```

`available` is `false` when the service is deleted, a draft, or has an unresolvable href.
`unavailableCount` counts those items.

## Frontend: admin (`cleartax frontend`)

Uses the existing admin look (dark, the same inputs, `IconPicker`, `useConfirm`, toasts).

- **Sidebar:** add `{ label: 'Solutions', href: '/admin/solutions', icon: Rocket }` after Services,
  with `prefetch={false}`, like every other sidebar link (rule from 2026-07-06).
- **API client:** `app/lib/api/services/solution.service.ts` with `listAdmin`, `getAdmin`, `create`,
  `update`, `remove`, `reorder` (axios, admin auth through the existing interceptor) and the public
  `listPublished`, `getBySlug`. Types go in `app/lib/api/types.ts`.
- **`/admin/solutions`** (list):
  - Each row shows: coloured icon tile, title, `/solutions/<slug>`, status pill, a **Show on home**
    toggle (partial PUT `{ showOnHome }`), "N services · M unavailable" (amber when M > 0),
    ↑ / ↓ buttons (reorder endpoint) and Edit / Delete. Delete goes through `useConfirm()`, never
    native `confirm()`.
  - An empty state with an **Add Solution** button.
- **`/admin/solutions/new` and `/admin/solutions/[id]`** (full-page editor, `SolutionForm` component):
  - **Card panel:** Title · Icon (`IconPicker`) · Colour (8 swatches, radio group with labels) · Subtitle.
  - **Page panel:** URL field showing `finvidhi.com/solutions/` plus the slug.
    - On a new solution the slug is derived from the title until the slug field is edited by hand.
    - Editing the slug of an already-published solution shows an inline warning that old links will break.
    - Also: Page heading (placeholder = title) and Page description.
  - **Services panel:** an ordered list of sections. Each section has:
    - a title input, ↑ / ↓ move and Delete (with confirm when it has items);
    - item rows: ★ popular toggle · title · category · "From ₹x" · ↑ / ↓ · ✕. Rows whose `available`
      is false are amber and labelled "Unavailable: unpublished or deleted";
    - a search box that reuses `useServiceIndex` + `serviceFilters`. Results show category ·
      "From ₹x". Services already in the solution are marked "Added" and are not addable.
      Drafts are shown disabled with a "Draft" tag.
    - **+ Add section** sits below the list.
  - **Right column (sticky):** live preview of the rail icon (icon, colour, title, "N services") and the page header.
  - **Actions:** **Save draft** (status draft) and **Publish** / **Update**. The `beforeunload` guard
    and an in-app navigation guard are active while the form is dirty. Toast on success.
  - **Form stack:** react-hook-form + zod (`useFieldArray` for sections and items), with client
    limits identical to the backend. A server 400 `errors[].field` (e.g. `body.sections.0.title`)
    is mapped onto the matching field. A 409 is mapped onto the slug field.

## Frontend: public

- **Data:**
  - `getHomePageData()` adds `serverFetch(`${BASE}/solutions?home=true`)` to its existing
    `Promise.all`. On failure it falls back to `[]`.
  - `(site)/layout.tsx` (a server component) fetches `GET /solutions` with `revalidate: 300` and
    passes it to `Navigation` as the `solutions` prop.
- **`SolutionRail`** (`app/components/solutions/SolutionRail.tsx`), rendered in the home hero's rail slot:
  - White panel, top corners rounded, attached to the hero's bottom edge.
  - Each item: a 64px rounded tile with a gradient in the solution colour and a white lucide icon,
    then the title (2 lines max) and "N services". It links to `/solutions/<slug>`.
  - Layout by count: 1–4 → centred row of fixed-width items · 5–8 → equal 8-column grid ·
    > 8 → horizontal scroll with snap and edge fade. ≤ 720px → 4-column grid, wrapping.
  - 0 items → render nothing; the hero closes normally.
- **Nav "Solutions ▾":** icon tile + title + subtitle per item.
- **`/solutions/[slug]/page.tsx`:**
  - Server component, `revalidate = 300`.
  - `generateMetadata`: title = `title`, description = `pageDescription || subtitle`,
    canonical `/solutions/<slug>`.
  - `notFound()` on 404 or fetch failure.
  - `app/sitemap.ts` adds every published solution.
  - Composition:
    - **Hero:** breadcrumb Home › Solutions (links to the home rail anchor `/#solutions`; there is no index page) › Title; large icon
      tile; two-line H1 from `pageHeading || title` (line 2 in `fv-blue`); description; 3 stat boxes:
      `serviceCount` services · `₹startingPrice` starting price · `sectionCount` steps.
    - **`StepBar`** *client*: sticky under the nav; numbered step chips; IntersectionObserver
      highlights the current step; click → smooth scroll (instant under reduced motion).
      Horizontal scroll on mobile.
    - **`SolutionPlanner`** *client*: owns the `Set` of selected service ids, initialised from the
      `popular` items. It renders:
      - Numbered step sections (timeline rail on the left): step label "STEP n OF N", H3 title, then a
        2-column grid of `PlanServiceCard`. Each card has a checkbox (a real `<input type=checkbox>`
        with a label), icon tile, title, 2-line description, "₹x+" and a duration chip, plus a "Most
        popular" badge if starred. A title link → `href` (opens the service detail). Clicking the card
        body toggles the checkbox.
      - **`PlanSummary`**: sticky on desktop (right column); on mobile a bottom bar showing the total
        that expands into a sheet. It shows "YOUR PLAN", the total `₹{sum of price.min}+`, "n services ·
        starting prices", selected rows with prices, a **Request Callback** button (disabled at 0
        selected) and the note "Starting prices; final quote after a quick call."
    - **Empty solution** (every item dropped): the hero is followed by a "Talk to an expert" block
      with the Request Callback button instead of steps.
- **Callback:** `RequestCallbackModal` gains two optional props, `prefillNotes?: string` and
  `interestLabel?: string`. Existing call sites are unchanged.
  - The planner opens it with `prefillNotes = buildPlanMessage(...)`.
  - Submission is unchanged: `inquiryService.create({ …, message, sourcePage: '/solutions/<slug>', type: 'callback' })`.
  - Admin → Inquiries already filters by `sourcePage`.
- **Pure helpers** (`app/lib/solutions/plan.ts`, no React):
  - `formatINR(n)` → `₹6,999`, Indian grouping via `Intl.NumberFormat('en-IN')`.
  - `planTotal(items)`.
  - `buildPlanMessage(title, items, total, max = 1000)` →
    `"Plan: Start a Business: Private Limited Company Registration (₹6,999), … Starting total ₹8,499+"`.
    If the result is longer than `max`, drop trailing items and append `"…and N more"` so the result
    is always ≤ `max`. The Inquiry model caps `message` at 1000 characters.

## Seed: `src/scripts/seedSolutions.ts`

- **Run:** `npx ts-node src/scripts/seedSolutions.ts [--dry-run | --remove]`, using the backend
  `.env` (**the production cluster**).
- **Content:** exactly the mock's "Start a Business":
  - slug `start-a-business`, icon `Rocket`, colour `blue`, subtitle "Company, LLP, Proprietorship & more",
    heading "Start Your Business The Right Way", description "From idea to incorporation, we make it simple.",
    `showOnHome: true`, `order: 0`, `status: 'published'`.
  - 5 sections with these service slugs (★ = popular):
    1. **Choose your business structure:** `private-limited-company-registration`★,
       `limited-liability-partnership-llp-registration`, `one-person-company-opc-registration`,
       `partnership-firm-registration`, `sole-proprietorship-registration`,
       `section-8-company-registration-ngo`
    2. **Get the basics in place:** `company-name-approval`,
       `digital-signature-certificate-dsc-registration`, `din-application`, `pan`, `tan`,
       `bank-account-opening`
    3. **Register for tax:** `gst-registration`, `professional-tax-registration`,
       `udyam-msme-registration`, `import-export-code-iec`
    4. **Licences & recognition:** `shops-establishment-registration`, `trade-licence`,
       `startup-india-recognition`, `dpiit-recognition`
    5. **Protect your brand:** `trademark-search`, `trademark-registration`★
- **Resolution:** each slug is looked up among `status: 'published'` services.
  - **Exactly one** match is required. If any slug has zero or several matches, the script prints the
    full resolution table and exits 1 **without writing anything**.
  - `--dry-run` always prints the table and never writes.
- **Write:** `findOneAndUpdate({ slug }, doc, { upsert: true })` (idempotent). `--remove` deletes by
  slug. The script prints the database name it is connected to before doing anything.

## Verification

Neither repo has a test runner, and adding one is out of scope.

- **B1** `npx tsc --noEmit` clean in both repos. `npm run build` passes in both.
- **B2** `scripts/smoke-solutions.sh` against the local backend (with an admin token from `POST /api/auth/login`):
  - 401 on every admin route without a token.
  - create a `zz-smoke-<epoch>` draft → 404 publicly → publish → 200 publicly.
  - the payload omits a service referenced while it was a draft.
  - 400 on: duplicate service, publish with zero items, bad colour, malformed id, reorder with a wrong id set.
  - 409 on a duplicate slug.
  - reorder round-trip.
  - delete → 404.
  - A `trap` deletes every `zz-smoke-*` solution on exit. Only the new `solutions` collection is ever written.
- **B3** Seed `--dry-run` shows 22/22 resolved, then a real run, then a second run reports no change (idempotent).
- **B4** For the seeded solution, every `href` resolves.
  - The service pages are client-rendered, so a frontend HTTP 200 proves nothing. The check
    (`scripts/check-solution-links.sh`) instead calls the **same API routes the pages call**:
    - 2-segment href: `GET /api/services/<cat>` must report `hasSubcategories !== true`, then
      `GET /api/services/<cat>/<slug>` must return 200 with `data.slug === slug`.
    - 3-segment href: `GET /api/services/<type>/<sub>/<slug>` must return 200 with `data.slug === slug`.
  - It also loads 3 sample pages in headless Chrome and asserts the service title appears in an `<h1>`.
- **B5** Headless-Chrome sweep of `/`, `/solutions/start-a-business`, `/admin/solutions` and the
  editor at 1440 / 1100 / 820 / 500 / 390, with zero horizontal overflow.
  - The home rail is checked with 1 solution (as seeded) and with 8 (temporary `zz-smoke` solutions,
    removed afterwards).
- **B6** Manual admin pass: create → add sections and items → reorder → toggle "Show on home" →
  unpublish (public page 404s, rail hides it) → republish → delete.
  - The plan builder sends a callback that shows in Inquiries with the plan message and `sourcePage`.

Nothing is committed, pushed or deployed without Vikrant's go-ahead.

## Risks

| Risk | Mitigation |
|---|---|
| Writes hit the production DB | Only the new `solutions` collection is written. Smoke data is prefixed `zz-smoke-` and trap-deleted. The seed prints the DB name and aborts on any unresolved slug. |
| `resolveServiceHref` disagrees with the real routes (`Service.category` is Mixed) | The rules are derived from the real resolvers and covered by unit tests. B4 checks every seeded link against the exact API routes the pages call, plus headless DOM checks. Unresolvable services are dropped rather than linked. |
| `/:slug` swallowing `/admin/...` | Admin routes are registered first. B2 covers it. |
| Public caching serves stale data to admin | Admin GETs already get `_t=Date.now()` from the axios interceptor. Public data is `s-maxage=60` / `revalidate=300`, the same as the rest of the site. |
| `useServiceIndex` relies on the public `/services?includeDrafts=true` (an open security task) | Not changed here. When that endpoint gets auth-gated, the hook must send the admin token. This is noted in PROJECTS.md. |
| Callback message over 1000 characters → 400 | `buildPlanMessage` caps it at `max` with "…and N more". |
| Lucide "Icon" crash from DB-driven `iconName` | All rendering goes through the existing blocklist resolver. |
