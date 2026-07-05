import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Registration',
  description:
    'Get your GST registration done quickly and hassle-free with FinVidhi\'s expert-assisted process.',
  alternates: { canonical: '/services/gst/registration' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
