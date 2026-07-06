'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, Calculator, Menu, X, ChevronDown, ChevronRight, BookOpen, MessageSquare, Database, UserCircle, Star, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

/**
 * Resolve the logged-in admin's identity client-side (no API call):
 * 1. `admin_user` cookie set by the login route ({ email, fullName })
 * 2. fallback: decode the JWT payload in `admin_token_access` (has email/role)
 */
function readAdminUser(): { fullName?: string; email?: string } | null {
  if (typeof document === 'undefined') return null;
  const cookie = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const userCookie = cookie('admin_user');
  if (userCookie) {
    try {
      const parsed = JSON.parse(userCookie);
      if (parsed?.email) return parsed;
    } catch {
      /* fall through to JWT */
    }
  }

  const token = cookie('admin_token_access');
  if (token) {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      if (payload?.email) return { email: payload.email };
    } catch {
      /* ignore malformed token */
    }
  }
  return null;
}

const serviceCategories = [
  { label: 'GST Services', href: '/admin/services/gst', slug: 'gst' },
  { label: 'Income Tax', href: '/admin/services/income-tax', slug: 'income-tax' },
  { label: 'Registration', href: '/admin/services/registration', slug: 'registration' },
  { label: 'Trademarks', href: '/admin/services/trademarks', slug: 'trademarks' },
  { label: 'IPO Services', href: '/admin/services/ipo', slug: 'ipo' },
  { label: 'Legal Services', href: '/admin/services/legal', slug: 'legal' },
  { label: 'Banking & Finance', href: '/admin/services/banking-finance', slug: 'banking-finance' },
];

const navItems = [
  { label: 'Dashboard', href: '/admin/home', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Team', href: '/admin/team', icon: UserCircle },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { label: 'Blog', href: '/admin/blog', icon: BookOpen },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Home Info', href: '/admin/home-info', icon: LayoutDashboard },
  { label: 'Contact Info', href: '/admin/contact', icon: Phone },
  { label: 'Calculators', href: '/admin/calculators', icon: Calculator },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isServicesActive = pathname?.startsWith('/admin/services');
  const [isServicesOpen, setIsServicesOpen] = useState(isServicesActive);
  const [adminUser, setAdminUser] = useState<{ fullName?: string; email?: string } | null>(null);

  // Read the logged-in user after mount (cookies aren't available during SSR).
  useEffect(() => {
    setAdminUser(readAdminUser());
  }, []);
  
  // Auto-expand services dropdown when on services page
  useEffect(() => {
    if (isServicesActive) {
      setIsServicesOpen(true);
    }
  }, [isServicesActive]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 transition-transform duration-300',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-800">
            <Link href="/" prefetch={false} className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white shrink-0">
                <Image
                  src="/images/finvidhi-icon.png"
                  alt="FinVidhi"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </span>
              <span>
                <span className="block text-xl font-bold text-white leading-tight">FinVidhi Admin</span>
                <span className="block text-sm text-gray-400">Management Portal</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Services Dropdown */}
            <div>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={clsx(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors',
                  isServicesActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">Services</span>
                </div>
                {isServicesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isServicesOpen && (
                <div className="mt-2 ml-4 space-y-1 border-l border-gray-700 pl-4">
                  {serviceCategories.map((category) => {
                    const isCategoryActive = pathname === category.href;
                    return (
                      <Link
                        key={category.href}
                        href={category.href}
                        prefetch={false}
                        onClick={() => setIsMobileOpen(false)}
                        className={clsx(
                          'block px-4 py-2 rounded-lg transition-colors text-sm',
                          isCategoryActive
                            ? 'bg-primary/20 text-primary border-l-2 border-primary'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        )}
                      >
                        {category.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Migration Link */}
            <Link
              href="/admin/migrate"
              prefetch={false}
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4',
                pathname === '/admin/migrate'
                  ? 'bg-accent text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">Migrate Data</span>
            </Link>
          </nav>

          {/* Footer — shows the actual logged-in admin */}
          <div className="p-4 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              <p className="font-medium text-gray-300 mb-1">
                {adminUser?.fullName || 'Admin'}
              </p>
              {adminUser?.email && <p className="text-xs">{adminUser.email}</p>}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

