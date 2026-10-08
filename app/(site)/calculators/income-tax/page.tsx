'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { incomeTaxSchema, IncomeTaxFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateIncomeTax, IncomeTaxResult } from '@/app/lib/calculations/incomeTaxCalculator';
import Input from '@/app/components/fv/Input';
import Select from '@/app/components/fv/Select';
import RadioGroup from '@/app/components/ui/RadioGroup';
import Checkbox from '@/app/components/ui/Checkbox';
import RangeSlider from '@/app/components/ui/RangeSlider';
import Button from '@/app/components/fv/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import { ResultEmpty, ResultRow, ResultStat, ResultStatGrid, ResultTotal } from '@/app/components/calculators/ResultParts';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { Calculator, Download, Share2 } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import Section from '@/app/components/fv/Section';

const FINANCIAL_YEARS = [
  { value: '2023-24', label: 'FY 2023-24' },
  { value: '2024-25', label: 'FY 2024-25' },
];

const STATES = [
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'other', label: 'Other' },
];

export default function IncomeTaxCalculatorPage() {
  const [result, setResult] = useState<IncomeTaxResult | null>(null);
  const [age, setAge] = useState(30);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IncomeTaxFormData>({
    resolver: zodResolver(incomeTaxSchema),
    defaultValues: {
      financialYear: '2023-24',
      incomeType: 'salary',
      grossIncome: 0,
      age: 30,
      deductions: {
        section80C: 0,
        section80D: 0,
        section80E: 0,
        others: 0,
      },
      state: 'maharashtra',
      surcharge: false,
    },
  });

  const onSubmit = (data: IncomeTaxFormData) => {
    const calculationResult = calculateIncomeTax({
      ...data,
      age,
    });
    setResult(calculationResult);
  };

  const chartData = result?.taxBreakdown.map((breakdown) => ({
    name: breakdown.slab,
    amount: breakdown.amount,
    rate: `${breakdown.rate}%`,
  })) || [];

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        icon={Calculator}
        title="Income Tax Calculator"
        subtitle="Calculate your tax liability with precision for FY 2023-24"
      />
      <Section soft>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Form Section - 45% */}
          <div className="min-w-0 lg:col-span-2">
            <div className="fv-card p-5 md:p-7 lg:sticky lg:top-24">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-fv-navy">
                Enter Your Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Select
                  label="Financial Year"
                  options={FINANCIAL_YEARS}
                  error={errors.financialYear?.message}
                  {...register('financialYear')}
                />

                <RadioGroup
                  label="Income Type"
                  name="incomeType"
                  options={[
                    { value: 'salary', label: 'Salary' },
                    { value: 'business', label: 'Business' },
                    { value: 'investment', label: 'Investment' },
                    { value: 'other', label: 'Other' },
                  ]}
                  value={watch('incomeType')}
                  onChange={(value) => setValue('incomeType', value as any)}
                  error={errors.incomeType?.message}
                />

                <Input
                  label="Gross Annual Income"
                  type="number"
                  placeholder="Enter amount"
                  prefixIcon={<span>₹</span>}
                  error={errors.grossIncome?.message}
                  {...register('grossIncome', { valueAsNumber: true })}
                />

                <div>
                  <RangeSlider
                    label="Age"
                    min={0}
                    max={120}
                    value={age}
                    onChange={(value) => {
                      setAge(value);
                      setValue('age', value);
                    }}
                    suffix=" years"
                  />
                </div>

                <div className="space-y-4 border-t border-fv-line pt-5">
                  <h3 className="text-base font-bold text-fv-navy">Deductions</h3>

                  <Input
                    label="Section 80C (Max ₹1.5L)"
                    type="number"
                    placeholder="0"
                    prefixIcon={<span>₹</span>}
                    error={errors.deductions?.section80C?.message}
                    {...register('deductions.section80C', { valueAsNumber: true })}
                  />

                  <Input
                    label="Section 80D (Health Insurance)"
                    type="number"
                    placeholder="0"
                    prefixIcon={<span>₹</span>}
                    error={errors.deductions?.section80D?.message}
                    {...register('deductions.section80D', { valueAsNumber: true })}
                  />

                  <Input
                    label="Section 80E (Education Loan)"
                    type="number"
                    placeholder="0"
                    prefixIcon={<span>₹</span>}
                    error={errors.deductions?.section80E?.message}
                    {...register('deductions.section80E', { valueAsNumber: true })}
                  />

                  <Input
                    label="Other Deductions"
                    type="number"
                    placeholder="0"
                    prefixIcon={<span>₹</span>}
                    error={errors.deductions?.others?.message}
                    {...register('deductions.others', { valueAsNumber: true })}
                  />
                </div>

                <Select
                  label="State"
                  options={STATES}
                  error={errors.state?.message}
                  {...register('state')}
                />

                <Checkbox
                  label="Apply Surcharge (for income > ₹50L)"
                  checked={watch('surcharge')}
                  onChange={(e) => setValue('surcharge', e.target.checked)}
                />

                {Object.keys(errors).length > 0 && (
                  <FormError message="Please fix the errors above" />
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Calculate Tax
                </Button>
              </form>
            </div>
          </div>

          {/* Results Section - 55% */}
          <div className="min-w-0 space-y-6 lg:col-span-3">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="Tax Summary">
                  <ResultStatGrid>
                    <ResultStat label="Gross Income">
                      ₹<CounterAnimation end={result.grossIncome} format="number" />
                    </ResultStat>
                    <ResultStat label="Total Deductions" tone="green">
                      -₹<CounterAnimation end={result.totalDeductions} format="number" />
                    </ResultStat>
                    <ResultStat label="Taxable Income">
                      ₹<CounterAnimation end={result.taxableIncome} format="number" />
                    </ResultStat>
                    <ResultStat label="Effective Tax Rate" tone="blue">
                      <CounterAnimation end={result.effectiveRate} format="percentage" decimals={2} />
                    </ResultStat>
                  </ResultStatGrid>
                </ResultsCard>

                {/* Tax Breakdown */}
                <ResultsCard title="Tax Breakdown">
                  <div className="space-y-3">
                    <ResultRow label="Base Tax">
                      ₹{result.baseTax.toLocaleString('en-IN')}
                    </ResultRow>
                    {result.surcharge > 0 && (
                      <ResultRow label="Surcharge">
                        ₹{result.surcharge.toLocaleString('en-IN')}
                      </ResultRow>
                    )}
                    <ResultRow label="Cess (4%)">
                      ₹{result.cess.toLocaleString('en-IN')}
                    </ResultRow>
                    <ResultTotal label="TOTAL TAX PAYABLE">
                      ₹<CounterAnimation end={result.totalTax} format="number" />
                    </ResultTotal>
                  </div>
                </ResultsCard>

                {/* Chart */}
                {chartData.length > 0 && (
                  <ResultsCard title="Tax Slab Breakdown">
                    <CalculatorChart
                      type="bar"
                      data={chartData}
                      dataKeys={['amount']}
                      xAxisKey="name"
                    />
                  </ResultsCard>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="secondary" size="md" className="flex-1">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Export PDF
                  </Button>
                  <Button variant="tertiary" size="md" className="flex-1">
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    Share Results
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fv-card p-10 text-center md:p-12"
              >
                <ResultEmpty icon={Calculator}>
                  Fill in your details and click &quot;Calculate Tax&quot; to see your results
                </ResultEmpty>
              </motion.div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
