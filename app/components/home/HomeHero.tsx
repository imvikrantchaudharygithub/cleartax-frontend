import type { ReactNode } from 'react';
import { BadgeCheck } from 'lucide-react';
import SearchBar from '@/app/components/fv/SearchBar';
import { heroSubline, splitHeading } from '@/app/lib/fv/text';

interface HomeHeroProps {
  banner: { heading: string; description: string; badge?: string };
  /** Solution rail that sits on the hero's bottom edge (Solutions plan). */
  rail?: ReactNode;
}

/** Centred home hero, design 3 "Icon Rail" (`.v3h`): badge, one-line H1, subline, big search. */
export default function HomeHero({ banner, rail }: HomeHeroProps) {
  const [first, second] = splitHeading(banner.heading);
  const subline = heroSubline(banner.description);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(700px_300px_at_50%_0%,#E8F4FB,transparent_70%),linear-gradient(180deg,#F3F9FD,#FFFFFF)] pt-[30px] text-center sm:pt-[52px]">
      <div className="fv-wrap">
        {banner.badge && (
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D6E4FB] bg-white px-3 py-1.5 text-[13px] font-semibold text-fv-blue-d">
            <BadgeCheck className="h-4 w-4 flex-none" aria-hidden="true" />
            {banner.badge}
          </span>
        )}
        <h1 className="text-[32px] font-extrabold leading-[1.08] tracking-tight text-fv-navy sm:text-[40px] lg:text-[52px]">
          {first}
          {second && (
            <>
              {' '}
              <span className="text-fv-blue">{second}</span>
            </>
          )}
        </h1>
        {subline && (
          <p className="mx-auto mt-3.5 max-w-[620px] text-[15px] text-fv-slate sm:text-[17px]">{subline}</p>
        )}
        <SearchBar id="home-search" size="lg" className="mx-auto mt-[26px] max-w-[680px]" />
        {rail ? <div className="mt-6 md:mt-[38px]">{rail}</div> : <div className="h-14" aria-hidden="true" />}
      </div>
    </section>
  );
}
