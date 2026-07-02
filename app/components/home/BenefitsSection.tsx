'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Shield, Zap } from 'lucide-react';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo } from '@/app/lib/api/types';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  Shield,
  Zap,
};

// Default/fallback data
const defaultBenefits = {
  heading: 'Why Choose FinVidhi?',
  subheading: 'All our products are designed to deliver exceptional value',
  items: [
    {
      title: 'Maximum Tax Savings',
      description: 'Businesses save up to 2-7% of their net GST with us every month. Individuals can save up to ₹86,500 by filing their tax returns through our platform.',
      image: '',
      imagePosition: 'right' as const,
      imageAlt: 'Tax Savings',
    },
    {
      title: 'Unparalleled Speed',
      description: 'Experience 3x faster GST filings, 5x faster invoice reconciliation, and 10x faster e-waybill generation. Individuals file their tax returns in under 3 minutes.',
      image: '',
      imagePosition: 'left' as const,
      imageAlt: 'Speed',
    },
    {
      title: 'Accurate Compliance',
      description: 'Our products are designed and tested by in-house tax experts, ensuring every new clause, form, or feature is updated and sent to you over the cloud.',
      image: '',
      imagePosition: 'right' as const,
      imageAlt: 'Compliance',
    },
  ],
};

export default function BenefitsSection({ benefitsData: serverBenefits }: { benefitsData?: HomeInfo['benefits'] }) {
  const [benefitsData, setBenefitsData] = useState<HomeInfo['benefits']>(serverBenefits || defaultBenefits);

  useEffect(() => {
    if (serverBenefits) return;

    const fetchHomeInfo = async () => {
      try {
        const data = await homeInfoService.get();
        if (data?.benefits) {
          setBenefitsData(data.benefits);
        }
      } catch (error) {
        console.error('Error fetching home info:', error);
      }
    };

    fetchHomeInfo();
  }, [serverBenefits]);

  return (
    <section className="mesh relative overflow-hidden py-24 text-white">
      {/* soft brand accents */}
      <div className="pointer-events-none absolute -top-10 right-[8%] w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 left-[6%] w-96 h-96 bg-teal/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-green-light mb-3">Our Advantage</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            {benefitsData.heading}
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {benefitsData.subheading}
          </p>
        </div>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {benefitsData.items.map((benefit, index) => {
            const Icon = iconMap[Object.keys(iconMap)[index % Object.keys(iconMap).length]] || TrendingUp;
            return (
              <StaggerItem key={index}>
                <div className="h-full rounded-3xl p-8 bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-5">
                    <Icon className="w-8 h-8 text-brand-green-light" />
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed text-justify">
                    {benefit.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
