import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Nil Return Filing',
  description:
    'File your GST nil returns on time with FinVidhi and stay compliant.',
  alternates: { canonical: '/services/gst/nil-return' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
