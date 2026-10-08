import type { ReactNode } from 'react';
import LightHero from '@/app/components/fv/LightHero';

/**
 * Shared layout for legal pages (Privacy, Terms, Cookies).
 * Server component — static content, fully prerendered for SEO. L3 light hero + sticky TOC.
 */
interface LegalSectionDef {
  id: string;
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSectionDef[];
}

export default function LegalPage({ title, intro, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="bg-white">
      <LightHero title={title} subtitle={intro} breadcrumb={[{ label: 'Home', href: '/' }, { label: title }]}>
        <p className="inline-flex items-center rounded-full border border-fv-line bg-white px-4 py-1.5 text-sm text-fv-slate">
          Last updated: {lastUpdated}
        </p>
      </LightHero>

      <div className="fv-wrap grid gap-10 py-12 lg:grid-cols-[260px_1fr] lg:py-16">
        <nav aria-label="Table of contents" className="lg:sticky lg:top-24 lg:self-start">
          <div className="fv-card p-5">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fv-slate">On this page</h2>
            <ol className="space-y-2 text-sm">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex gap-2 text-fv-slate hover:text-fv-blue-d">
                    <span className="font-semibold text-fv-navy">{i + 1}.</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 max-w-[720px]">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.02em] text-fv-navy">
                  {i + 1}. {section.heading}
                </h2>
                <div className="space-y-4 leading-relaxed text-fv-slate [&_a]:font-semibold [&_a]:text-fv-blue-d [&_strong]:text-fv-navy [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 rounded-[18px] border border-fv-line bg-fv-wash p-8 text-center">
            <h2 className="mb-2 text-xl font-extrabold text-fv-navy">Questions about this policy?</h2>
            <p className="mb-4 text-fv-slate">
              Reach us at{' '}
              <a href="mailto:finvidhi@gmail.com" className="font-semibold text-fv-blue-d hover:underline">
                finvidhi@gmail.com
              </a>{' '}
              or call{' '}
              <a href="tel:+919625675722" className="font-semibold text-fv-blue-d hover:underline">
                +91 96256 75722
              </a>
              .
            </p>
            <p className="text-sm text-fv-slate">
              FinVidhi, D-239, First Floor, Flat No-06, Street-10, Laxmi Nagar, Delhi — 110092, India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
