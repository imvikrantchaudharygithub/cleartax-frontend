import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST LUT Filing',
  description:
    'File your Letter of Undertaking (LUT) for zero-rated exports with FinVidhi.',
  alternates: { canonical: '/services/gst/lut' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
