# Design: L3 "Service Hub" Site Redesign

**Date:** 2026-10-05
**Status:** Approved in brainstorming. Written spec awaiting review.
**Scope:** Frontend only (`cleartax frontend`), public site. No backend change. Admin is untouched.
**Companion spec:** `2026-10-05-solutions-design.md` (Spec 2) builds on this. It adds the solution
rail into the slot this spec leaves in the home hero, plus the "Solutions ▾" nav item.

## Purpose

Vikrant picked **L3 "Service Hub"** from `/Users/vikrantchaudhary/Desktop/cleartax/ui-variants/home-layout-variants.html`
(tab `L3`) as the new look for the whole public site. L3 is assembled from the system
extracted from the reference board in the same file's "Image analysis" tab: 3 page
skeletons, one card language, category icon colours, Inter type, and light washes
instead of coloured bands.

Success means:

1. Every existing public route renders in the L3 language. Nav, footer, heroes, cards
   and grids should feel like one system.
2. No behaviour regresses. Data fetching, routing, category resolution, SEO metadata,
   `revalidate`, a11y fixes and the callback/inquiry flows work exactly as today.
3. No horizontal overflow at 1440 / 1280 / 1100 / 820 / 500 / 390 px.
4. Admin looks exactly as it does today.

## Decisions (from brainstorming, 2026-10-05)

| # | Decision | Why |
|---|---|---|
| D1 | ~~Home = L3 hero + dashboard card~~ **Revised 2026-10-06:** Home = **exactly design 3 "Icon Rail"** from `ui-variants/home-solution-cards-variants.html#s3` (its home view): centred hero (badge, one-line H1, subline, big search) with the Spec 2 solution rail inside it, stats strip, "Most popular services", IPO / Legal / Banking trio, Why Choose, Testimonials, navy CTA. No dashboard card, explorer, Team or Gov Portals on the home page. | Vikrant, 2026-10-06, pointing at a screenshot of `#s3`: "this is design 3"; then picked "Exactly s3". The rest of the site keeps the L3 language (s3 uses the same kit). |
| D2 | **L3 layout and Inter type, coloured with the logo palette** (`#1E2C59` navy, `#2587C4` blue) | Vikrant: "1 but use the logo color". This partly supersedes the 2026-07-02 rule "colours are logo-derived and must never change": the colours stay logo-derived, while the layout, type and components move to L3. |
| D3 | New **`fv` token namespace**. `primary` / `accent` are **not** redefined. | Admin uses the `primary` token 123 times. Redefining it would recolour admin by accident. |
| D4 | Restyle through shared components first (`PageHero`, `ServiceHero` family, `LegalPage`, `ui/Card`, nav, footer), then page-specific JSX. **`ui/Button`, `ui/Input`, `ui/TextArea` are NOT restyled in place.** Admin imports them (contact, home-info, team, testimonials). The public site gets a new `fv/Button` with the same props API, and the 16 public importers are switched to it. | `PageHero` covers 10 pages, `ServiceHero` 10 (including all 8 static GST pages), `LegalPage` 3. `ui/Card` has only public importers. (Corrected 2026-10-05 during planning: the first draft wrongly said `ui/Button` was public-only.) |
| D5 | Nav = Home · Services ▾ · Solutions ▾ · Resources ▾ · Team · Contact · [Request Callback]. **No Client Login link.** | `/login` is a mock: `setTimeout(1500)` and nothing else. Linking to it prominently would hurt trust. |
| D6 | Existing routes only. No new pages from the board. | Keeps scope bounded. See Out of scope. |

## Design system

### Tokens: `tailwind.config.ts` → `theme.extend.colors.fv`

| Token | Value | Use | Contrast note |
|---|---|---|---|
| `fv-navy` | `#1E2C59` | headings, footer background, dark text | 12.9:1 on white |
| `fv-blue` | `#2587C4` | icons, highlights, large accent headline text (H1 second line) | 3.9:1. Only for icons and text ≥ 24px or ≥ 18.66px bold. |
| `fv-blue-d` | `#1E6C9D` | primary button background, small link text, focus ring | 5.7:1 with white |
| `fv-blue-dd` | `#175176` | button hover / active | — |
| `fv-blue-50` | `#E8F4FB` | icon tiles, hover backgrounds, pills | — |
| `fv-wash` | `#F3F9FD` | hero and section washes (`soft` sections) | — |
| `fv-slate` | `#55627A` | body text, subtitles | 6.2:1 |
| `fv-muted` | `#8A94A8` | icons, placeholders, decorative only — never text <24px (3.05:1 on white; amended 2026-10-07 after final review) | — |
| `fv-line` | `#E6ECF5` | card borders, rules | — |
| `fv-green` | `#58A651` | success icon accents | — |
| `fv-green-d` | `#3E7B39` | "Most popular" badge text on `#EAF5E8` | 5.1:1 |

