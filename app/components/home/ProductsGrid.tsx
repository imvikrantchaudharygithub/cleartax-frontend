'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import Card from '../ui/Card';
import { Calculator, Receipt, CreditCard, Home, FileText, BarChart3, ArrowRight } from 'lucide-react';

const products = [
  {
    icon: Calculator,
    title: 'Income Tax Calculator',
    description: 'Calculate your tax liability with precision across all income sources.',
    features: ['Multiple tax regimes', 'Deduction optimizer', 'Instant results'],
    href: '/calculators/income-tax',
  },
  {
    icon: Receipt,
    title: 'GST Calculator',
    description: 'Accurate GST calculations for all transaction types and rates.',
    features: ['B2B & B2C support', 'IGST/SGST breakdown', 'Invoice ready'],
    href: '/calculators/gst',
  },
  {
    icon: CreditCard,
    title: 'EMI Calculator',
    description: 'Plan your loans with detailed EMI and amortization schedules.',
    features: ['All loan types', 'Prepayment scenarios', 'Interest breakdown'],
    href: '/calculators/emi',
  },
  {
    icon: Home,
    title: 'HRA Calculator',
    description: 'Maximize your HRA exemption with accurate calculations.',
    features: ['Metro/Non-metro', 'Tax saving tips', 'Exemption breakdown'],
    href: '/calculators/hra',
  },
  {
    icon: FileText,
    title: 'TDS Calculator',
    description: 'Calculate TDS deductions for all payment types.',
    features: ['Multiple TDS types', 'Quarterly breakdown', 'Threshold info'],
    href: '/calculators/tds',
  },
  {
    icon: BarChart3,
    title: 'Compliance Tracker',
    description: 'Stay on top of all your tax and compliance deadlines.',
    features: ['Deadline alerts', 'Document management', 'Filing status'],
    href: '/compliance',
  },
];

export default function ProductsGrid() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-light-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
            Powerful Tax & Compliance Tools
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your taxes and compliance requirements in one place
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <StaggerItem key={index}>
                <Link href={product.href}>
                  <Card hoverable className="h-full flex flex-col">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-lg mb-4">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-heading font-semibold text-xl text-primary mb-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-grow">
                      {product.description}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center text-accent font-medium mt-auto pt-4 border-t border-gray-100">
                      Try Calculator
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

