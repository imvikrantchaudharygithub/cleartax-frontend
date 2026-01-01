import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import ProductsGrid from '../components/home/ProductsGrid';
import ServicesSection from '../components/home/ServicesSection';
import IPOSection from '../components/home/IPOSection';
import LegalSection from '../components/home/LegalSection';
import BankingFinanceSection from '../components/home/BankingFinanceSection';
import BenefitsSection from '../components/home/BenefitsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';
import TeamSection from '../components/home/TeamSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <IPOSection />
      <LegalSection />
      <BankingFinanceSection />
      <ProductsGrid />
      <BenefitsSection />
      <TeamSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

