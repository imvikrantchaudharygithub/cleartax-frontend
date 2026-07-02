'use client';

import { useState, useEffect } from 'react';
import { LucideIcon, Clock, IndianRupee, CheckCircle, FileText } from 'lucide-react';
import Breadcrumb from '../common/Breadcrumb';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { motion } from 'framer-motion';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { contactService } from '@/app/lib/api';

interface ServiceHeroProps {
  title: string;
  shortDescription: string;
  /** Lucide icon component – omit when rendering from Server Component; use iconName instead. */
  icon?: LucideIcon;
  /** Icon name (e.g. "FileText") for Server Component parents – resolved client-side. */
  iconName?: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  } | null;
  duration?: string;
  category: string;
  categorySlug: string;
  onGetStarted?: () => void;
  /** When set, Get Started button scrolls to this element id (for Server Component parents that cannot pass onGetStarted). */
  scrollTargetId?: string;
}

export default function ServiceHero({
  title,
  shortDescription,
  icon: IconProp,
  iconName,
  price,
  duration,
  category,
  categorySlug,
  onGetStarted,
  scrollTargetId,
}: ServiceHeroProps) {
  const Icon = IconProp ?? (iconName ? getIconFromName(iconName) : FileText);

  // Phone number is bound to the admin-managed Contact details, not hardcoded.
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    contactService
      .get()
      .then((info) => {
        if (active && info?.phone) setContactPhone(info.phone);
      })
      .catch(() => {
        /* leave unset; the call line is simply hidden if contact info is unavailable */
      });
    return () => {
      active = false;
    };
  }, []);
  const telHref = contactPhone ? `tel:${contactPhone.replace(/[^\d+]/g, '')}` : '';

  const handleGetStarted =
    onGetStarted ??
    (scrollTargetId
      ? () => document.getElementById(scrollTargetId!)?.scrollIntoView({ behavior: 'smooth' })
      : undefined);
  return (
    <div className="mesh relative overflow-hidden py-12">
      <div className="pointer-events-none absolute -top-16 right-[10%] w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-20 left-[8%] w-80 h-80 bg-teal/20 rounded-full blur-3xl"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb
          dark
          items={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: category, href: `/services/${categorySlug}` },
            { label: title },
          ]}
        />

        <div className="mt-8 grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Content */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon and Category */}
            <div className="flex items-center gap-4 mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <Badge variant="info">{category}</Badge>
            </div>

            {/* Title */}
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
              {title}
            </h1>

            {/* Short Description */}
            <p className="text-lg md:text-xl text-white/75 leading-relaxed">
              {shortDescription}
            </p>

            {/* Key Features */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center text-white/85">
                <CheckCircle className="w-5 h-5 text-brand-green-light mr-2" />
                <span>Expert Assistance</span>
              </div>
              <div className="flex items-center text-white/85">
                <CheckCircle className="w-5 h-5 text-brand-green-light mr-2" />
                <span>100% Online Process</span>
              </div>
              <div className="flex items-center text-white/85">
                <CheckCircle className="w-5 h-5 text-brand-green-light mr-2" />
                <span>Money Back Guarantee</span>
              </div>
            </div>
          </motion.div>

          {/* Right CTA Card */}
          <motion.div
            className="lg:sticky lg:top-24"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-card p-6 border-2 border-accent/20">
              {/* Price */}
              {price && (
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <IndianRupee className="w-5 h-5 text-gray-600" />
                    <span className="text-3xl font-bold text-primary">
                      {price.min === price.max
                        ? price.min.toLocaleString('en-IN')
                        : `${price.min.toLocaleString('en-IN')} - ${price.max.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    All-inclusive pricing
                  </p>
                </div>
              )}

              {/* Duration */}
              {duration && (
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{duration}</span>
                </div>
              )}

              {/* CTA Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full mb-3"
                onClick={handleGetStarted}
              >
                Get Started Now
              </Button>

              {contactPhone && (
                <p className="text-xs text-center text-gray-500">
                  or call us at{' '}
                  <a href={telHref} className="text-accent hover:underline">
                    {contactPhone}
                  </a>
                </p>
              )}

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>10,000+ Happy Customers</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Verified CA/CS Professionals</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Secure Payment Gateway</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}



