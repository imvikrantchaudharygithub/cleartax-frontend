'use client';

import { useEffect, useState } from 'react';
import CounterAnimation from '../animations/CounterAnimation';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo } from '@/app/lib/api/types';

// Default/fallback stats (used until the admin saves values, or if the fetch fails).
const defaultStats: NonNullable<HomeInfo['stats']> = {
  items: [
    { value: 10, suffix: 'M+', label: 'Invoices Processed', icon: 'FileText' },
    { value: 50, suffix: 'K+', label: 'Businesses Trusted', icon: 'Users' },
    { value: 27, prefix: '₹', suffix: 'Cr+', label: 'Trade Value', icon: 'TrendingUp' },
    { value: 15, suffix: 'L+', label: 'Returns Filed', icon: 'FileCheck' },
  ],
};

export default function StatsSection({ statsData: serverStats }: { statsData?: HomeInfo['stats'] }) {
  const [statsData, setStatsData] = useState<NonNullable<HomeInfo['stats']>>(
    serverStats && serverStats.items?.length ? serverStats : defaultStats
  );

  useEffect(() => {
    if (serverStats && serverStats.items?.length) return;

    const fetchHomeInfo = async () => {
      try {
        const data = await homeInfoService.get();
        if (data?.stats?.items?.length) {
          setStatsData(data.stats);
        }
      } catch (error) {
        console.error('Error fetching home info (stats):', error);
      }
    };

    fetchHomeInfo();
  }, [serverStats]);

  return (
    <section className="relative z-20 -mt-16 md:-mt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="rounded-3xl bg-white shadow-card-hover border border-gray-100 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 overflow-hidden">
          {statsData.items.map((stat, index) => (
            <StaggerItem key={index}>
              <div className="p-8 text-center group">
                <div className="text-3xl md:text-4xl font-heading font-extrabold text-gradient">
                  <CounterAnimation
                    end={stat.value}
                    format="number"
                    prefix={stat.prefix || ''}
                    suffix={stat.suffix || ''}
                    decimals={Number.isInteger(stat.value) ? 0 : 1}
                  />
                </div>
                <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
