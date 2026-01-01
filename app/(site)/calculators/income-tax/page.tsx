'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { incomeTaxSchema, IncomeTaxFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateIncomeTax, IncomeTaxResult } from '@/app/lib/calculations/incomeTaxCalculator';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import RadioGroup from '@/app/components/ui/RadioGroup';
import Checkbox from '@/app/components/ui/Checkbox';
import RangeSlider from '@/app/components/ui/RangeSlider';
import Button from '@/app/components/ui/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { Calculator, Download, Share2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-4xl text-primary mb-2">
            Income Tax Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate your tax liability with precision for FY 2023-24
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section - 45% */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-semibold text-xl text-primary mb-6">
                Enter Your Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-primary mb-3">Deductions</h3>
                  
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
                    className="mt-3"
                    error={errors.deductions?.section80D?.message}
                    {...register('deductions.section80D', { valueAsNumber: true })}
                  />

                  <Input
                    label="Section 80E (Education Loan)"
                    type="number"
                    placeholder="0"
                    prefixIcon={<span>₹</span>}
                    className="mt-3"
                    error={errors.deductions?.section80E?.message}
                    {...register('deductions.section80E', { valueAsNumber: true })}
                  />

                  <Input
                    label="Other Deductions"
                    type="number"
                    placeholder="0"
                    prefixIcon={<span>₹</span>}
                    className="mt-3"
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
          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="Tax Summary">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gross Income</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹<CounterAnimation end={result.grossIncome} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
                      <p className="text-2xl font-bold text-success">
                        -₹<CounterAnimation end={result.totalDeductions} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Taxable Income</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹<CounterAnimation end={result.taxableIncome} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Effective Tax Rate</p>
                      <p className="text-2xl font-bold text-accent">
                        <CounterAnimation end={result.effectiveRate} format="percentage" decimals={2} />
                      </p>
                    </div>
                  </div>
                </ResultsCard>

                {/* Tax Breakdown */}
                <ResultsCard title="Tax Breakdown">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Base Tax</span>
                      <span className="font-semibold text-primary">
                        ₹{result.baseTax.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {result.surcharge > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Surcharge</span>
                        <span className="font-semibold text-primary">
                          ₹{result.surcharge.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Cess (4%)</span>
                      <span className="font-semibold text-primary">
                        ₹{result.cess.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg border-2 border-success">
                      <span className="font-bold text-lg text-primary">TOTAL TAX PAYABLE</span>
                      <span className="font-bold text-2xl text-success">
                        ₹<CounterAnimation end={result.totalTax} format="number" />
                      </span>
                    </div>
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
                <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Fill in your details and click "Calculate Tax" to see your results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

