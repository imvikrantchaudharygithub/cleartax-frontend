import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Income Tax Calculator',
  description:
    'Calculate your income tax liability under the old and new regimes with FinVidhi\'s free online income tax calculator for India.',
  alternates: { canonical: '/calculators/income-tax' },
}

export default function IncomeTaxCalcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
