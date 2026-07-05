import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Annual Return Filing',
  description:
    'File your GSTR-9 annual return accurately and on time with FinVidhi.',
  alternates: { canonical: '/services/gst/annual-return' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