**Category colours** are exposed as `fv-cat-<key>` with `fg` / `bg` / `pale` shades. They are used by
explorer tiles, gov-portal tiles, service tiles and (in Spec 2) solution icons. The keys and
values come from the mockups' `c-*` classes. Blue, green and teal are swapped to the logo
palette (D2); the other five keep the mockup values.

| Key | `fg` | `bg` | `pale` | Source |
|---|---|---|---|---|
| `blue` | `#2587C4` | `#E8F4FB` | `#F3F9FD` | logo blue |
| `green` | `#58A651` | `#EAF5E8` | `#F4FAF3` | logo green |
| `teal` | `#3D8A6A` | `#EDF5F1` | `#F5FAF8` | logo teal |
| `purple` | `#7C4DFF` | `#EFE9FF` | `#F7F4FF` | mockup |
| `orange` | `#F97316` | `#FFEEDD` | `#FFF8F0` | mockup |
| `red` | `#EF4444` | `#FFE7E7` | `#FFF5F5` | mockup |
| `yellow` | `#D99A00` | `#FFF4D1` | `#FFFBEE` | mockup |
| `pink` | `#DB2777` | `#FCE7F3` | `#FFF5FA` | mockup |

Icons drawn in `fg` on `bg` are decorative and always sit next to a text label. They are
not the only carrier of meaning.

### Type

- The public layout wrapper gets the class `fv-site`. In `globals.css`:
  `.fv-site { --font-poppins: var(--font-inter); --font-ibm-plex: var(--font-inter); font-family: var(--font-inter); color: #1E2C59; }`.
  `next/font` puts the variables on `<html>`, so redefining them on the wrapper switches every
  `font-heading`, `font-sans` and the global `h1–h6 { font-family: var(--font-poppins) }` rule to
  Inter inside the public site only. The admin layout never carries `fv-site`, so admin keeps Poppins and IBM Plex.
- Scale: H1 50px / 800 / −0.03em / 1.08 · H2 36px / 800 · H3 22px / 800 · card title 16px / 700 ·
  body 16px / 400 / 1.6 · meta 13px / 500. Mobile: H1 34px, H2 28px.

### Shape, spacing, elevation

- Radius: buttons and inputs 8px · cards 14px · icon tiles 11px (46px tile) · large panels 18–22px · pills 999px.
- Container `.fv-wrap`: `max-width: 1136px`, gutters 24px (16px ≤ 640px). This matches the mockup's
  152 → 1288px content box at 1440.
- Section padding: 88px (default) / 56px (`tight`), and 56px / 40px on mobile.
- Shadows: `fv-card` `0 10px 30px rgba(30,44,89,.06)` · `fv-raised` `0 30px 70px rgba(30,44,89,.12)`.

## Shared primitives: `app/components/fv/`

Each is small, presentational and server-safe unless marked *client*.

| Component | Responsibility |
|---|---|
| `Section` | `<section>` + `.fv-wrap`. Variants `plain` / `soft` (wash) / `tight`. |
| `SectionHead` | H2 + subtitle, `align: left \| center`, optional action link ("View all →") |
| `IconTile` | Renders a lucide icon by name inside a coloured tile. Applies the existing **"Icon"-crash blocklist** (`Icon`, `LucideIcon`, `createLucideIcon`, `icons`, `default` → `FileText`) by reusing the existing resolver, not a new copy. |
| `Tile` | White card: icon tile top-left, title, optional text, arrow bottom-right. Optional `href`. |
| `Pill` | Small rounded label or link |
| `LightHero` | L3 inner-page hero: optional breadcrumb, badge, two-line H1 (line 2 in `fv-blue`), subtitle, optional `SearchBar`, optional right-hand slot (stats, art, price card) |
| `SearchBar` | GET form to `/services?q=` |
| `StatsStrip` | 4 stats in a row with icons (home) |
| `Explorer` *client* | Sidebar of areas + one pane per area + accordion rows. Uses ARIA tabs (`role=tablist/tab/tabpanel`, arrow-key navigation). Below 1024px (`lg`) the sidebar becomes a horizontal chip scroller. |
| `CTASplit` | Heading, text, 3 value boxes, 2 buttons, image frame (home "Ready to simplify" block) |

