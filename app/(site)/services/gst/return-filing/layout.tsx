import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Return Filing',
  description:
    'File your GST returns on time, every time, with FinVidhi\'s expert-assisted GST return filing service.',
  alternates: { canonical: '/services/gst/return-filing' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
