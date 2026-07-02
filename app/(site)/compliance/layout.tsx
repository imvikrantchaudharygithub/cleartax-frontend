import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compliance Calendar & Deadlines',
  description:
    'Track upcoming GST, income tax, and statutory compliance deadlines for your business with the FinVidhi compliance calendar.',
  alternates: { canonical: '/compliance' },
}

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