New: `fv/Button`. It has the same props as `ui/Button` (`variant: primary | secondary | tertiary`,
`size`, `isLoading`) plus the variants `outline`, `white` and `link`. Every public importer of
`ui/Button` switches to it; admin keeps `ui/Button`.

Restyled in place (same props, new look): `ui/Card` (public-only), `common/PageHero` (becomes a
thin wrapper over `LightHero`), `common/Breadcrumb`, the `services/ServiceHero` family
(`ServiceHero`, `ServiceFeatures`, `ProcessTimeline`, `FAQAccordion`, `RelatedServices`,
`ServiceForm`, `ServiceCard`) and `legal/LegalPage`.

New: `services/ServiceDetailBody`. The service-detail body (About · What you get · Process ·
inquiry form · Documents · FAQs · Related) is currently copy-pasted into 10 pages. It is extracted
once and used by all of them, which is the only way the tab bar and the restyle stay consistent.

Typography switch: the public wrapper `.fv-site` redefines `--font-poppins` and `--font-ibm-plex`
as `var(--font-inter)`. Every existing `font-heading` / `font-sans` / `h1–h6` rule inside the
public site therefore resolves to Inter with no per-file edits, and admin (outside `.fv-site`) is
unaffected.

## Site shell

- **Navigation** (`common/Navigation.tsx`): white, sticky, 68px tall, logo left.
  - Items: Home · Services ▾ · Solutions ▾ · Resources ▾ · Team · Contact, then a `primary` "Request Callback" button.
  - **Services ▾:** GST Services, Business Registration, Income Tax, Trademarks & IP, Legal Services, IPO Services, Banking & Finance.
  - **Resources ▾:** Blog, Calculators, Compliance.
  - **Solutions ▾** is rendered only when it receives a non-empty `solutions` prop. Spec 1 never passes one, so it stays hidden until Spec 2.
  - Active state: blue text plus a 2px underline.
  - Keep the existing keyboard dropdown behaviour, the mobile drawer and the a11y work. Keep `aria-expanded`.
- **Footer** (`common/Footer.tsx`): navy `fv-navy` background, with columns Brand+social · Products (calculators) · Company (Blog, Contact) · Resources (Compliance, Privacy, Terms, Cookies) · Newsletter (visual only, as today), then a bottom bar with © year and legal links.

## Page mapping

**Rule for every page:** data fetching, route params, `generateMetadata` / `metadata`,
`revalidate`, JSON-LD, the category-resolution logic and the inquiry / callback submission
code stay as they are. Only presentation changes.

