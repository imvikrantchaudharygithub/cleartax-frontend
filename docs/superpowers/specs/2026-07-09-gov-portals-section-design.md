# Design: Government Portals Section (Homepage)

**Date:** 2026-07-09
**Status:** Approved
**Scope:** Frontend only (`cleartax frontend`)

## Purpose

Give visitors one-click access to the official Government of India portals FinVidhi's work revolves around (tax, GST, corporate filings, startup/MSME registration). Builds trust and saves users a search. Requested pattern: a dedicated homepage section, card-grid style, consistent with existing sections.

## What gets built

One new component, one edit to the homepage.

### 1. `app/components/home/GovPortalsSection.tsx` (new)

Self-contained client component (`'use client'`, framer-motion reveal on scroll — same conventions as `ServicesSection`/`BenefitsSection`).

Portal data is a typed const array **inside the component file** (deliberately not admin-managed; these URLs are stable and a code edit is the right change process):

| # | Name | URL | Description | Icon (lucide-react) |
|---|------|-----|-------------|---------------------|
| 1 | Income Tax e-Filing | https://www.incometax.gov.in | ITR filing, PAN services & refunds | `Landmark` |
| 2 | GST Portal | https://www.gst.gov.in | GST registration & return filing | `Receipt` |
| 3 | Ministry of Corporate Affairs | https://www.mca.gov.in | Company & LLP filings, name search | `Building2` |
| 4 | Startup India | https://www.startupindia.gov.in | DPIIT recognition & startup benefits | `Rocket` |
| 5 | Udyam Registration | https://udyamregistration.gov.in | MSME / Udyam registration | `Factory` |

**Section chrome:**
- Heading: "Official Government Portals"
- Subheading: "Quick access to the government portals we work with every day"
- Disclaimer line under the grid (small, muted): "These are official Government of India portals. FinVidhi is not affiliated with or endorsed by them."

**Card anatomy:** icon in a tinted rounded square, portal name, one-line description, external-link arrow (`ExternalLink`) top-right. The **entire card** is a single `<a href target="_blank" rel="noopener noreferrer">` with `aria-label="{name} — opens official government portal in a new tab"`. Hover: subtle lift + border accent, matching existing card hover language.

**Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`, equal-height cards. Section container/padding identical to neighboring sections (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, standard section vertical padding).

### 2. `app/(site)/page.tsx` (edit)

Render `<GovPortalsSection />` between `<TestimonialsSection />` and `<CTASection />`. No props — the component is fully static.

## Explicitly out of scope

- No backend model / validation / controller changes.
- No admin panel form.
- No footer changes.
- No portal logos/images (lucide icons only — avoids trademark/asset management).

## Error handling

None required — static outbound anchors. No fetches, no state beyond animation.

## Verification

1. `npm run dev` in `cleartax frontend`; homepage renders the section between Testimonials and CTA.
2. All 5 links open the correct official portal in a new tab (`noopener noreferrer` present).
3. Responsive check: 1/2/3/5 columns at mobile/sm/lg/xl; no horizontal overflow.
4. `npx tsc --noEmit` passes (ignoring pre-existing `.next/` generated-file noise).
