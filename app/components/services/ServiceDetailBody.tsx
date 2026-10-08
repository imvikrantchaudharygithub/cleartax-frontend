'use client';

import type { ReactNode } from 'react';
import { CheckCircle, FileText } from 'lucide-react';
import ServiceSectionNav from './ServiceSectionNav';
import ServiceFeatures from './ServiceFeatures';
import ProcessTimeline from './ProcessTimeline';
import ServiceForm from './ServiceForm';
import FAQAccordion from './FAQAccordion';
import RelatedServices, { type SerializableService } from './RelatedServices';
import type { FAQ, ProcessStep, Service } from '@/app/types/services';

export interface ServiceDetailData {
  id: string;
  title: string;
  longDescription?: string;
  features: string[];
  benefits?: string[];
  process: ProcessStep[];
  requirements: string[];
  faqs: FAQ[];
}

interface ServiceDetailBodyProps {
  service: ServiceDetailData;
  /** Defaults to "About <title>" (the static GST pages pass their existing headings). */
  aboutTitle?: string;
  aboutExtra?: ReactNode;
  related?: (Service | SerializableService)[];
  relatedCategory: string;
  relatedSubcategory?: string;
}

const H2 = 'text-2xl font-extrabold tracking-[-0.02em] text-fv-navy md:text-[30px]';

export default function ServiceDetailBody({
  service,
  aboutTitle,
  aboutExtra,
  related = [],
  relatedCategory,
  relatedSubcategory,
}: ServiceDetailBodyProps) {
  const process = service.process ?? [];
  const requirements = service.requirements ?? [];
  const faqs = service.faqs ?? [];
  const sections = [
    { id: 'overview', label: 'Overview' },
    ...(process.length ? [{ id: 'process', label: 'Process' }] : []),
    ...(requirements.length ? [{ id: 'documents', label: 'Documents' }] : []),
    ...(faqs.length ? [{ id: 'faqs', label: 'FAQs' }] : []),
  ];

  return (
    <>
      <ServiceSectionNav sections={sections} />
      <div className="fv-wrap space-y-16 py-12 md:space-y-20 md:py-16">
        <section id="overview" className="scroll-mt-32">
          {service.longDescription && (
            <div className="max-w-[820px]">
              <h2 className={H2}>{aboutTitle ?? `About ${service.title}`}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-fv-slate">{service.longDescription}</p>
              {aboutExtra && <div className="mt-6">{aboutExtra}</div>}
            </div>
          )}
          <div className={service.longDescription ? 'mt-12' : undefined}>
            <h2 className={`${H2} mb-6`}>What You Get</h2>
            <ServiceFeatures features={service.features ?? []} benefits={service.benefits} />
          </div>
        </section>

        {process.length > 0 && (
          <section id="process" className="scroll-mt-32">
            <h2 className={`${H2} mb-6`}>Our Simple Process</h2>
            <div className="max-w-[860px]">
              <ProcessTimeline steps={process} />
            </div>
          </section>
        )}

        <section id="inquiry-form" className="scroll-mt-32">
          <ServiceForm serviceId={service.id} serviceTitle={service.title} />
        </section>

        {requirements.length > 0 && (
          <section id="documents" className="scroll-mt-32">
            <div className="rounded-[18px] border border-fv-line bg-fv-wash p-6 md:p-8">
              <h2 className={`${H2} flex items-center gap-3`}>
                <FileText className="h-7 w-7 text-fv-blue" aria-hidden="true" />
                Documents Required
              </h2>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3 text-[15px] text-fv-navy">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-none text-fv-green" aria-hidden="true" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section id="faqs" className="scroll-mt-32">
            <h2 className={`${H2} mb-6`}>Frequently Asked Questions</h2>
            <div className="max-w-[860px]">
              <FAQAccordion faqs={faqs} />
            </div>
          </section>
        )}

        {related.length > 0 && (
          <RelatedServices
            services={related}
            currentServiceId={service.id}
            category={relatedCategory}
            subcategory={relatedSubcategory}
          />
        )}
      </div>
    </>
  );
}