| Route(s) | Composition |
|---|---|
| `/` | **Revised 2026-10-06 — design 3 "Icon Rail" (`home-solution-cards-variants.html#s3`, home view), section for section.** **1. Hero (centred, `HomeHero`):** soft light wash (radial blue-50 glow at top centre → white), badge pill (`banner.badge`), ONE-line H1 from `banner.heading` split on the first sentence end — first sentence navy, second `fv-blue` (≥40px, so large-text contrast applies), subline = `banner.description`'s second paragraph if it has one, else the first, max 620px, then a centred `SearchBar` (max 680px, 58px tall; GET `/services?q=`). No buttons, no pills, no dashboard card in the hero. **Rail slot** (`rail?: ReactNode`) directly under the search: Spec 2 fills it with the solution icon rail, a white card with rounded top corners and no bottom border that sits on the hero's bottom edge (8 across ≥1024px, 4×2 on mobile). Without a rail the hero just ends with bottom padding. **2. StatsStrip** from `homeInfo.stats` (top border, `₹` stripped from non-money stats as before). **3. Most popular services** (`PopularServices`): `SectionHead` "Most popular services" + action "View all services →" `/services`, then a 4-column grid of service cards — icon tile, title, 2-line description, green "★ Most popular" pill, "From ₹X" (`formatFromPrice`; "Price on request" for 0/missing) and duration. Items come from Spec 2 (★ items of published solutions); Spec 1 renders the section only when it receives items, so it is absent until Spec 2 ships. **4. Trio** (`AreaTrio`): IPO / Legal / Banking side by side (1 column on mobile), each a `fv-card` with a header (icon tile — IPO `TrendingUp` green, Legal `Scale` teal, Banking `Landmark` orange — area heading, "N services" total), rows = subcategories (icon, title, count badge) linking to `/services/<type>/<sub.slug>`, and a "View All … Services →" link to `/services/<type>`. Subcategories with 0 published services are dropped (they lead to empty pages — this deliberately differs from the mockup, which shows 0); an area with no rows is omitted; no areas → no section. Data via `buildExplorerAreas` (kept for its tested mapping). **5. Why Choose** (`BenefitsSection`): centred `SectionHead` (`benefits.heading` / `subheading`) + 3 value tiles (icons Eye / ShieldCheck / BadgeCheck). **6. Testimonials** (3 cards). **7. CTA** (`CTABanner`): navy gradient panel, radius 20px — heading, text, small note, buttons "View Services →" (`/services`, primary) and "Explore Calculators" (`/calculators`, white). Copy from the existing `CTASection`. Team (still at `/team`), Government Portals and the explorer are **not** on the home page. `ProductsGrid` stays commented out. |
| `/services` | `LightHero` + search (the existing `AllServicesClient` search, now also prefilled from `?q=`), pastel category tiles, then per-category grids of `ServiceCard` tiles ("From ₹" + duration) |
| `/services/[category]` | `LightHero` (category icon, admin `heroTitle` / `heroDescription`, `heroStats` as mini stat boxes in the right slot), 3×2 `Tile` grid of services or subcategories, admin Why Choose section, "Need help choosing" CTA with phone / WhatsApp from `/api/contact` (white + WhatsApp-green buttons, as today) |
| `/services/[category]/[slug]` (subcategory listing case) | Same composition as the category page |
| Service detail: `/services/[category]/[slug]` (simple case), `/services/[category]/[slug]/[serviceSlug]`, the 8 static `/services/gst/*` pages | Breadcrumb, then light `ServiceHero` with the same props as today (left: icon tile, category pill, title, short description, the existing 3 ✓ trust points; right: **price card** with ₹ price, duration, the existing "Get Started Now" button that scrolls to `#inquiry-form`, and the contact phone). Then **`ServiceDetailBody`**: a sticky in-page tab bar (Overview · Process · Documents · FAQs, anchor links rather than hidden panels so content stays crawlable), restyled `ServiceFeatures`, `ProcessTimeline` and `FAQAccordion`, the existing inquiry form card, and `RelatedServices`. `RelatedServices` gains an optional `subcategory` prop, so related cards on 3-level pages link to `/services/<cat>/<sub>/<slug>`. Today they link to a 2-level URL, which is a pre-existing broken link. |
| `/blog`, `/blog/[slug]`, `/team`, `/team/[id]`, `/contact`, `/compliance`, `/calculators` + 5 calculators, `/privacy` `/terms` `/cookies`, `/login` `/signup` | **Revised 2026-10-06 — full theme conformance, structure unchanged** (Vikrant: "all page design should follow the design theme"). Every one of these pages must read as the same system as the home page: light hero, `fv-*` colours only, `.fv-card` surfaces, Inter headings in `fv-navy`, `fv/Button`, themed inputs — see "Theme conformance" below. Originally: **Shell-level restyle, structure unchanged.** These pages already have the board's structure (split contact page, card grids, calculator input + result columns). They change through: the light `PageHero` / `LightHero`; Inter (via `.fv-site`); `ui/Card` and the `.fv-card` surface; `fv/Button`; `.fv-wrap` containers; and navy heading classes. The last three are applied by a reviewable codemod (`scripts/fv-restyle.mjs`, exact string pairs, explicit file list, dry-run counts first). Team bios stay **justified**. **Calculation modules and their wiring are not touched**; the known ₹0 / GST-math bugs stay deferred (decided 2026-07-05). `/login` and `/signup` stay mocks and are not linked from the nav. No new features (no blog search or topic pills). |
| `not-found` | `LightHero` "Page not found" + `SearchBar` + links to the top 4 categories |

## Theme conformance (added 2026-10-06)

Vikrant, 2026-10-06: "all page design should follow the design theme". A public page **follows the theme** when all of these hold:

