import { getHomePageData } from './homepage-data';
import HomeHero from '../components/home/HomeHero';
import PopularServices from '../components/home/PopularServices';
import SolutionRail from '../components/solutions/SolutionRail';
import AreaTrio from '../components/home/AreaTrio';
// Temporarily hidden — re-enable together with <ProductsGrid /> below.
// import ProductsGrid from '../components/home/ProductsGrid';
import BenefitsSection from '../components/home/BenefitsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import StatsStrip from '../components/fv/StatsStrip';
import CTABanner from '../components/fv/CTABanner';
import { buildExplorerAreas } from '../lib/fv/explorer';
import { DEFAULT_BANNER, DEFAULT_STATS } from '../lib/fv/homeDefaults';
import { fetchPublishedSolutions, fetchSolution } from '../lib/solutions/publicApi';
import { popularServiceItems } from '../lib/solutions/popular';
import type { HomeInfo, SolutionDetail } from '../lib/api/types';
import type { Metadata } from 'next';

// Home = design 3 "Icon Rail" (spec 2026-10-05-l3-site-redesign, D1 revised 2026-10-06).
// The previous HeroSection, StatsSection, ServicesSection, IPO/Legal/BankingFinance sections,
// TeamSection, GovPortalsSection, CTASection and ProductsGrid are no longer rendered here;
// their files are kept on disk.

export const metadata: Metadata = {
  title: { absolute: 'FinVidhi - Your Complete Tax & Compliance Solution' },
  description:
    'Smart finance and strong compliance for Indian businesses. GST, income tax, audit, business registration, and expert advisory — all in one place.',
  alternates: { canonical: '/' },
};

export const revalidate = 300;

/**
 * "Most popular services": the ★ items of ALL published solutions (not only home ones). The list
 * endpoint has no items, so each solution's detail is fetched in parallel; a failed fetch (null)
 * just drops that solution.
 */
async function getPopularServices() {
  const published = await fetchPublishedSolutions();
  const details = await Promise.all(published.map((solution) => fetchSolution(solution.slug)));
  return popularServiceItems(details.filter((detail): detail is SolutionDetail => detail !== null));
}

export default async function HomePage() {
  const [data, popular] = await Promise.all([getHomePageData(), getPopularServices()]);
  const banner: HomeInfo['banner'] = data.homeInfo?.banner ?? DEFAULT_BANNER;
  const stats = data.homeInfo?.stats?.items?.length ? data.homeInfo.stats.items : DEFAULT_STATS.items;
  const areas = buildExplorerAreas([], [
    { key: 'ipo', subcategories: data.ipoData?.subcategories ?? [] },
    { key: 'legal', subcategories: data.legalData?.subcategories ?? [] },
    { key: 'banking-finance', subcategories: data.bankingData?.subcategories ?? [] },
  ]);

  return (
    <>
      {/* A4: no rail element at all without home solutions (keeps the hero's 56px spacer). */}
      <HomeHero banner={banner} rail={data.solutions.length ? <SolutionRail solutions={data.solutions} /> : undefined} />
      <div className="border-t border-fv-line">
        <StatsStrip items={stats} />
      </div>
      <PopularServices items={popular} />
      <AreaTrio areas={areas} />
      {/* Calculator section temporarily hidden — uncomment to show again. */}
      {/* <ProductsGrid /> */}
      <BenefitsSection benefitsData={data.homeInfo?.benefits} />
      <TestimonialsSection serverData={data.testimonials} />
      <div className="h-[88px]" aria-hidden="true" />
      <CTABanner
        title="Ready to Simplify Your Taxes?"
        text="Join 50,000+ businesses and individuals who trust FinVidhi for their tax and compliance needs. Start for free today!"
        note="No credit card required • Free forever • Setup in 2 minutes"
        primary={{ label: 'View Services', href: '/services' }}
        secondary={{ label: 'Explore Calculators', href: '/calculators' }}
      />
    </>
  );
}
