import type { HomeInfo } from '@/app/lib/api/types';

/** Fallbacks used when /home-info is unavailable (copied from the pre-L3 components). */
export const DEFAULT_BANNER: HomeInfo['banner'] = {
  heading: 'Your Complete Tax & Compliance Solution',
  description:
    'Calculate, Comply, and Save with Confidence. Professional tax calculators, compliance dashboard, and expert guidance all in one place.',
  button1Text: 'Request Callback',
  button2Text: 'Connect on WhatsApp',
  badge: 'Trusted by 50,000+ Businesses',
  checklistItems: ['10M+ Invoices Processed', '50K+ Businesses Trust Us', '100% Accurate Calculations'],
  heroImage: '',
  heroImageAlt: 'Tax Solutions',
  heroImages: [],
  heroChips: [
    { value: '15L+', label: 'Returns Filed' },
    { value: '100%', label: 'Accurate' },
  ],
};

export const DEFAULT_SERVICES: HomeInfo['services'] = {
  heading: 'Professional Services',
  subheading:
    'From business registration to tax compliance, we handle all your professional service needs with expert guidance',
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
      colorGradient: 'from-primary to-teal',
    },
    {
      title: 'Income Tax Services',
      description: 'Expert income tax filing and compliance for individuals and businesses.',
      features: ['ITR Filing', 'TDS Returns', 'Tax Planning', 'Notice Handling'],
      href: '/services/income-tax',
      icon: 'Calculator',
      colorGradient: 'from-teal to-success',
    },
    {
      title: 'Trademark & IP',
      description: 'Protect your brand with trademark registration and IP services.',
      features: ['Trademark Registration', 'Copyright', 'Patent Filing', 'Design Registration'],
      href: '/services/trademarks',
      icon: 'Award',
      colorGradient: 'from-brand-blue-light to-accent',
    },
  ],
  ctaButtonText: 'View All Services',
  ctaButtonLink: '/services',
};

export const DEFAULT_STATS: NonNullable<HomeInfo['stats']> = {
  items: [
    { value: 10, suffix: 'M+', label: 'Invoices Processed', icon: 'FileText' },
    { value: 50, suffix: 'K+', label: 'Businesses Trusted', icon: 'Users' },
    { value: 27, prefix: '₹', suffix: 'Cr+', label: 'Trade Value', icon: 'TrendingUp' },
    { value: 15, suffix: 'L+', label: 'Returns Filed', icon: 'FileCheck' },
  ],
};
