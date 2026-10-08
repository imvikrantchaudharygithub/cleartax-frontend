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
