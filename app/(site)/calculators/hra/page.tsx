'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { hraSchema, HRAFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateHRA, HRAResult } from '@/app/lib/calculations/hraCalculator';
import Input from '@/app/components/ui/Input';
import RadioGroup from '@/app/components/ui/RadioGroup';
import Button from '@/app/components/ui/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { Home, Download, Share2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-4xl text-primary mb-2">
            HRA Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate your HRA exemption and maximize tax savings
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-semibold text-xl text-primary mb-6">
                Enter Salary Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="HRA Summary">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Basic + DA</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹<CounterAnimation end={result.basicPlusDA} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Actual HRA</p>
                      <p className="text-2xl font-bold text-accent">
                        ₹<CounterAnimation end={result.actualHRA} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">HRA Exemption</p>
                      <p className="text-2xl font-bold text-success">
                        ₹<CounterAnimation end={result.hraExemption} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Taxable HRA</p>
                      <p className="text-2xl font-bold text-error">
                        ₹<CounterAnimation end={result.taxableHRA} format="number" />
                      </p>
                    </div>
                  </div>
                </ResultsCard>

                {/* Tax Savings */}
                <ResultsCard title="Tax Savings">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-success/10 rounded-lg border border-success/20">
                      <p className="text-sm text-gray-600 mb-1">Annual Tax Saving</p>
                      <p className="text-3xl font-bold text-success">
                        ₹<CounterAnimation end={result.annualTaxSaving} format="number" />
                      </p>
                    </div>
                    <div className="p-6 bg-accent/10 rounded-lg border border-accent/20">
                      <p className="text-sm text-gray-600 mb-1">Monthly Tax Saving</p>
                      <p className="text-3xl font-bold text-accent">
                        ₹<CounterAnimation end={result.monthlyTaxSaving} format="number" />
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Effective HRA Benefit</p>
                    <p className="text-2xl font-bold text-primary">
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
                    colors={['#00A3E0', '#2ECC71', '#E74C3C']}
                  />
                </ResultsCard>

                {/* Calculation Details */}
                <ResultsCard title="Calculation Breakdown">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                      HRA exemption is the minimum of the following three:
                    </p>
                    {breakdownData.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-semibold text-primary">
                          ₹{item.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg border-2 border-success mt-4">
                      <span className="font-bold text-lg text-primary">HRA EXEMPTION (Minimum)</span>
                      <span className="font-bold text-2xl text-success">
                        ₹<CounterAnimation end={result.hraExemption} format="number" />
                      </span>
                    </div>
                  </div>
                </ResultsCard>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button variant="secondary" size="md" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="tertiary" size="md" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-card p-12 text-center"
              >
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Fill in your salary details and click "Calculate HRA" to see your results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

