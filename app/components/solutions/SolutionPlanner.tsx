'use client';

import { useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Phone } from 'lucide-react';
import Button from '@/app/components/fv/Button';
import RequestCallbackModal from '@/app/components/home/RequestCallbackModal';
import StepBar from './StepBar';
import PlanServiceCard from './PlanServiceCard';
import PlanSummary from './PlanSummary';
import { buildPlanMessage, initialSelection, planSections, planTotal, selectedItems } from '@/app/lib/solutions/plan';
import type { SolutionDetail } from '@/app/lib/api/types';

/**
 * The plan builder (design 3 numbered journey): steps of tickable services, a live total of the
 * starting prices, and one callback request for the whole plan. Popular services start ticked.
 * `icons` maps item id → its icon tile, rendered by the server page.
 */
export default function SolutionPlanner({ solution, icons }: { solution: SolutionDetail; icons: Record<string, ReactNode> }) {
  const sections = useMemo(() => planSections(solution.sections), [solution.sections]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelection(sections)));
  const [callbackOpen, setCallbackOpen] = useState(false);
  // The button that opened the modal: focus goes back there even if the click never focused it.
  const trigger = useRef<HTMLElement | null>(null);
  const chosen = selectedItems(sections, selected);
  const total = planTotal(chosen);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openCallback = (event: MouseEvent<HTMLButtonElement>) => {
    trigger.current = event.currentTarget;
    setCallbackOpen(true);
  };

  const modal = (
    <RequestCallbackModal
      open={callbackOpen}
      onClose={() => setCallbackOpen(false)}
      interestLabel={solution.title}
      prefillNotes={chosen.length > 0 ? buildPlanMessage(solution.title, chosen) : undefined}
      returnFocusRef={trigger}
    />
  );

  // Every service was dropped (deleted / unpublished): no steps, just a way to reach an expert.
  if (sections.length === 0) {
    return (
      <section className="fv-wrap py-14">
        <div className="fv-card mx-auto max-w-[560px] p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-fv-navy">Talk to an expert</h2>
          <p className="mt-2 text-fv-slate">
            We&apos;re updating the services in this plan. Tell us what you need and we&apos;ll call you back.
          </p>
          <Button size="lg" className="mt-6" onClick={openCallback}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Request Callback
          </Button>
        </div>
        {modal}
      </section>
    );
  }

  const steps = sections.map((section, i) => ({ id: `step-${i + 1}`, label: section.title }));

  return (
    <>
      <StepBar steps={steps} />
      {/* The bar variant must stay a direct child of this wrapper (see PlanSummary). */}
      <div>
        <div className="fv-wrap grid items-start gap-8 pb-14 pt-10 md:pb-[72px] lg:grid-cols-[minmax(0,1fr)_320px]">
          <ol className="min-w-0">
            {sections.map((section, i) => (
              <li
                key={`${section.title}-${i}`}
                id={steps[i].id}
                aria-labelledby={`${steps[i].id}-title`}
                // Focus target for the step chips (not in the tab order). `!`: the global
                // *:focus-visible outline comes after the utilities and would win otherwise.
                tabIndex={-1}
                className="relative grid scroll-mt-36 grid-cols-[32px_minmax(0,1fr)] gap-3 pb-10 !outline-none last:pb-0 md:grid-cols-[44px_minmax(0,1fr)] md:gap-[18px]"
              >
                {/* timeline: number disc, then a dashed rail down to the next step */}
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-fv-blue-d bg-white text-[13px] font-extrabold text-fv-blue-d md:h-11 md:w-11 md:text-base"
                >
                  {i + 1}
                </span>
                {i < sections.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-[15px] top-[34px] border-l-2 border-dashed border-[#CFE2F2] md:left-[21px] md:top-[46px]"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-fv-slate">
                    Step {i + 1} of {sections.length}
                  </p>
                  <h2
                    id={`${steps[i].id}-title`}
                    className="mb-4 mt-0.5 text-xl font-extrabold tracking-[-0.02em] text-fv-navy md:text-2xl"
                  >
                    {section.title}
                  </h2>
                  <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {section.items.map((item) => (
                      <li key={item.id} className="min-w-0">
                        <PlanServiceCard
                          item={item}
                          icon={icons[item.id]}
                          checked={selected.has(item.id)}
                          onToggle={() => toggle(item.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
          <PlanSummary variant="card" items={chosen} total={total} onRequest={openCallback} />
        </div>
        <PlanSummary variant="bar" items={chosen} total={total} onRequest={openCallback} />
      </div>
      {modal}
    </>
  );
}
