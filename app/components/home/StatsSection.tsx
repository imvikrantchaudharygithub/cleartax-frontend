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
    color: 'from-accent to-brand-blue-light',
    iconBg: 'bg-accent/10',
  },
  {
    icon: Users,
    value: 50000,
    label: 'Businesses Trusted',
    suffix: '+',
    color: 'from-teal to-brand-green-muted',
    iconBg: 'bg-teal/10',
  },
  {
    icon: TrendingUp,
    value: 200000000000,
    label: 'Trade Value',
    prefix: '₹',
    suffix: 'Cr+',
    color: 'from-primary to-accent',
    iconBg: 'bg-primary/10',
  },
  {
    icon: FileCheck,
    value: 1500000,
    label: 'Returns Filed',
    suffix: '+',
    color: 'from-success to-brand-green-light',
    iconBg: 'bg-success/10',
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-white relative">
      <div className="section-divider absolute top-0 left-0 right-0"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={index}>
                <div className="text-center p-8 bg-gradient-to-br from-[#E8F4FB] to-[#EDF5F1] rounded-2xl hover:shadow-card-hover transition-all duration-300 border border-gray-100/50 cursor-pointer group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.iconBg} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
