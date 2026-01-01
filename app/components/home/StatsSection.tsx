'use client';

import CounterAnimation from '../animations/CounterAnimation';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import { FileText, Users, TrendingUp, FileCheck } from 'lucide-react';

const stats = [
  {
    icon: FileText,
    value: 10000000,
    label: 'Invoices Processed',
    suffix: '+',
  },
  {
    icon: Users,
    value: 50000,
    label: 'Businesses Trusted',
    suffix: '+',
  },
  {
    icon: TrendingUp,
    value: 200000000000,
    label: 'Trade Value',
    prefix: '₹',
    suffix: 'Cr+',
  },
  {
    icon: FileCheck,
    value: 1500000,
    label: 'Returns Filed',
    suffix: '+',
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={index}>
                <div className="text-center p-8 bg-light-blue rounded-xl hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-primary mb-2">
                    {stat.suffix === 'Cr+' ? (
                      <CounterAnimation
                        end={2000}
                        format="number"
                        suffix="Cr+"
                        prefix="₹"
                      />
                    ) : (
                      <CounterAnimation
                        end={stat.value > 1000000 ? stat.value / 1000000 : stat.value > 1000 ? stat.value / 1000 : stat.value}
                        format="number"
                        suffix={stat.value > 1000000 ? 'M' : stat.value > 1000 ? 'K' : ''}
                        prefix={stat.prefix}
                      />
                    )}
                    {stat.suffix && !stat.suffix.includes('Cr') && stat.suffix}
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

