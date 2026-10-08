import Image from 'next/image';
import Link from 'next/link';
import IntentLink from '../fv/IntentLink';
import { isIntentOnlyHref } from '@/app/lib/fv/intent';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Products',
    links: [
      { label: 'Income Tax Calculator', href: '/calculators/income-tax' },
      { label: 'GST Calculator', href: '/calculators/gst' },
      { label: 'EMI Calculator', href: '/calculators/emi' },
      { label: 'HRA Calculator', href: '/calculators/hra' },
      { label: 'TDS Calculator', href: '/calculators/tds' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Team', href: '/team' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'All Services', href: '/services' },
      { label: 'Compliance', href: '/compliance' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const LEGAL = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
];

const SOCIAL = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="bg-fv-navy text-white">
      <div className="fv-wrap grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2" aria-label="FinVidhi home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white">
              <Image src="/images/finvidhi-icon.png" alt="" width={30} height={30} className="h-[30px] w-[30px] object-contain" />
            </span>
            <span className="text-[22px] font-extrabold tracking-[-0.02em]">
              Fin<span className="text-[#6BB8E8]">Vidhi</span>
            </span>
          </Link>
          <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-white/70">
            Your complete tax &amp; compliance solution. Calculate, comply, and save with confidence.
          </p>
          <ul className="mt-5 flex gap-2">
            {SOCIAL.map((social) => {
              const Icon = social.icon;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-[15px] font-bold">{column.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  {isIntentOnlyHref(link.href) ? (
                    <IntentLink href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </IntentLink>
                  ) : (
                    <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-[15px] font-bold">Newsletter</h2>
          <p className="mt-4 text-sm text-white/70">Subscribe to get tax tips and updates.</p>
          <form className="mt-3 flex gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Your email"
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base text-white outline-none placeholder:text-white/40 focus:border-[#6BB8E8] md:text-sm"
            />
            <button type="submit" className="rounded-lg bg-fv-blue-d px-4 text-sm font-semibold text-white hover:bg-fv-blue-dd">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="fv-wrap flex flex-col items-center justify-between gap-3 py-6 text-sm text-white/60 md:flex-row">
          <p>&copy; {new Date().getFullYear()} FinVidhi. All rights reserved.</p>
          <ul className="flex gap-5">
            {LEGAL.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
