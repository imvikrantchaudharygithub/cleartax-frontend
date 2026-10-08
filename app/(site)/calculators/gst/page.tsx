'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { gstSchema, GSTFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateGST, GSTResult } from '@/app/lib/calculations/gstCalculator';
import Input from '@/app/components/fv/Input';
import RadioGroup from '@/app/components/ui/RadioGroup';
import Checkbox from '@/app/components/ui/Checkbox';
import Button from '@/app/components/fv/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import { ResultEmpty, ResultRow, ResultStat, ResultStatGrid, ResultTotal } from '@/app/components/calculators/ResultParts';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { Receipt, Download, Share2 } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import Section from '@/app/components/fv/Section';

export default function GSTCalculatorPage() {
  const [result, setResult] = useState<GSTResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GSTFormData>({
    resolver: zodResolver(gstSchema),
    defaultValues: {
      calculationType: 'add',
      amount: 0,
      gstRate: 18,
      transactionType: 'b2b',
      interstate: false,
    },
  });

  const onSubmit = (data: GSTFormData) => {
    const calculationResult = calculateGST(data);
    setResult(calculationResult);
  };

  const pieChartData = result ? [
    { name: 'Original Amount', value: result.originalAmount },
    { name: 'GST Amount', value: result.gstAmount },
  ] : [];

  const taxBreakdownData = result ? (
    watch('interstate')
      ? [{ name: 'IGST', value: result.igst }]
      : [
          { name: 'CGST', value: result.cgst },
          { name: 'SGST', value: result.sgst },
        ]
  ) : [];

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        icon={Receipt}
        title="GST Calculator"
        subtitle="Calculate GST for all transaction types with detailed breakdowns"
      />
      <Section soft>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Form Section */}
          <div className="min-w-0 lg:col-span-2">
            <div className="fv-card p-5 md:p-7 lg:sticky lg:top-24">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-fv-navy">
                Enter Transaction Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <RadioGroup
                  label="Calculation Type"
                  name="calculationType"
                  options={[
                    { value: 'add', label: 'Add GST to Amount' },
                    { value: 'remove', label: 'Remove GST from Amount' },
                  ]}
                  value={watch('calculationType')}
                  onChange={(value) => setValue('calculationType', value as any)}
                  error={errors.calculationType?.message}
                />

                <Input
                  label="Amount"
                  type="number"
                  placeholder="Enter amount"
                  prefixIcon={<span>₹</span>}
                  error={errors.amount?.message}
                  {...register('amount', { valueAsNumber: true })}
                />

                <RadioGroup
                  label="GST Rate"
                  name="gstRate"
                  options={[
                    { value: '5', label: '5%' },
                    { value: '12', label: '12%' },
                    { value: '18', label: '18%' },
                    { value: '28', label: '28%' },
                  ]}
                  value={String(watch('gstRate'))}
                  onChange={(value) => setValue('gstRate', Number(value) as any)}
                  error={errors.gstRate?.message}
                />

                <RadioGroup
                  label="Transaction Type"
                  name="transactionType"
                  options={[
                    { value: 'b2b', label: 'B2B (Business to Business)' },
                    { value: 'b2c', label: 'B2C (Business to Consumer)' },
                  ]}
                  value={watch('transactionType')}
                  onChange={(value) => setValue('transactionType', value as any)}
                  error={errors.transactionType?.message}
                />

                <Checkbox
                  label="Interstate Transaction (IGST applies)"
                  checked={watch('interstate')}
                  onChange={(e) => setValue('interstate', e.target.checked)}
                />

                {Object.keys(errors).length > 0 && (
                  <FormError message="Please fix the errors above" />
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Calculate GST
                </Button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="min-w-0 space-y-6 lg:col-span-3">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="GST Summary">
                  <ResultStatGrid>
                    <ResultStat label="Net Amount">
                      ₹<CounterAnimation end={result.originalAmount} format="number" />
                    </ResultStat>
                    <ResultStat label="GST Amount" tone="blue">
                      ₹<CounterAnimation end={result.gstAmount} format="number" />
                    </ResultStat>
                    <ResultStat label="Total Amount" tone="green">
                      ₹<CounterAnimation end={result.totalAmount} format="number" />
                    </ResultStat>
                    <ResultStat label="Effective Rate">
                      <CounterAnimation end={result.effectiveRate} format="percentage" decimals={2} />
                    </ResultStat>
                  </ResultStatGrid>
                </ResultsCard>

                {/* Tax Breakdown */}
                <ResultsCard title="Tax Breakdown">
                  <div className="space-y-3">
                    {watch('interstate') ? (
                      <ResultRow label="IGST (Integrated GST)">
                        ₹{result.igst.toLocaleString('en-IN')}
                      </ResultRow>
                    ) : (
                      <>
                        <ResultRow label="CGST (Central GST)">
                          ₹{result.cgst.toLocaleString('en-IN')}
                        </ResultRow>
                        <ResultRow label="SGST (State GST)">
                          ₹{result.sgst.toLocaleString('en-IN')}
                        </ResultRow>
                      </>
                    )}
                    <ResultTotal label="TOTAL GST">
                      ₹<CounterAnimation end={result.gstAmount} format="number" />
                    </ResultTotal>
                  </div>
                </ResultsCard>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                  <ResultsCard title="Amount Distribution">
                    <CalculatorChart
                      type="pie"
                      data={pieChartData}
                    />
                  </ResultsCard>

                  <ResultsCard title="Tax Components">
                    <CalculatorChart
                      type="bar"
                      data={taxBreakdownData}
                      dataKeys={['value']}
                      xAxisKey="name"
                    />
                  </ResultsCard>
                </div>

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
                <ResultEmpty icon={Receipt}>
                  Fill in your details and click &quot;Calculate GST&quot; to see your results
                </ResultEmpty>
              </motion.div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
