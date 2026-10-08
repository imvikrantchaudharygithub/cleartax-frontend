'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { FAQ } from '@/app/types/services';

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <div className="fv-card divide-y divide-fv-line">
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        const answerId = `faq-answer-${faq.id ?? index}`;
        return (
          <div key={faq.id ?? index}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={answerId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-fv-navy hover:text-fv-blue-d md:px-6"
              >
                {faq.question}
                <ChevronDown
                  aria-hidden="true"
                  className={clsx('h-5 w-5 flex-none text-fv-muted transition-transform', open && 'rotate-180 text-fv-blue-d')}
                />
              </button>
            </h3>
            <div id={answerId} hidden={!open} className="px-5 pb-5 text-[15px] leading-relaxed text-fv-slate md:px-6">
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
