import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST e-Invoicing',
  description:
    'Set up GST e-invoicing compliance for your business with FinVidhi.',
  alternates: { canonical: '/services/gst/e-invoicing' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
