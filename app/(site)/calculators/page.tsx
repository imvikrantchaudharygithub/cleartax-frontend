'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/app/components/fv/Input';
import { ArrowRight, BadgeCheck, Calculator, Receipt, CreditCard, Home, FileText, Gift, Search, Zap } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import IconTile from '@/app/components/fv/IconTile';
import Pill from '@/app/components/fv/Pill';
import Section from '@/app/components/fv/Section';
import SectionHead from '@/app/components/fv/SectionHead';
import { colorAt } from '@/app/lib/fv/colors';

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
    <div className="min-h-screen bg-white">
      <PageHero
        icon={Calculator}
        title="Tax & Compliance Calculators"
        subtitle="Professional-grade calculators for all your tax, GST, and financial planning needs. Accurate, instant, and easy to use."
      >
        {/* Search Bar */}
        <div className="mx-auto max-w-[520px]">
          <Input
            type="text"
            aria-label="Search calculators"
            placeholder="Search calculators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefixIcon={<Search className="h-5 w-5" aria-hidden="true" />}
            className="shadow-fv-card"
          />
        </div>
      </PageHero>

      <Section>
        {/* Calculator Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCalculators.map((calculator) => {
            const Icon = calculator.icon;
            // Colour follows the calculator, not its position in the filtered list.
            const color = colorAt(calculators.indexOf(calculator));
            return (
              <Link
                key={calculator.id}
                href={calculator.href}
                className="group fv-card flex h-full flex-col p-6 transition duration-200 hover:border-fv-blue/30 hover:shadow-fv-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <IconTile icon={Icon} color={color} size="lg" />
                  <Pill>{calculator.category}</Pill>
                </div>

                <h3 className="mb-2 text-xl font-bold tracking-tight text-fv-navy">
                  {calculator.title}
                </h3>

                <p className="mb-6 flex-grow leading-relaxed text-fv-slate">
                  {calculator.description}
                </p>

                <span className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-semibold text-fv-blue-d group-hover:text-fv-blue-dd">
                  Open Calculator
                  <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>

        {/* No Results */}
        {filteredCalculators.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-fv-slate">
              No calculators found matching your search.
            </p>
          </div>
        )}
      </Section>

      {/* Info Section */}
      <Section soft>
        <SectionHead title="Why Use Our Calculators?" align="center" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="fv-card p-6">
            <IconTile icon={BadgeCheck} color="blue" className="mb-4" />
            <h3 className="mb-2 text-lg font-bold tracking-tight text-fv-navy">100% Accurate</h3>
            <p className="leading-relaxed text-fv-slate">
              All calculations are verified by tax experts and updated with the latest regulations.
            </p>
          </div>
          <div className="fv-card p-6">
            <IconTile icon={Zap} color="green" className="mb-4" />
            <h3 className="mb-2 text-lg font-bold tracking-tight text-fv-navy">Instant Results</h3>
            <p className="leading-relaxed text-fv-slate">
              Get your calculations immediately with detailed breakdowns and visual charts.
            </p>
          </div>
          <div className="fv-card p-6">
            <IconTile icon={Gift} color="teal" className="mb-4" />
            <h3 className="mb-2 text-lg font-bold tracking-tight text-fv-navy">Free Forever</h3>
            <p className="leading-relaxed text-fv-slate">
              No hidden charges, no subscriptions. Use all calculators unlimited times for free.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
