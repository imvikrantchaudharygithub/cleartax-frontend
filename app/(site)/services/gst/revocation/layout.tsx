import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Revocation',
  description:
    'Restore your cancelled GST registration with FinVidhi\'s expert-assisted revocation service.',
  alternates: { canonical: '/services/gst/revocation' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
