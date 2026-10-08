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

// The stored-slug rule (formSchema SLUG_PATTERN, server zod + Mongoose): lowercase words, single hyphens, ≤ 80.
const SOLUTION_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A public `/solutions/<slug>` param as the backend would look it up (it lowercases too), or null when
 * no stored solution can have it, so the page 404s without a backend call (bots probing random paths).
 */
export function normalizeSolutionSlug(slug: string): string | null {
  if (typeof slug !== 'string') return null;
  const s = slug.toLowerCase();
  return s.length <= 80 && SOLUTION_SLUG.test(s) ? s : null;
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
