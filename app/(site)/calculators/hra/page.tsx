'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { hraSchema, HRAFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateHRA, HRAResult } from '@/app/lib/calculations/hraCalculator';
import Input from '@/app/components/fv/Input';
import RadioGroup from '@/app/components/ui/RadioGroup';
import Button from '@/app/components/fv/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import { ResultEmpty, ResultRow, ResultStat, ResultStatGrid, ResultTotal } from '@/app/components/calculators/ResultParts';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { Home, Download, Share2 } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import Section from '@/app/components/fv/Section';
import { FV_COLOR_HEX } from '@/app/lib/fv/colors';

export default function HRACalculatorPage() {
  const [result, setResult] = useState<HRAResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<HRAFormData>({
    resolver: zodResolver(hraSchema),
    defaultValues: {
      basicSalary: 0,
      da: 0,
      hraReceived: 0,
      cityType: 'metro',
      rentPaid: 0,
    },
  });

  const onSubmit = (data: HRAFormData) => {
    const calculationResult = calculateHRA(data);
    setResult(calculationResult);
  };

  const comparisonChartData = result ? [
    { name: 'Actual HRA', amount: result.actualHRA },
    { name: 'HRA Exemption', amount: result.hraExemption },
    { name: 'Taxable HRA', amount: result.taxableHRA },
  ] : [];

  const breakdownData = result ? [
    { name: 'Actual HRA', value: result.breakdown.actualHRA },
    { name: 'Rent - 10% Salary', value: result.breakdown.rentMinusTenPercent },
    { name: '50%/40% of Salary', value: result.breakdown.fiftyOrFortyPercent },
  ] : [];

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        icon={Home}
        title="HRA Calculator"
        subtitle="Calculate your HRA exemption and maximize tax savings"
      />
      <Section soft>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Form Section */}
          <div className="min-w-0 lg:col-span-2">
            <div className="fv-card p-5 md:p-7 lg:sticky lg:top-24">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-fv-navy">
                Enter Salary Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Basic Salary (Annual)"
                  type="number"
                  placeholder="Enter amount"
                  prefixIcon={<span>₹</span>}
                  error={errors.basicSalary?.message}
                  {...register('basicSalary', { valueAsNumber: true })}
                />

                <Input
                  label="Dearness Allowance (DA)"
                  type="number"
                  placeholder="0"
                  prefixIcon={<span>₹</span>}
                  error={errors.da?.message}
                  {...register('da', { valueAsNumber: true })}
                />

                <Input
                  label="HRA Received (Annual)"
                  type="number"
                  placeholder="Enter amount"
                  prefixIcon={<span>₹</span>}
                  error={errors.hraReceived?.message}
                  {...register('hraReceived', { valueAsNumber: true })}
                />

                <RadioGroup
                  label="City Type"
                  name="cityType"
                  options={[
                    { value: 'metro', label: 'Metro City (50% exemption)' },
                    { value: 'non-metro', label: 'Non-Metro City (40% exemption)' },
                  ]}
                  value={watch('cityType')}
                  onChange={(value) => setValue('cityType', value as any)}
                  error={errors.cityType?.message}
                />

                <Input
                  label="Annual Rent Paid"
                  type="number"
                  placeholder="Enter amount"
                  prefixIcon={<span>₹</span>}
                  error={errors.rentPaid?.message}
                  {...register('rentPaid', { valueAsNumber: true })}
                />

                {Object.keys(errors).length > 0 && (
                  <FormError message="Please fix the errors above" />
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Calculate HRA
                </Button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="min-w-0 space-y-6 lg:col-span-3">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="HRA Summary">
                  <ResultStatGrid>
                    <ResultStat label="Basic + DA">
                      ₹<CounterAnimation end={result.basicPlusDA} format="number" />
                    </ResultStat>
                    <ResultStat label="Actual HRA" tone="blue">
                      ₹<CounterAnimation end={result.actualHRA} format="number" />
                    </ResultStat>
                    <ResultStat label="HRA Exemption" tone="green">
                      ₹<CounterAnimation end={result.hraExemption} format="number" />
                    </ResultStat>
                    <ResultStat label="Taxable HRA">
                      ₹<CounterAnimation end={result.taxableHRA} format="number" />
                    </ResultStat>
                  </ResultStatGrid>
                </ResultsCard>

                {/* Tax Savings */}
                <ResultsCard title="Tax Savings">
                  <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                    <div className="rounded-[12px] border border-fv-green/30 bg-fv-green-50 p-5 md:p-6">
                      <p className="mb-1 text-sm text-fv-slate">Annual Tax Saving</p>
                      <p className="text-[26px] font-extrabold leading-tight tracking-tight text-fv-green-d sm:text-3xl">
                        ₹<CounterAnimation end={result.annualTaxSaving} format="number" />
                      </p>
                    </div>
                    <div className="rounded-[12px] border border-fv-blue/25 bg-fv-blue-50 p-5 md:p-6">
                      <p className="mb-1 text-sm text-fv-slate">Monthly Tax Saving</p>
                      <p className="text-[26px] font-extrabold leading-tight tracking-tight text-fv-blue-d sm:text-3xl">
                        ₹<CounterAnimation end={result.monthlyTaxSaving} format="number" />
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[10px] bg-fv-wash p-4 md:mt-6">
                    <p className="text-sm text-fv-slate">Effective HRA Benefit</p>
                    <p className="text-[22px] font-extrabold leading-tight tracking-tight text-fv-navy sm:text-2xl">
                      <CounterAnimation end={result.effectiveHRA} format="percentage" decimals={1} />
                    </p>
                  </div>
                </ResultsCard>

                {/* Comparison Chart */}
                <ResultsCard title="HRA Breakdown">
                  <CalculatorChart
                    type="bar"
                    data={comparisonChartData}
                    dataKeys={['amount']}
                    xAxisKey="name"
                    colors={[FV_COLOR_HEX.blue.fg, FV_COLOR_HEX.green.fg, FV_COLOR_HEX.red.fg]}
                  />
                </ResultsCard>

                {/* Calculation Details */}
                <ResultsCard title="Calculation Breakdown">
                  <div className="space-y-3">
                    <p className="mb-4 text-sm text-fv-slate">
                      HRA exemption is the minimum of the following three:
                    </p>
                    {breakdownData.map((item, index) => (
                      <ResultRow key={index} label={item.name}>
                        ₹{item.value.toLocaleString('en-IN')}
                      </ResultRow>
                    ))}
                    <ResultTotal label="HRA EXEMPTION (Minimum)" tone="green" className="mt-4">
                      ₹<CounterAnimation end={result.hraExemption} format="number" />
                    </ResultTotal>
                  </div>
                </ResultsCard>

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
                <ResultEmpty icon={Home}>
                  Fill in your salary details and click &quot;Calculate HRA&quot; to see your results
                </ResultEmpty>
              </motion.div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
