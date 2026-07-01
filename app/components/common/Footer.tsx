'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calculator, Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const footerLinks = {
  products: [
    { label: 'Income Tax Calculator', href: '/calculators/income-tax' },
    { label: 'GST Calculator', href: '/calculators/gst' },
    { label: 'EMI Calculator', href: '/calculators/emi' },
    { label: 'HRA Calculator', href: '/calculators/hra' },
    { label: 'TDS Calculator', href: '/calculators/tds' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Help Center', href: '/help' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Tax Guides', href: '/guides' },
    { label: 'Compliance', href: '/compliance' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
];

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!columnsRef.current || !footerRef.current) return;

    const footerEl = footerRef.current;
    const columns = columnsRef.current.querySelectorAll<HTMLElement>('.footer-column');
    if (!columns.length) return;

    // Respect reduced-motion: show immediately, no animation.
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      gsap.set(columns, { opacity: 1, y: 0 });
      return;
    }

    const anim = gsap.fromTo(
      columns,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerEl,
          // Reveal as soon as the footer edge enters the viewport, and only once.
          start: 'top 95%',
          once: true,
        },
      }
    );

    // ScrollTrigger computes positions on mount. Images / API-fed sections above the
    // footer often load AFTER that, shifting the footer down and leaving the trigger
    // point stale — which is why the footer never revealed on some devices. Recompute
    // once everything has loaded.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 600);

    // Absolute safety net: if the trigger still hasn't fired (e.g. mis-measured layout
    // on an unusual viewport), force the footer visible so it can NEVER be stuck hidden.
    const safetyTimer = window.setTimeout(() => {
      columns.forEach((el) => {
        if (parseFloat(getComputedStyle(el).opacity) < 0.99) {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.3, overwrite: 'auto' });
        }
      });
    }, 2500);

    return () => {
      window.removeEventListener('load', onLoad);
      clearTimeout(refreshTimer);
      clearTimeout(safetyTimer);
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  return (
    <footer ref={footerRef} className="bg-gradient-to-br from-primary via-primary-700 to-primary-900 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div ref={columnsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="footer-column lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white shadow-lg group-hover:shadow-glow transition-shadow duration-300">
                <Image
                  src="/images/finvidhi-icon.png"
                  alt=""
                  width={36}
                  height={36}
                  className="w-9 h-9 object-contain"
                />
              </span>
              <span className="text-xl font-heading font-bold">FinVidhi</span>
            </Link>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Your complete tax & compliance solution. Calculate, comply, and save with confidence.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gradient-to-br hover:from-accent hover:to-teal flex items-center justify-center transition-all duration-200 cursor-pointer"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Products Column */}
          <div className="footer-column">
            <h3 className="font-heading font-semibold text-lg mb-4 text-brand-blue-light">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-brand-green-light transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="footer-column">
            <h3 className="font-heading font-semibold text-lg mb-4 text-brand-blue-light">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-brand-green-light transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="footer-column">
            <h3 className="font-heading font-semibold text-lg mb-4 text-brand-blue-light">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-brand-green-light transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="footer-column">
            <h3 className="font-heading font-semibold text-lg mb-4 text-brand-blue-light">Newsletter</h3>
            <p className="text-sm text-gray-300 mb-3">
              Subscribe to get tax tips and updates.
            </p>
            <form className="flex flex-col space-y-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-l-lg bg-white/10 border border-white/20 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-accent to-teal rounded-r-lg hover:opacity-90 transition-opacity cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-300">
              &copy; 2024 FinVidhi. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-300 hover:text-brand-green-light transition-colors cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
