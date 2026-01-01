'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import StaggerContainer, { StaggerItem } from '@/app/components/animations/StaggerContainer';
import Card from '@/app/components/ui/Card';
import Input from '@/app/components/ui/Input';
import { Calculator, Receipt, CreditCard, Home, FileText, Search } from 'lucide-react';

const calculators = [
  {
    id: 'income-tax',
    icon: Calculator,
    title: 'Income Tax Calculator',
    description: 'Calculate your income tax liability with precision. Supports both old and new tax regimes with comprehensive deduction planning.',
    category: 'Tax',
    href: '/calculators/income-tax',
  },
  {
    id: 'gst',
    icon: Receipt,
    title: 'GST Calculator',
    description: 'Accurate GST calculations for all transaction types. Get detailed breakdowns of IGST, SGST, and CGST for your invoices.',
    category: 'GST',
    href: '/calculators/gst',
  },
  {
    id: 'emi',
    icon: CreditCard,
    title: 'EMI Calculator',
    description: 'Plan your loans with detailed EMI schedules. View amortization tables and explore prepayment scenarios to save on interest.',
    category: 'Loan',
    href: '/calculators/emi',
  },
  {
    id: 'hra',
    icon: Home,
    title: 'HRA Calculator',
    description: 'Maximize your HRA exemption with accurate calculations. Compare metro vs non-metro benefits and optimize your tax savings.',
    category: 'Tax',
    href: '/calculators/hra',
  },
  {
    id: 'tds',
    icon: FileText,
    title: 'TDS Calculator',
    description: 'Calculate TDS deductions for various payment types. Get quarterly breakdowns and threshold information for compliance.',
    category: 'Tax',
    href: '/calculators/tds',
  },
];

export default function CalculatorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = calculators.filter(calc =>
    calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    calc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary mb-4">
              Tax & Compliance Calculators
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Professional-grade calculators for all your tax, GST, and financial planning needs.
              Accurate, instant, and easy to use.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search calculators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefixIcon={<Search className="w-5 h-5" />}
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Calculator Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCalculators.map((calculator) => {
            const Icon = calculator.icon;
            return (
              <StaggerItem key={calculator.id}>
                <Link href={calculator.href}>
                  <Card hoverable className="h-full flex flex-col">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-xl mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                        {calculator.category}
                      </span>
                    </div>

                    <h3 className="font-heading font-semibold text-xl text-primary mb-3">
                      {calculator.title}
                    </h3>

                    <p className="text-gray-600 mb-6 flex-grow">
                      {calculator.description}
                    </p>

                    <motion.div
                      className="inline-flex items-center text-accent font-medium mt-auto"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Open Calculator
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.div>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* No Results */}
        {filteredCalculators.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 text-lg">
              No calculators found matching your search.
            </p>
          </motion.div>
        )}

        {/* Info Section */}
        <ScrollReveal direction="up">
          <div className="mt-16 p-8 bg-white rounded-2xl shadow-card">
            <h2 className="font-heading font-bold text-2xl text-primary mb-4">
              Why Use Our Calculators?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-primary mb-2">100% Accurate</h3>
                <p className="text-gray-600">
                  All calculations are verified by tax experts and updated with the latest regulations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary mb-2">Instant Results</h3>
                <p className="text-gray-600">
                  Get your calculations immediately with detailed breakdowns and visual charts.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary mb-2">Free Forever</h3>
                <p className="text-gray-600">
                  No hidden charges, no subscriptions. Use all calculators unlimited times for free.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

