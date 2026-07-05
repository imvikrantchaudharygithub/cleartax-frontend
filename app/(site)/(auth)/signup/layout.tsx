import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your FinVidhi account to access expert tax, GST and compliance services for your business.',
  alternates: { canonical: '/signup' },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
