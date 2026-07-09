# Government Portals Homepage Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static "Official Government Portals" card-grid section to the homepage linking 5 official Government of India portals.

**Architecture:** One new self-contained client component (`GovPortalsSection`) holding a typed const array of portals, rendered by the homepage server component between Testimonials and CTA. No backend, no admin, no API changes.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, framer-motion (via existing `StaggerContainer`/`StaggerItem` animation wrappers), lucide-react icons, existing `Card` UI component.

**Spec:** `docs/superpowers/specs/2026-07-09-gov-portals-section-design.md`

## Global Constraints

- Repo root for all paths/commands: `/Users/vikrantchaudhary/Desktop/cleartax/cleartax frontend`
- Section heading copy, exactly: `Official Government Portals`
- Subheading copy, exactly: `Quick access to the government portals we work with every day`
- Disclaimer copy, exactly: `These are official Government of India portals. FinVidhi is not affiliated with or endorsed by them.`
- Every portal link: `target="_blank" rel="noopener noreferrer"` and an `aria-label` ending in `— opens official government portal in a new tab`
- Grid breakpoints: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`
- No test framework exists in this repo (scripts: dev/build/start/lint only). Verification = `npx tsc --noEmit` (ignore pre-existing errors in `.next/`), `npm run lint`, and live render checks. Do not add a test framework.
- This repo's `main` is the working branch; commit directly to it (matches existing project practice).

---

### Task 1: Create `GovPortalsSection` component

**Files:**
- Create: `app/components/home/GovPortalsSection.tsx`

**Interfaces:**
- Consumes: `StaggerContainer`, `StaggerItem` from `app/components/animations/StaggerContainer.tsx` (props: `children`, `className?`); `Card` from `app/components/ui/Card.tsx` (props: `children`, `className?`, `hoverable?`); icons from `lucide-react`.
- Produces: default export `GovPortalsSection(): JSX.Element` — no props. Task 2 imports it as `import GovPortalsSection from '../components/home/GovPortalsSection';`

- [ ] **Step 1: Write the component**

Create `app/components/home/GovPortalsSection.tsx` with exactly:

```tsx
'use client';

import { motion } from 'framer-motion';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import Card from '../ui/Card';
import {
  Landmark,
  Receipt,
  Building2,
  Rocket,
  Factory,
  ExternalLink,
} from 'lucide-react';

interface GovPortal {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Official portals only. To add/change one, edit this array — deliberately
// not admin-managed (see docs/superpowers/specs/2026-07-09-gov-portals-section-design.md).
const GOV_PORTALS: GovPortal[] = [
  {
    name: 'Income Tax e-Filing',
    description: 'ITR filing, PAN services & refunds',
    href: 'https://www.incometax.gov.in',
    icon: Landmark,
  },
  {
    name: 'GST Portal',
    description: 'GST registration & return filing',
    href: 'https://www.gst.gov.in',
    icon: Receipt,
  },
  {
    name: 'Ministry of Corporate Affairs',
    description: 'Company & LLP filings, name search',
    href: 'https://www.mca.gov.in',
    icon: Building2,
  },
  {
    name: 'Startup India',
    description: 'DPIIT recognition & startup benefits',
    href: 'https://www.startupindia.gov.in',
    icon: Rocket,
  },
  {
    name: 'Udyam Registration',
    description: 'MSME / Udyam registration',
    href: 'https://udyamregistration.gov.in',
    icon: Factory,
  },
];

export default function GovPortalsSection() {
  return (
    <section className="py-20 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-accent mb-3">
              Official Resources
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
              Official Government Portals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quick access to the government portals we work with every day
            </p>
          </motion.div>
        </div>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {GOV_PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <StaggerItem key={portal.name} className="h-full">
                <a
                  href={portal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${portal.name} — opens official government portal in a new tab`}
                  className="block h-full"
                >
                  <Card
                    hoverable
                    className="h-full flex flex-col group border border-gray-100/80 hover:border-accent/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
                    </div>
                    <h3 className="font-heading font-semibold text-base text-primary mb-1 group-hover:text-accent transition-colors">
                      {portal.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {portal.description}
                    </p>
                  </Card>
                </a>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <p className="text-center text-xs text-gray-500 mt-8">
          These are official Government of India portals. FinVidhi is not affiliated with or endorsed by them.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `cd "/Users/vikrantchaudhary/Desktop/cleartax/cleartax frontend" && npx tsc --noEmit`
Expected: no NEW errors (pre-existing errors under `.next/dev/types/` are known noise — ignore).

Run: `npm run lint`
Expected: no errors for `app/components/home/GovPortalsSection.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/components/home/GovPortalsSection.tsx
git commit -m "feat: add GovPortalsSection with official government portal links"
```

---

### Task 2: Render the section on the homepage and verify live

**Files:**
- Modify: `app/(site)/page.tsx` (import block at top; JSX between `<TestimonialsSection …/>` and `<CTASection />`)

**Interfaces:**
- Consumes: `GovPortalsSection` default export from Task 1 (no props).
- Produces: homepage renders the section; nothing downstream depends on it.

- [ ] **Step 1: Add the import**

In `app/(site)/page.tsx`, after the line `import TestimonialsSection from '../components/home/TestimonialsSection';` add:

```tsx
import GovPortalsSection from '../components/home/GovPortalsSection';
```

- [ ] **Step 2: Render between Testimonials and CTA**

In the returned JSX, change:

```tsx
      <TestimonialsSection serverData={data.testimonials} />
      <CTASection />
```

to:

```tsx
      <TestimonialsSection serverData={data.testimonials} />
      <GovPortalsSection />
      <CTASection />
```

- [ ] **Step 3: Type-check**

Run: `cd "/Users/vikrantchaudhary/Desktop/cleartax/cleartax frontend" && npx tsc --noEmit`
Expected: no NEW errors (same `.next/` caveat).

- [ ] **Step 4: Verify live render and links**

Run: `npm run dev` (background), open `http://localhost:3000/`, scroll to the section.

Checks (browser automation or manual):
1. Section appears between the testimonials section and the final CTA, heading exactly `Official Government Portals`.
2. Exactly 5 cards; each anchor has the correct `href`, `target="_blank"`, `rel="noopener noreferrer"`:
   - https://www.incometax.gov.in
   - https://www.gst.gov.in
   - https://www.mca.gov.in
   - https://www.startupindia.gov.in
   - https://udyamregistration.gov.in
3. Disclaimer line renders below the grid.
4. Responsive: 1 column at 375px width, 5 columns at ≥1280px, no horizontal overflow.

Expected: all four checks pass. Stop the dev server afterwards.

- [ ] **Step 5: Commit**

```bash
git add "app/(site)/page.tsx"
git commit -m "feat: show government portals section on homepage"
```
