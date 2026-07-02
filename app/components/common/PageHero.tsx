'use client';

import { ReactNode } from 'react';

/**
 * Shared inner-page hero band — the Variant B "mesh" treatment.
 * Dark brand gradient (existing palette only), glass icon tile, white title.
 * Page bodies below stay light; this is just the header band.
 */
interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional extra content rendered under the subtitle (search bar, filters). */
  children?: ReactNode;
}

export default function PageHero({ title, subtitle, icon: Icon, children }: PageHeroProps) {
  return (
    <section className="mesh relative overflow-hidden py-14 md:py-16">
      {/* soft brand accents */}
      <div className="pointer-events-none absolute -top-16 right-[10%] w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-20 left-[8%] w-80 h-80 bg-teal/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {Icon && (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
        )}
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-white/75 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
