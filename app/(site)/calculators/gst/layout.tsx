import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Calculator',
  description:
    'Calculate GST inclusive and exclusive amounts across all GST slabs (5%, 12%, 18%, 28%) with FinVidhi\'s free online GST calculator.',
  alternates: { canonical: '/calculators/gst' },
}

export default function GstCalcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
