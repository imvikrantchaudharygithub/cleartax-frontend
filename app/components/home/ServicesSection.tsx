'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import Card from '../ui/Card';
import { Receipt, Building2, Calculator, Award, ArrowRight } from 'lucide-react';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo } from '@/app/lib/api/types';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  Receipt,
  Building2,
  Calculator,
  Award,
};

// Default/fallback data
const defaultServices = {
  heading: 'Professional Services',
  subheading: 'From business registration to tax compliance, we handle all your professional service needs with expert guidance',
  cards: [
    {
      title: 'GST Services',
      description: 'Complete GST registration, filing, and compliance solutions for your business.',
      features: ['GST Registration', 'Return Filing', 'Annual Returns', 'LUT Filing'],
      href: '/services/gst',
      icon: 'Receipt',
      colorGradient: 'from-accent to-primary',
    },
    {
      title: 'Business Registration',
      description: 'Start your business with expert guidance on company formation and registration.',
      features: ['Private Limited', 'LLP Registration', 'OPC Formation', 'Proprietorship'],
      href: '/services/registration',
      icon: 'Building2',
      colorGradient: 'from-primary to-accent',
    },
    {
      title: 'Income Tax Services',
      description: 'Expert income tax filing and compliance for individuals and businesses.',
      features: ['ITR Filing', 'TDS Returns', 'Tax Planning', 'Notice Handling'],
      href: '/services/income-tax',
      icon: 'Calculator',
      colorGradient: 'from-success to-primary',
    },
    {
      title: 'Trademark & IP',
      description: 'Protect your brand with trademark registration and IP services.',
      features: ['Trademark Registration', 'Copyright', 'Patent Filing', 'Design Registration'],
      href: '/services/trademarks',
      icon: 'Award',
      colorGradient: 'from-warning to-accent',
    },
  ],
  ctaButtonText: 'View All Services',
  ctaButtonLink: '/services',
};

export default function ServicesSection() {
  const [servicesData, setServicesData] = useState(defaultServices);

  useEffect(() => {
    // Fetch home info from API
    const fetchHomeInfo = async () => {
      try {
        const data = await homeInfoService.get();
        if (data?.services) {
          setServicesData(data.services);
        }
      } catch (error) {
        console.error('Error fetching home info:', error);
        // Use default data on error
      }
    };

    fetchHomeInfo();
  }, []);
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
              {servicesData.heading}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {servicesData.subheading}
            </p>
          </motion.div>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesData.cards.map((service, index) => {
            const Icon = iconMap[service.icon] || Receipt;
            return (
              <StaggerItem key={index}>
                <Link href={service.href}>
                  <Card hoverable className="h-full flex flex-col group">
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${service.colorGradient} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-heading font-semibold text-xl text-primary mb-2 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-grow text-sm">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-xs text-gray-600">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <motion.div
                      className="flex items-center text-accent font-medium text-sm mt-auto pt-4 border-t border-gray-100"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Explore Services
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.div>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link href={servicesData.ctaButtonLink}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              {servicesData.ctaButtonText}
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}


