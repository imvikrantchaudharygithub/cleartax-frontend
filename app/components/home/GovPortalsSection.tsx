'use client';

import { motion } from 'framer-motion';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import Card from '../ui/Card';
import {
  Landmark,
  Receipt,
  Building2,
  Rocket,
  Factory,
  ExternalLink,
} from 'lucide-react';

interface GovPortal {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Official portals only. To add/change one, edit this array — deliberately
// not admin-managed (see docs/superpowers/specs/2026-07-09-gov-portals-section-design.md).
const GOV_PORTALS: GovPortal[] = [
  {
    name: 'Income Tax e-Filing',
    description: 'ITR filing, PAN services & refunds',
    href: 'https://www.incometax.gov.in',
    icon: Landmark,
  },
  {
    name: 'GST Portal',
    description: 'GST registration & return filing',
    href: 'https://www.gst.gov.in',
    icon: Receipt,
  },
  {
    name: 'Ministry of Corporate Affairs',
    description: 'Company & LLP filings, name search',
    href: 'https://www.mca.gov.in',
    icon: Building2,
  },
  {
    name: 'Startup India',
    description: 'DPIIT recognition & startup benefits',
    href: 'https://www.startupindia.gov.in',
    icon: Rocket,
  },
  {
    name: 'Udyam Registration',
    description: 'MSME / Udyam registration',
    href: 'https://udyamregistration.gov.in',
    icon: Factory,
  },
];

export default function GovPortalsSection() {
  return (
    <section className="py-20 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-accent mb-3">
              Official Resources
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
              Official Government Portals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quick access to the government portals we work with every day
            </p>
          </motion.div>
        </div>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {GOV_PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <StaggerItem key={portal.name} className="h-full">
                <a
                  href={portal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${portal.name} — opens official government portal in a new tab`}
                  className="block h-full"
                >
                  <Card
                    hoverable
                    className="h-full flex flex-col group border border-gray-100/80 hover:border-accent/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" />
                    </div>
                    <h3 className="font-heading font-semibold text-base text-primary mb-1 group-hover:text-accent transition-colors">
                      {portal.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {portal.description}
                    </p>
                  </Card>
                </a>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <p className="text-center text-xs text-gray-500 mt-8">
          These are official Government of India portals. FinVidhi is not affiliated with or endorsed by them.
        </p>
      </div>
    </section>
  );
}
