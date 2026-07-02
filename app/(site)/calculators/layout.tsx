import type { Metadata } from 'next'

// Wraps /calculators and all /calculators/* pages. The canonical below is
// correct for the hub; each sub-calculator overrides it in its own layout.
export const metadata: Metadata = {
  title: 'Free Tax Calculators — Income Tax, GST, EMI, HRA & TDS',
  description:
    'Free online calculators for income tax, GST, EMI, HRA exemption, and TDS. Fast, accurate estimates for Indian taxpayers and businesses.',
  alternates: { canonical: '/calculators' },
}

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
