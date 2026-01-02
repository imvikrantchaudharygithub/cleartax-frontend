'use client';

import dynamic from 'next/dynamic';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import ProductsGrid from '../components/home/ProductsGrid';
import ServicesSection from '../components/home/ServicesSection';
import BenefitsSection from '../components/home/BenefitsSection';
import CTASection from '../components/home/CTASection';

// Dynamically import heavy sections with no SSR to prevent blocking
const IPOSection = dynamic(() => import('../components/home/IPOSection'), {
  ssr: false,
});

const LegalSection = dynamic(() => import('../components/home/LegalSection'), {
  ssr: false,
});

const BankingFinanceSection = dynamic(() => import('../components/home/BankingFinanceSection'), {
  ssr: false,
});

const TeamSection = dynamic(() => import('../components/home/TeamSection'), {
  ssr: false,
});

const TestimonialsSection = dynamic(() => import('../components/home/TestimonialsSection'), {
  ssr: false,
});

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

