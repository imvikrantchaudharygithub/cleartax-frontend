import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EMI Calculator',
  description:
    'Calculate your loan EMI, total interest, and repayment schedule with FinVidhi\'s free online EMI calculator.',
  alternates: { canonical: '/calculators/emi' },
}

export default function EmiCalcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
