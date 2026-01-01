'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { emiSchema, EMIFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateEMI, EMIResult } from '@/app/lib/calculations/emiCalculator';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import Checkbox from '@/app/components/ui/Checkbox';
import RangeSlider from '@/app/components/ui/RangeSlider';
import Button from '@/app/components/ui/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { CreditCard, Download, Share2 } from 'lucide-react';

const LOAN_TYPES = [
  { value: 'home', label: 'Home Loan' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'personal', label: 'Personal Loan' },
  { value: 'education', label: 'Education Loan' },
];

export default function EMICalculatorPage() {
  const [result, setResult] = useState<EMIResult | null>(null);
  const [interestRate, setInterestRate] = useState(8);
  const [loanDuration, setLoanDuration] = useState(240);
  const [showProcessingFee, setShowProcessingFee] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EMIFormData>({
    resolver: zodResolver(emiSchema),
    defaultValues: {
      loanAmount: 0,
      interestRate: 8,
      loanDuration: 240,
      loanType: 'home',
      processingFee: 0,
      insurance: 0,
    },
  });

  const onSubmit = (data: EMIFormData) => {
    const calculationResult = calculateEMI({
      ...data,
      interestRate,
      loanDuration,
    });
    setResult(calculationResult);
  };

  const chartData = result?.amortizationSchedule
    .filter((_, index) => index % Math.ceil(result.amortizationSchedule.length / 12) === 0)
    .map((item) => ({
      month: `M${item.month}`,
      principal: item.principal,
      interest: item.interest,
      balance: item.balance,
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-4xl text-primary mb-2">
            EMI Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Plan your loan with detailed EMI and amortization schedules
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-semibold text-xl text-primary mb-6">
                Enter Loan Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Loan Amount"
                  type="number"
                  placeholder="Enter amount"
                  prefixIcon={<span>₹</span>}
                  error={errors.loanAmount?.message}
                  {...register('loanAmount', { valueAsNumber: true })}
                />

                <div>
                  <RangeSlider
                    label="Interest Rate (per annum)"
                    min={1}
                    max={20}
                    step={0.1}
                    value={interestRate}
                    onChange={(value) => {
                      setInterestRate(value);
                      setValue('interestRate', value);
                    }}
                    suffix="%"
                  />
                </div>

                <div>
                  <RangeSlider
                    label="Loan Duration"
                    min={1}
                    max={360}
                    value={loanDuration}
                    onChange={(value) => {
                      setLoanDuration(value);
                      setValue('loanDuration', value);
                    }}
                    suffix=" months"
                  />
                </div>

                <Select
                  label="Loan Type"
                  options={LOAN_TYPES}
                  error={errors.loanType?.message}
                  {...register('loanType')}
                />

                <Checkbox
                  label="Include Processing Fee"
                  checked={showProcessingFee}
                  onChange={(e) => setShowProcessingFee(e.target.checked)}
                />

                {showProcessingFee && (
                  <Input
                    label="Processing Fee"
                    type="number"
                    placeholder="0"
                    prefixIcon={<span>₹</span>}
                    error={errors.processingFee?.message}
                    {...register('processingFee', { valueAsNumber: true })}
                  />
                )}

                <Checkbox
                  label="Include Insurance"
                  checked={showInsurance}
                  onChange={(e) => setShowInsurance(e.target.checked)}
                />

                {showInsurance && (
                  <Input
                    label="Monthly Insurance"
                    type="number"
                    placeholder="0"
                    prefixIcon={<span>₹</span>}
                    error={errors.insurance?.message}
                    {...register('insurance', { valueAsNumber: true })}
                  />
                )}

                {Object.keys(errors).length > 0 && (
                  <FormError message="Please fix the errors above" />
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Calculate EMI
                </Button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="EMI Summary">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
                      <p className="text-3xl font-bold text-accent">
                        ₹<CounterAnimation end={result.monthlyEMI} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹<CounterAnimation end={result.totalAmount} format="number" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                      <p className="text-2xl font-bold text-warning">
                        ₹<CounterAnimation end={result.totalInterest} format="number" />
                      </p>
                    </div>
                    {(result.processingFee > 0 || result.insuranceTotal > 0) && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Additional Costs</p>
                        <p className="text-2xl font-bold text-error">
                          ₹<CounterAnimation end={result.processingFee + result.insuranceTotal} format="number" />
                        </p>
                      </div>
                    )}
                  </div>
                </ResultsCard>

                {/* Payment Breakdown Chart */}
                <ResultsCard title="Payment Over Time">
                  <CalculatorChart
                    type="line"
                    data={chartData}
                    dataKeys={['principal', 'interest', 'balance']}
                    xAxisKey="month"
                    colors={['#00A3E0', '#F39C12', '#2ECC71']}
                  />
                </ResultsCard>

                {/* Amortization Table */}
                <ResultsCard title="Amortization Schedule">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-primary">Month</th>
                          <th className="px-4 py-3 text-right font-semibold text-primary">EMI</th>
                          <th className="px-4 py-3 text-right font-semibold text-primary">Principal</th>
                          <th className="px-4 py-3 text-right font-semibold text-primary">Interest</th>
                          <th className="px-4 py-3 text-right font-semibold text-primary">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {result.amortizationSchedule.slice(0, 12).map((item) => (
                          <motion.tr
                            key={item.month}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: item.month * 0.02 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-gray-700">{item.month}</td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              ₹{item.emi.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right text-accent font-medium">
                              ₹{item.principal.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right text-warning font-medium">
                              ₹{item.interest.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right text-primary font-semibold">
                              ₹{item.balance.toLocaleString('en-IN')}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {result.amortizationSchedule.length > 12 && (
                      <p className="text-center text-sm text-gray-500 mt-4">
                        Showing first 12 months of {result.amortizationSchedule.length} total
                      </p>
                    )}
                  </div>
                </ResultsCard>

                {/* Early Payoff Scenarios */}
                {result.earlyPayoffScenarios && result.earlyPayoffScenarios.length > 0 && (
                  <ResultsCard title="Early Payoff Scenarios">
                    <div className="grid md:grid-cols-3 gap-4">
                      {result.earlyPayoffScenarios.map((scenario) => (
                        <div key={scenario.extraPayment} className="p-4 bg-success/10 rounded-lg border border-success/20">
                          <p className="text-sm text-gray-600 mb-1">Extra Payment</p>
                          <p className="text-xl font-bold text-primary mb-2">
                            +₹{scenario.extraPayment.toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Save <span className="font-semibold text-success">{scenario.monthsSaved} months</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Save <span className="font-semibold text-success">₹{scenario.interestSaved.toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      ))}
                    </div>
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
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Fill in your loan details and click "Calculate EMI" to see your results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

