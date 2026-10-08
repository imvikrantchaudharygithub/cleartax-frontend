'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Eye, ShieldCheck } from 'lucide-react';
import Section from '../fv/Section';
import SectionHead from '../fv/SectionHead';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo } from '@/app/lib/api/types';

const ICONS = [Eye, ShieldCheck, BadgeCheck];

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
    <Section>
      <SectionHead align="center" title={benefitsData.heading} subtitle={benefitsData.subheading} />
      <ul className="fv-card grid divide-y divide-fv-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {benefitsData.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li key={`${item.title}-${i}`} className="px-6 py-[26px] text-center">
              <span className="mx-auto grid h-[54px] w-[54px] place-items-center rounded-full border-2 border-fv-blue/20 bg-fv-blue-50 text-fv-blue-d">
                <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="mt-3.5 text-[15.5px] font-bold text-fv-navy">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-[1.6] text-fv-slate">{item.description}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
