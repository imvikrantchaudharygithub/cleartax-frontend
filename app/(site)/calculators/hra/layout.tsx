import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HRA Exemption Calculator',
  description:
    'Calculate your House Rent Allowance (HRA) exemption and taxable HRA with FinVidhi\'s free online HRA calculator for salaried employees.',
  alternates: { canonical: '/calculators/hra' },
}

export default function HraCalcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
