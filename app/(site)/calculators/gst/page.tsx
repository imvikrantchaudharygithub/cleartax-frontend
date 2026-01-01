'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { gstSchema, GSTFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateGST, GSTResult } from '@/app/lib/calculations/gstCalculator';
import Input from '@/app/components/ui/Input';
import RadioGroup from '@/app/components/ui/RadioGroup';
import Checkbox from '@/app/components/ui/Checkbox';
import Button from '@/app/components/ui/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { Receipt, Download, Share2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-4">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-4xl text-primary mb-2">
            GST Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate GST for all transaction types with detailed breakdowns
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-semibold text-xl text-primary mb-6">
                Enter Transaction Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="GST Summary">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Net Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹<CounterAnimation end={result.originalAmount} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">GST Amount</p>
                      <p className="text-2xl font-bold text-warning">
                        ₹<CounterAnimation end={result.gstAmount} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-success">
                        ₹<CounterAnimation end={result.totalAmount} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Effective Rate</p>
                      <p className="text-2xl font-bold text-accent">
                        <CounterAnimation end={result.effectiveRate} format="percentage" decimals={2} />
                      </p>
                    </div>
                  </div>
                </ResultsCard>

                {/* Tax Breakdown */}
                <ResultsCard title="Tax Breakdown">
                  <div className="space-y-3">
                    {watch('interstate') ? (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">IGST (Integrated GST)</span>
                        <span className="font-semibold text-primary">
                          ₹{result.igst.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">CGST (Central GST)</span>
                          <span className="font-semibold text-primary">
                            ₹{result.cgst.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">SGST (State GST)</span>
                          <span className="font-semibold text-primary">
                            ₹{result.sgst.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg border-2 border-success">
                      <span className="font-bold text-lg text-primary">TOTAL GST</span>
                      <span className="font-bold text-2xl text-success">
                        ₹<CounterAnimation end={result.gstAmount} format="number" />
                      </span>
                    </div>
                  </div>
                </ResultsCard>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
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
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Fill in your details and click "Calculate GST" to see your results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

