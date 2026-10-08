import Link from 'next/link';
import { ArrowRight, Calculator } from 'lucide-react';
import { ButtonLink } from './Button';

interface CTALink {
  label: string;
  href: string;
}

interface CTABannerProps {
  title: string;
  text: string;
  note?: string;
  primary: CTALink;
  secondary?: CTALink;
}

/** Navy gradient call-to-action panel (design 3 `S.cta1`). */
export default function CTABanner({ title, text, note, primary, secondary }: CTABannerProps) {
  return (
    <section className="pb-[88px]">
      <div className="fv-wrap">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-[20px] bg-[radial-gradient(420px_260px_at_100%_100%,rgba(37,135,196,.45),transparent_70%),linear-gradient(120deg,#1E2C59,#175176)] px-6 py-10 md:grid-cols-[1.3fr_auto] md:px-[52px] md:py-12">
          <div className="min-w-0">
            <h2 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-white sm:text-[36px]">{title}</h2>
            <p className="mt-2.5 max-w-[560px] text-base leading-relaxed text-white/80">{text}</p>
            {note && <p className="mt-3.5 text-[13px] text-white/60">{note}</p>}
          </div>
          <div className="flex flex-wrap gap-2.5 md:flex-col">
            <ButtonLink href={primary.href}>
              {primary.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            {secondary && (
              // Outline-on-navy button, as the mockup's `.btn-w`.
              <Link
                href={secondary.href}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-white/70 px-5 py-2.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-fv-navy"
              >
                <Calculator className="h-4 w-4" aria-hidden="true" />
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
