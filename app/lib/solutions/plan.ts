import { formatINR } from '../fv/text';

export interface PlanItem {
  id: string;
  title: string;
  price: { min: number };
}

export function planTotal(items: PlanItem[]): number {
  return items.reduce((sum, item) => sum + Math.max(0, Number(item.price?.min) || 0), 0);
}

/** Popular services start ticked (spec S4). */
export function initialSelection(sections: { items: { id: string; popular: boolean }[] }[]): string[] {
  return Array.from(new Set(sections.flatMap((section) => section.items.filter((item) => item.popular).map((item) => item.id))));
}

/**
 * The steps the planner renders: sections with at least one item. The API already drops empty
 * sections; this keeps the page safe if one slips through. An empty result means every service
 * was dropped, and the page shows "Talk to an expert" instead of steps (Review Focus #1).
 */
export function planSections<S extends { items?: unknown[] }>(sections: S[]): S[] {
  return (sections ?? []).filter((section) => Array.isArray(section?.items) && section.items.length > 0);
}

/**
 * The ticked services in page order. A service listed in two sections counts once, so the total
 * and the callback message never double it.
 */
export function selectedItems<T extends { id: string }>(sections: { items: T[] }[], selected: ReadonlySet<string>): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      if (!selected.has(item.id) || seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

/**
 * Callback message for the whole plan. The Inquiry model caps `message` at 1000 chars,
 * so trailing services collapse into "…and N more" until it fits (Review Focus #3).
 */
export function buildPlanMessage(solutionTitle: string, items: PlanItem[], max = 1000): string {
  if (items.length === 0) return `Plan: ${solutionTitle} (no services selected yet).`.slice(0, max);
  const head = `Plan: ${solutionTitle}: `;
  const tail = ` Starting total ${formatINR(planTotal(items))}+`;
  const parts = items.map((item) => `${item.title} (${item.price?.min > 0 ? formatINR(item.price.min) : 'price on request'})`);
  for (let shown = parts.length; shown >= 0; shown -= 1) {
    const hidden = parts.length - shown;
    const list = parts.slice(0, shown).join(', ');
    const more = hidden > 0 ? `${shown > 0 ? ', ' : ''}…and ${hidden} more` : '';
    const message = `${head}${list}${more}.${tail}`;
    if (message.length <= max) return message;
  }
  return `${head}${items.length} services.${tail}`.slice(0, max);
}
