import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Amendment',
  description:
    'Update your GST registration details quickly and correctly with FinVidhi.',
  alternates: { canonical: '/services/gst/amendment' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
