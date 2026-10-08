'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { emiSchema, EMIFormData } from '@/app/lib/schemas/calculatorSchemas';
import { calculateEMI, EMIResult } from '@/app/lib/calculations/emiCalculator';
import Input from '@/app/components/fv/Input';
import Select from '@/app/components/fv/Select';
import Checkbox from '@/app/components/ui/Checkbox';
import RangeSlider from '@/app/components/ui/RangeSlider';
import Button from '@/app/components/fv/Button';
import FormError from '@/app/components/forms/FormError';
import ResultsCard from '@/app/components/calculators/ResultsCard';
import CalculatorChart from '@/app/components/calculators/CalculatorChart';
import { ResultEmpty, ResultStat, ResultStatGrid } from '@/app/components/calculators/ResultParts';
import CounterAnimation from '@/app/components/animations/CounterAnimation';
import { CreditCard, Download, Share2 } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import Section from '@/app/components/fv/Section';
import { FV_COLOR_HEX } from '@/app/lib/fv/colors';

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
    <div className="min-h-screen bg-white">
      <PageHero
        icon={CreditCard}
        title="EMI Calculator"
        subtitle="Plan your loan with detailed EMI and amortization schedules"
      />
      <Section soft>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Form Section */}
          <div className="min-w-0 lg:col-span-2">
            <div className="fv-card p-5 md:p-7 lg:sticky lg:top-24">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-fv-navy">
                Enter Loan Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <div className="min-w-0 space-y-6 lg:col-span-3">
            {result ? (
              <>
                {/* Summary Card */}
                <ResultsCard title="EMI Summary">
                  <ResultStatGrid>
                    <ResultStat label="Monthly EMI" tone="blue" size="lg">
                      ₹<CounterAnimation end={result.monthlyEMI} format="number" />
                    </ResultStat>
                    <ResultStat label="Total Amount">
                      ₹<CounterAnimation end={result.totalAmount} format="number" />
                    </ResultStat>
                    <ResultStat label="Total Interest">
                      ₹<CounterAnimation end={result.totalInterest} format="number" />
                    </ResultStat>
                    {(result.processingFee > 0 || result.insuranceTotal > 0) && (
                      <ResultStat label="Additional Costs">
                        ₹<CounterAnimation end={result.processingFee + result.insuranceTotal} format="number" />
                      </ResultStat>
                    )}
                  </ResultStatGrid>
                </ResultsCard>

                {/* Payment Breakdown Chart */}
                <ResultsCard title="Payment Over Time">
                  <CalculatorChart
                    type="line"
                    data={chartData}
                    dataKeys={['principal', 'interest', 'balance']}
                    xAxisKey="month"
                    colors={[FV_COLOR_HEX.blue.fg, FV_COLOR_HEX.orange.fg, FV_COLOR_HEX.green.fg]}
                  />
                </ResultsCard>

                {/* Amortization Table */}
                <ResultsCard title="Amortization Schedule">
                  <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead className="bg-fv-wash">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-fv-navy">Month</th>
                          <th className="px-4 py-3 text-right font-semibold text-fv-navy">EMI</th>
                          <th className="px-4 py-3 text-right font-semibold text-fv-navy">Principal</th>
                          <th className="px-4 py-3 text-right font-semibold text-fv-navy">Interest</th>
                          <th className="px-4 py-3 text-right font-semibold text-fv-navy">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-fv-line">
                        {result.amortizationSchedule.slice(0, 12).map((item) => (
                          <motion.tr
                            key={item.month}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: item.month * 0.02 }}
                            className="hover:bg-fv-wash"
                          >
                            <td className="px-4 py-3 text-fv-slate">{item.month}</td>
                            <td className="px-4 py-3 text-right text-fv-slate">
                              ₹{item.emi.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-fv-blue-d">
                              ₹{item.principal.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-fv-slate">
                              ₹{item.interest.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-fv-navy">
                              ₹{item.balance.toLocaleString('en-IN')}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {result.amortizationSchedule.length > 12 && (
                      <p className="mt-4 text-center text-sm text-fv-slate">
                        Showing first 12 months of {result.amortizationSchedule.length} total
                      </p>
                    )}
                  </div>
                </ResultsCard>

                {/* Early Payoff Scenarios */}
                {result.earlyPayoffScenarios && result.earlyPayoffScenarios.length > 0 && (
                  <ResultsCard title="Early Payoff Scenarios">
                    <div className="grid gap-4 md:grid-cols-3">
                      {result.earlyPayoffScenarios.map((scenario) => (
                        <div key={scenario.extraPayment} className="rounded-[12px] border border-fv-green/30 bg-fv-green-50 p-4">
                          <p className="mb-1 text-sm text-fv-slate">Extra Payment</p>
                          <p className="mb-2 text-xl font-extrabold tracking-tight text-fv-navy">
                            +₹{scenario.extraPayment.toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm text-fv-slate">
                            Save <span className="font-semibold text-fv-green-d">{scenario.monthsSaved} months</span>
                          </p>
                          <p className="text-sm text-fv-slate">
                            Save <span className="font-semibold text-fv-green-d">₹{scenario.interestSaved.toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      ))}
                    </div>
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
                <ResultEmpty icon={CreditCard}>
                  Fill in your loan details and click &quot;Calculate EMI&quot; to see your results
                </ResultEmpty>
              </motion.div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
