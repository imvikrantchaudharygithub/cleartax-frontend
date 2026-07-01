'use client';

import { useEffect, useState } from 'react';
import CounterAnimation from '../animations/CounterAnimation';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import { FileText, Users, TrendingUp, FileCheck, Award, Building2, Receipt, Calculator } from 'lucide-react';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo, StatIcon } from '@/app/lib/api/types';

// Icon name -> component. Keys must match the StatIcon union / backend enum.
const iconMap: Record<StatIcon, React.ComponentType<{ className?: string }>> = {
  FileText,
  Users,
  TrendingUp,
  FileCheck,
  Award,
  Building2,
  Receipt,
  Calculator,
};

// Per-card icon background, cycled by index to preserve the original look.
const iconBgs = ['bg-accent/10', 'bg-teal/10', 'bg-primary/10', 'bg-success/10'];

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
    <section className="py-20 bg-white relative">
      <div className="section-divider absolute top-0 left-0 right-0"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.items.map((stat, index) => {
            const Icon = iconMap[stat.icon] || FileText;
            return (
              <StaggerItem key={index}>
                <div className="text-center p-8 bg-gradient-to-br from-[#E8F4FB] to-[#EDF5F1] rounded-2xl hover:shadow-card-hover transition-all duration-300 border border-gray-100/50 cursor-pointer group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${iconBgs[index % iconBgs.length]} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-primary mb-2">
                    <CounterAnimation
                      end={stat.value}
                      format="number"
                      prefix={stat.prefix || ''}
                      suffix={stat.suffix || ''}
                      decimals={Number.isInteger(stat.value) ? 0 : 1}
                    />
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
