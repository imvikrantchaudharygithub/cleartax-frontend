'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Menu, X, Calculator, FileText, BarChart3, ChevronDown, Receipt, Building2, Award, TrendingUp, Scale } from 'lucide-react';
import Button from '../ui/Button';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Home', href: '/' },
  { 
    label: 'Services', 
    href: '/services',
    dropdown: [
      { label: 'Statutory Compliances', href: '#', icon: null, isHeading: true },
      { label: 'GST Services', href: '/services/gst', icon: Receipt },
      { label: 'Business Registration', href: '/services/registration', icon: Building2 },
      { label: 'Income Tax', href: '/services/income-tax', icon: Calculator },
      { label: 'Trademarks & IP', href: '/services/trademarks', icon: Award },
      { label: 'Legal Services', href: '/services/legal', icon: Scale },
    ]
  },
  { label: 'IPO Services', href: '/services/ipo', isHighlighted: true },
  { label: 'Banking & Finance', href: '/services/banking-finance', isHighlighted: true },
  { label: 'Calculators', href: '/calculators' },
  { label: 'Compliance', href: '/compliance' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);

      if (navRef.current && scrolled) {
        gsap.to(navRef.current, {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          duration: 0.3,
          ease: 'power2.out',
        });
      } else if (navRef.current) {
        gsap.to(navRef.current, {
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      className={clsx(
        'sticky top-0 z-50 bg-white transition-all duration-300',
        isScrolled && 'shadow-md'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-primary">
              ClearTax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="relative group"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={clsx(
                    'text-sm font-medium transition-colors relative py-2 flex items-center gap-1 rounded-lg px-3 whitespace-nowrap',
                    item.isHighlighted
                      ? (pathname.startsWith('/services/ipo') && item.href === '/services/ipo') || 
                        (pathname.startsWith('/services/banking-finance') && item.href === '/services/banking-finance')
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md'
                      : pathname === item.href || (item.dropdown && pathname.startsWith('/services') && !pathname.startsWith('/services/ipo') && !pathname.startsWith('/services/legal') && !pathname.startsWith('/services/banking-finance'))
                        ? 'text-accent'
                        : 'text-gray-700 hover:text-accent'
                  )}
                >
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown className={clsx(
                      'w-4 h-4 transition-transform',
                      activeDropdown === item.label && 'rotate-180'
                    )} />
                  )}
                  {pathname === item.href && !item.dropdown && !item.isHighlighted && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.dropdown && activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 pt-2 w-64 z-50"
                  >
                    <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-2 overflow-hidden">
                      {item.dropdown.map((dropdownItem, index) => {
                        if (dropdownItem.isHeading) {
                          return (
                            <div
                              key={`heading-${index}`}
                              className="px-4 py-2 bg-gray-50 border-b border-gray-100"
                            >
                              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {dropdownItem.label}
                              </span>
                            </div>
                          );
                        }
                        const Icon = dropdownItem.icon;
                        return (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent/5 transition-colors"
                          >
                            {Icon && (
                              <div className="w-8 h-8 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center">
                                <Icon className="w-4 h-4 text-accent" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {dropdownItem.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          {/* <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            <Link href="/auth/login">
              <Button variant="tertiary" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
          </div> */}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      item.isHighlighted
                        ? (pathname.startsWith('/services/ipo') && item.href === '/services/ipo') || 
                          (pathname.startsWith('/services/banking-finance') && item.href === '/services/banking-finance')
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : pathname === item.href
                          ? 'bg-accent/10 text-accent'
                          : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </Link>
                  {/* Mobile Dropdown */}
                  {item.dropdown && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.dropdown.map((dropdownItem, index) => {
                        if (dropdownItem.isHeading) {
                          return (
                            <div
                              key={`heading-${index}`}
                              className="px-4 py-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {dropdownItem.label}
                              </span>
                            </div>
                          );
                        }
                        const Icon = dropdownItem.icon;
                        return (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                          >
                            {Icon && <Icon className="w-4 h-4" />}
                            {dropdownItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {/* <div className="pt-4 space-y-2">
                <Link href="/auth/login" className="block">
                  <Button variant="tertiary" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

