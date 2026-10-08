'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { tdsSchema, TDSFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateTDS, TDSResult } from '@/app/lib/calculations/tdsCalculator';
import Input from '@/app/components/fv/Input';
import Select from '@/app/components/fv/Select';
import RadioGroup from '@/app/components/ui/RadioGroup';
import Checkbox from '@/app/components/ui/Checkbox';
import Button from '@/app/components/fv/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import { ResultEmpty, ResultStat, ResultStatGrid } from '@/app/components/calculators/ResultParts';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { FileText, Download, Share2, AlertCircle } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import Section from '@/app/components/fv/Section';
import { FV_DANGER_TEXT, FV_DANGER_VARS } from '@/app/components/fv/field';
import { FV_COLOR_HEX } from '@/app/lib/fv/colors';

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
    <div className="min-h-screen bg-white">
      <PageHero
        icon={FileText}
        title="TDS Calculator"
        subtitle="Calculate TDS deductions for all payment types"
      />
      <Section soft>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Form Section */}
          <div className="min-w-0 lg:col-span-2">
            <div className="fv-card p-5 md:p-7 lg:sticky lg:top-24">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-fv-navy">
                Enter Payment Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <div className="min-w-0 space-y-6 lg:col-span-3">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="TDS Summary">
                  <ResultStatGrid>
                    <ResultStat label="Payment Amount">
                      ₹<CounterAnimation end={result.paymentAmount} format="number" />
                    </ResultStat>
                    <ResultStat label="TDS Rate" tone="blue">
                      <CounterAnimation end={result.tdsRate} format="percentage" decimals={0} />
                    </ResultStat>
                    <ResultStat label="TDS Amount" size="lg">
                      ₹<CounterAnimation end={result.tdsAmount} format="number" />
                    </ResultStat>
                    <ResultStat label="Net Amount" tone="green" size="lg">
                      ₹<CounterAnimation end={result.netAmount} format="number" />
                    </ResultStat>
                  </ResultStatGrid>
                </ResultsCard>

                {/* Threshold Info */}
                <ResultsCard title="Threshold Information">
                  <div className="flex items-start gap-4 rounded-[10px] border border-fv-line bg-fv-wash p-4" style={FV_DANGER_VARS}>
                    <AlertCircle
                      aria-hidden="true"
                      className={`h-6 w-6 flex-shrink-0 ${result.thresholdInfo.exceeded ? FV_DANGER_TEXT : 'text-fv-green-d'}`}
                    />
                    <div>
                      <p className="mb-1 font-semibold text-fv-navy">
                        Threshold Limit: ₹{result.thresholdInfo.limit.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-fv-slate">
                        {result.thresholdInfo.exceeded ? (
                          <span className={`font-medium ${FV_DANGER_TEXT}`}>Amount exceeds threshold. TDS is applicable.</span>
                        ) : (
                          <span className="font-medium text-fv-green-d">Amount is below threshold. TDS may not be applicable.</span>
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
                    colors={[FV_COLOR_HEX.blue.fg, FV_COLOR_HEX.red.fg]}
                  />
                </ResultsCard>

                {/* Quarterly Breakdown Table */}
                <ResultsCard title="Quarterly Breakdown">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-fv-wash">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-fv-navy">Quarter</th>
                          <th className="px-4 py-3 text-right font-semibold text-fv-navy">Amount</th>
                          <th className="px-4 py-3 text-right font-semibold text-fv-navy">TDS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-fv-line">
                        {result.quarterlyBreakdown.map((item, index) => (
                          <motion.tr
                            key={item.quarter}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-fv-wash"
                          >
                            <td className="px-4 py-3 font-medium text-fv-slate">{item.quarter}</td>
                            <td className="px-4 py-3 text-right font-medium text-fv-navy">
                              ₹{item.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-fv-blue-d">
                              ₹{item.tds.toLocaleString('en-IN')}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
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
                <ResultEmpty icon={FileText}>
                  Fill in payment details and click &quot;Calculate TDS&quot; to see your results
                </ResultEmpty>
              </motion.div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
