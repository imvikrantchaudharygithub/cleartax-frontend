import { ReactNode } from 'react';

/**
 * Shared layout for legal pages (Privacy, Terms, Cookies).
 * Server component — static content, fully prerendered for SEO.
 * Header follows the site-wide Variant B mesh treatment.
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
    <div className="min-h-screen bg-white">
      {/* Mesh hero band */}
      <section className="mesh relative overflow-hidden py-14 md:py-16">
        <div className="pointer-events-none absolute -top-16 right-[10%] w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-20 left-[8%] w-80 h-80 bg-teal/20 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-3">{title}</h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto">{intro}</p>
          <p className="mt-4 inline-flex items-center px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-white/85">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Table of contents */}
        <nav
          aria-label="Table of contents"
          className="mb-12 rounded-2xl border border-gray-100 bg-gradient-to-br from-light-blue/40 to-white shadow-card p-6"
        >
          <h2 className="font-heading font-semibold text-lg text-primary mb-4">On this page</h2>
          <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2 list-decimal list-inside text-accent">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-heading font-bold text-2xl text-primary mb-4">
                {i + 1}. {s.heading}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-gray-800">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        {/* Contact strip */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-light-blue/50 to-white border border-gray-100 shadow-card p-8 text-center">
          <h2 className="font-heading font-bold text-xl text-primary mb-2">Questions about this policy?</h2>
          <p className="text-gray-600 mb-4">
            Reach us at{' '}
            <a href="mailto:finvidhi@gmail.com" className="text-accent hover:underline">
              finvidhi@gmail.com
            </a>{' '}
            or call{' '}
            <a href="tel:+919625675722" className="text-accent hover:underline">
              +91 96256 75722
            </a>
            .
          </p>
          <p className="text-sm text-gray-500">
            FinVidhi, D-239, First Floor, Flat No-06, Street-10, Laxmi Nagar, Delhi — 110092, India
          </p>
        </div>
      </div>
    </div>
  );
}
