import { getHomePageData } from './homepage-data';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import ProductsGrid from '../components/home/ProductsGrid';
import ServicesSection from '../components/home/ServicesSection';
import BenefitsSection from '../components/home/BenefitsSection';
import CTASection from '../components/home/CTASection';
import IPOSection from '../components/home/IPOSection';
import LegalSection from '../components/home/LegalSection';
import BankingFinanceSection from '../components/home/BankingFinanceSection';
import TeamSection from '../components/home/TeamSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

export const revalidate = 300;

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <>
      <HeroSection bannerData={data.homeInfo?.banner} />
      <StatsSection />
      <ServicesSection servicesData={data.homeInfo?.services} />
      <IPOSection serverData={data.ipoData} />
      <LegalSection serverData={data.legalData} />
      <BankingFinanceSection serverData={data.bankingData} />
      <ProductsGrid />
      <BenefitsSection benefitsData={data.homeInfo?.benefits} />
      <TeamSection serverData={data.teamMembers} />
      <TestimonialsSection serverData={data.testimonials} />
      <CTASection />
    </>
  );
}