1. **Hero:** light (`PageHero` / `LightHero` / `CategoryHero` / `ServiceHero`) — no dark or coloured gradient bands. Navy surfaces are allowed only for the footer and end-of-page CTA panels in the home `CTABanner` style (navy→blue-dd gradient, 20px radius); heroes and content sections are always light.
2. **Colour:** only `fv-*` tokens, the category colour variables (`fvColorVars`) and neutral white/black alphas. Zero old-theme classes (`*-primary`, `*-accent`, `*-light-blue`, `*-brand-*`, `*-teal-<n>`, `shadow-card`, `shadow-glow*`, `font-poppins`, `font-ibm`) in rendered public code — measured by `scratch/oldtheme.sh`; the only allowed exceptions are files admin also renders (`ui/Button`, `ui/Input`, `ui/TextArea`, `ui/Select`) and unrendered old home components.
3. **Surfaces:** `.fv-card` (white, 1px `fv-line`, 14px radius, `shadow-fv-card`); sections alternate white / `fv-wash`; 88px section rhythm (56px mobile).
4. **Type:** Inter; headings extrabold/bold `tracking-tight` `fv-navy`; body `fv-slate`; small links `fv-blue-d`; `fv-blue` only for large text.
5. **Controls:** `fv/Button`; inputs/selects 1px `fv-line`, 8px radius, `fv-blue-d` focus ring, ≥16px on mobile. Admin-shared controls get public twins (`fv/Button` exists; `fv/Select` is added the same way) instead of being restyled in place.
6. **Icons:** icon + label cards use `IconTile` (tinted tile, category colour).
7. **Unchanged:** page structure, copy, data fetching, calculation logic and form wiring.

## Responsive and accessibility

- Widths audited: 1440, 1280, 1100, 820, 500, 390. The requirement is **zero horizontal overflow** (`document.documentElement.scrollWidth <= innerWidth`) on every route listed above.
- Grids: 4 → 2 → 1 (stats, team), 3 → 2 → 1 (tiles), 5 → 3 → 1 (portals). The hero dashboard card stacks below the hero text, and the explorer sidebar turns into a horizontal chip scroller, below Tailwind's `lg` breakpoint (1024px).
- Keep: 16px inputs on mobile (no iOS zoom), `useId` labels, visible focus rings (`fv-blue-d`), `prefers-reduced-motion` (framer-motion reveals turn off), and alt text from the data.
- The nav must fit at 1280px. If it doesn't, the dropdown labels collapse into the hamburger at ≤1240px, the same fix the mockup needed.

## Out of scope

- New pages from the reference board: About, Pricing / Plans, Careers, FAQ hub, client dashboard, loan / funding stepper, business-growth advisory.
- Calculator logic fixes. Real auth for `/login` and `/signup`. Newsletter backend.
- Any admin restyle (Spec 2 adds one new admin page in the existing admin style).
- Data clean-up (junk records, near-duplicate services, the `₹` prefix on "Companies Incorporated"). These are content tasks in admin and are listed in PROJECTS.md.

## Verification

No test runner exists in this repo, and adding one is out of scope.

1. `npx tsc --noEmit` clean and `npm run build` exit 0.
2. Headless-Chrome screenshot sweep of every route above at the 6 widths, with an automated overflow assertion per page. Pages are fetched from `next start` pointing at the local backend.
3. Behaviour spot checks: Request Callback modal submits (an inquiry appears in admin), service search filters, explorer tabs work with mouse and keyboard, the mobile nav drawer opens and closes, category / subcategory / service links resolve (no 404) for every link on `/`, `/services` and one category of each type (simple, ipo, legal, banking-finance).
4. Admin smoke check: `/admin/home`, `/admin/services`, `/admin/home-info` look unchanged (side-by-side screenshot against `main`).

## Risks

| Risk | Mitigation |
|---|---|
| Accidental admin restyle through shared tokens or global CSS | `fv` namespace only, heading override scoped to `.fv-site`, admin screenshot diff in Verification step 4 |
| The 664-line category page and 470-line `[slug]` page mix data logic with JSX | Extract presentational sections into components without moving the data code. Diff review checks that the fetch and resolve blocks are byte-identical. |
| `next build` CSR bailout from `useSearchParams` (bit us on 2026-06-02) | `/services?q=` prefill is read in `AllServicesClient` from `window.location.search` inside a mount effect, the same technique as the admin search. The server page keeps its ISR and doesn't become dynamic, and there's no `useSearchParams` in new code. |
| Third-party image domains | Only Cloudinary images are used. `remotePatterns` already allows `res.cloudinary.com`. |
