'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { tdsSchema, TDSFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateTDS, TDSResult } from '@/app/lib/calculations/tdsCalculator';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import RadioGroup from '@/app/components/ui/RadioGroup';
import Checkbox from '@/app/components/ui/Checkbox';
import Button from '@/app/components/ui/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { FileText, Download, Share2, AlertCircle } from 'lucide-react';

const TDS_TYPES = [
  { value: 'salary', label: 'Salary' },
  { value: 'professional', label: 'Professional Fees' },
  { value: 'contract', label: 'Contractor Payment' },
  { value: 'rent', label: 'Rent' },
  { value: 'commission', label: 'Commission' },
  { value: 'interest', label: 'Interest' },
  { value: 'dividend', label: 'Dividend' },
];

const FINANCIAL_YEARS = [
  { value: '2023-24', label: 'FY 2023-24' },
  { value: '2024-25', label: 'FY 2024-25' },
];

export default function TDSCalculatorPage() {
  const [result, setResult] = useState<TDSResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TDSFormData>({
    resolver: zodResolver(tdsSchema),
    defaultValues: {
      tdsType: 'professional',
      amount: 0,
      hasPAN: true,
      financialYear: '2023-24',
      quarter: 'Q1',
      specialCategory: false,
    },
  });

  const onSubmit = (data: TDSFormData) => {
    const calculationResult = calculateTDS(data);
    setResult(calculationResult);
  };

  const quarterlyChartData = result?.quarterlyBreakdown.map(item => ({
    name: item.quarter,
    amount: item.amount,
    tds: item.tds,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-4xl text-primary mb-2">
            TDS Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate TDS deductions for all payment types
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-semibold text-xl text-primary mb-6">
                Enter Payment Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Select
                  label="TDS Type"
                  options={TDS_TYPES}
                  error={errors.tdsType?.message}
                  {...register('tdsType')}
                />

                <Input
                  label="Payment/Income Amount"
                  type="number"
                  placeholder="Enter amount"
                  prefixIcon={<span>₹</span>}
                  error={errors.amount?.message}
                  {...register('amount', { valueAsNumber: true })}
                />

                <RadioGroup
                  label="PAN Status"
                  name="hasPAN"
                  options={[
                    { value: 'true', label: 'Has PAN' },
                    { value: 'false', label: 'No PAN (Higher TDS)' },
                  ]}
                  value={String(watch('hasPAN'))}
                  onChange={(value) => setValue('hasPAN', value === 'true')}
                  error={errors.hasPAN?.message}
                />

                <Select
                  label="Financial Year"
                  options={FINANCIAL_YEARS}
                  error={errors.financialYear?.message}
                  {...register('financialYear')}
                />

                <RadioGroup
                  label="Quarter"
                  name="quarter"
                  options={[
                    { value: 'Q1', label: 'Q1 (Apr-Jun)' },
                    { value: 'Q2', label: 'Q2 (Jul-Sep)' },
                    { value: 'Q3', label: 'Q3 (Oct-Dec)' },
                    { value: 'Q4', label: 'Q4 (Jan-Mar)' },
                  ]}
                  value={watch('quarter')}
                  onChange={(value) => setValue('quarter', value as any)}
                  error={errors.quarter?.message}
                />

                <Checkbox
                  label="Special Category (Senior Citizen, etc.)"
                  checked={watch('specialCategory')}
                  onChange={(e) => setValue('specialCategory', e.target.checked)}
                />

                {Object.keys(errors).length > 0 && (
                  <FormError message="Please fix the errors above" />
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Calculate TDS
                </Button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="TDS Summary">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹<CounterAnimation end={result.paymentAmount} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">TDS Rate</p>
                      <p className="text-2xl font-bold text-accent">
                        <CounterAnimation end={result.tdsRate} format="percentage" decimals={0} />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">TDS Amount</p>
                      <p className="text-3xl font-bold text-error">
                        ₹<CounterAnimation end={result.tdsAmount} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Net Amount</p>
                      <p className="text-3xl font-bold text-success">
                        ₹<CounterAnimation end={result.netAmount} format="number" />
                      </p>
                    </div>
                  </div>
                </ResultsCard>

                {/* Threshold Info */}
                <ResultsCard title="Threshold Information">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <AlertCircle className={`w-6 h-6 flex-shrink-0 ${result.thresholdInfo.exceeded ? 'text-error' : 'text-success'}`} />
                    <div>
                      <p className="font-semibold text-primary mb-1">
                        Threshold Limit: ₹{result.thresholdInfo.limit.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {result.thresholdInfo.exceeded ? (
                          <span className="text-error">Amount exceeds threshold. TDS is applicable.</span>
                        ) : (
                          <span className="text-success">Amount is below threshold. TDS may not be applicable.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </ResultsCard>

                {/* Quarterly Breakdown Chart */}
                <ResultsCard title="Quarterly Distribution">
                  <CalculatorChart
                    type="bar"
                    data={quarterlyChartData}
                    dataKeys={['amount', 'tds']}
                    xAxisKey="name"
                    colors={['#00A3E0', '#E74C3C']}
                  />
                </ResultsCard>

                {/* Quarterly Breakdown Table */}
                <ResultsCard title="Quarterly Breakdown">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-primary">Quarter</th>
                          <th className="px-4 py-3 text-right font-semibold text-primary">Amount</th>
                          <th className="px-4 py-3 text-right font-semibold text-primary">TDS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {result.quarterlyBreakdown.map((item, index) => (
                          <motion.tr
                            key={item.quarter}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-gray-700 font-medium">{item.quarter}</td>
                            <td className="px-4 py-3 text-right text-primary font-medium">
                              ₹{item.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right text-error font-semibold">
                              ₹{item.tds.toLocaleString('en-IN')}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
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
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Fill in payment details and click "Calculate TDS" to see your results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

