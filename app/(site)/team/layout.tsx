import type { Metadata } from 'next'

// Wraps both /team and /team/[id]. No canonical here — it would cascade to
// every member profile.
export const metadata: Metadata = {
  title: 'Our Team — Meet the FinVidhi Experts',
  description:
    'Meet the FinVidhi team of chartered accountants, tax experts, and compliance professionals dedicated to simplifying tax and compliance for your business.',
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
