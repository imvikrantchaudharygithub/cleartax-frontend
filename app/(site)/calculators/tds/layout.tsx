import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TDS Calculator',
  description:
    'Calculate Tax Deducted at Source (TDS) on salary, interest, rent, and professional fees with FinVidhi\'s free online TDS calculator.',
  alternates: { canonical: '/calculators/tds' },
}

export default function TdsCalcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
