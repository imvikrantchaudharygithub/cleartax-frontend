'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import IntentLink from '../fv/IntentLink';
import { usePathname } from 'next/navigation';
import {
  Award,
  BookOpen,
  Building2,
  Calculator,
  ChevronDown,
  FileCheck,
  Landmark,
  Menu,
  Phone,
  Receipt,
  Scale,
  TrendingUp,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { IconTileFrame } from '../fv/IconTile';
import Button from '../fv/Button';
import RequestCallbackModal from '../home/RequestCallbackModal';
import { isIntentOnlyHref } from '@/app/lib/fv/intent';
import type { FvColor } from '@/app/lib/fv/colors';

/**
 * Published solution, as passed by (site)/layout.tsx (Solutions plan). `icon` is an element the
 * server layout already rendered: the nav ships on every page, so it never resolves icon names
 * (that would pull the whole lucide namespace into the shared client bundle).
 */
export interface NavSolution {
  slug: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  color: FvColor;
}

/** /services* pulls a heavy icon chunk, so those links prefetch on intent only (IntentLink). */
function NavLink(props: Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const Cmp = isIntentOnlyHref(props.href) ? IntentLink : Link;
  return <Cmp {...props} />;
}

interface MenuLink {
  label: string;
  href: string;
  icon: ReactNode;
  description?: string;
  color?: FvColor;
}

interface NavItem {
  label: string;
  href?: string;
  menu?: MenuLink[];
  match: (path: string) => boolean;
}

const SERVICES_MENU: MenuLink[] = [
  { label: 'GST Services', href: '/services/gst', icon: <Receipt strokeWidth={1.9} /> },
  { label: 'Business Registration', href: '/services/registration', icon: <Building2 strokeWidth={1.9} /> },
  { label: 'Income Tax', href: '/services/income-tax', icon: <Calculator strokeWidth={1.9} /> },
  { label: 'Trademarks & IP', href: '/services/trademarks', icon: <Award strokeWidth={1.9} /> },
  { label: 'Legal Services', href: '/services/legal', icon: <Scale strokeWidth={1.9} /> },
  { label: 'IPO Services', href: '/services/ipo', icon: <TrendingUp strokeWidth={1.9} /> },
  { label: 'Banking & Finance', href: '/services/banking-finance', icon: <Landmark strokeWidth={1.9} /> },
];

const RESOURCES_MENU: MenuLink[] = [
  { label: 'Blog', href: '/blog', icon: <BookOpen strokeWidth={1.9} /> },
  { label: 'Calculators', href: '/calculators', icon: <Calculator strokeWidth={1.9} /> },
  { label: 'Compliance', href: '/compliance', icon: <FileCheck strokeWidth={1.9} /> },
];

function buildItems(solutions: NavSolution[]): NavItem[] {
  const items: NavItem[] = [
    { label: 'Home', href: '/', match: (p) => p === '/' },
    { label: 'Services', href: '/services', menu: SERVICES_MENU, match: (p) => p.startsWith('/services') },
  ];
  if (solutions.length > 0) {
    items.push({
      label: 'Solutions',
      menu: solutions.map((s) => ({
        label: s.title,
        href: `/solutions/${s.slug}`,
        icon: s.icon,
        description: s.subtitle,
        color: s.color,
      })),
      match: (p) => p.startsWith('/solutions'),
    });
  }
  items.push(
    {
      label: 'Resources',
      menu: RESOURCES_MENU,
      match: (p) => ['/blog', '/calculators', '/compliance'].some((r) => p.startsWith(r)),
    },
    { label: 'Team', href: '/team', match: (p) => p.startsWith('/team') },
    { label: 'Contact', href: '/contact', match: (p) => p.startsWith('/contact') },
  );
  return items;
}

export default function Navigation({ solutions = [] }: { solutions?: NavSolution[] }) {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const hoverOpened = useRef<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const items = buildItems(solutions);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 border-b bg-white transition-shadow',
        scrolled ? 'border-fv-line shadow-[0_4px_20px_rgba(30,44,89,.08)]' : 'border-transparent',
      )}
    >
      <nav aria-label="Main" className="fv-wrap flex h-[68px] items-center gap-6">
        <Link href="/" className="flex flex-none items-center gap-2" aria-label="FinVidhi home">
          <Image src="/images/finvidhi-icon.png" alt="" width={36} height={36} priority className="h-9 w-9 object-contain" />
          <span className="text-[22px] font-extrabold tracking-[-0.02em] text-fv-navy">
            Fin<span className="text-fv-blue">Vidhi</span>
          </span>
        </Link>

        <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {items.map((item) => (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() => {
                if (item.menu) {
                  hoverOpened.current = item.label;
                  setOpenDropdown(item.label);
                }
              }}
              onMouseLeave={() => {
                if (item.menu) {
                  hoverOpened.current = null;
                  setOpenDropdown(null);
                }
              }}
              onBlur={(e) => {
                if (item.menu && !e.currentTarget.contains(e.relatedTarget as Node)) setOpenDropdown(null);
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Escape' || !item.menu) return;
                // Closing unmounts the menu; if focus was inside it, hand it back to this item's
                // toggle (Services chevron / Resources button) instead of letting it fall to <body>.
                const menu = e.currentTarget.querySelector('[id^="nav-menu-"]');
                if (menu?.contains(document.activeElement)) {
                  e.currentTarget.querySelector<HTMLButtonElement>('button[aria-controls]')?.focus();
                }
                setOpenDropdown(null);
              }}
            >
              <DesktopItem
                item={item}
                active={item.match(pathname)}
                open={openDropdown === item.label}
                onToggle={() => {
                  if (hoverOpened.current === item.label) {
                    setOpenDropdown(item.label);
                    hoverOpened.current = null;
                  } else {
                    setOpenDropdown(openDropdown === item.label ? null : item.label);
                  }
                }}
              />
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button className="hidden sm:inline-flex" onClick={() => setCallbackOpen(true)}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Request Callback
          </Button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg text-fv-navy hover:bg-fv-wash lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="max-h-[calc(100vh-68px)] overflow-y-auto border-t border-fv-line bg-white lg:hidden">
          <ul className="fv-wrap space-y-1 py-4">
            {items.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <NavLink
                    href={item.href}
                    className={clsx(
                      'block rounded-lg px-3 py-2.5 text-[15px] font-semibold',
                      item.match(pathname) ? 'bg-fv-blue-50 text-fv-blue-d' : 'text-fv-navy hover:bg-fv-wash',
                    )}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <p className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-fv-slate">{item.label}</p>
                )}
                {item.menu && (
                  <ul className="ml-3 space-y-0.5 border-l border-fv-line pl-3">
                    {item.menu.map((link) => (
                      <li key={link.href}>
                        <NavLink
                          href={link.href}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-fv-slate hover:bg-fv-wash hover:text-fv-navy"
                        >
                          <IconTileFrame color={link.color ?? 'blue'} size="sm">
                            {link.icon}
                          </IconTileFrame>
                          {link.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="pt-3">
              <Button
                className="w-full"
                onClick={() => {
                  setMenuOpen(false);
                  setCallbackOpen(true);
                }}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Request Callback
              </Button>
            </li>
          </ul>
        </div>
      )}

      <RequestCallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </header>
  );
}

function DesktopItem({
  item,
  active,
  open,
  onToggle,
}: {
  item: NavItem;
  active: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const base = clsx(
    'relative flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-medium transition-colors',
    active ? 'text-fv-blue-d' : 'text-fv-navy hover:text-fv-blue-d',
  );
  const underline = active ? (
    <span aria-hidden="true" className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-fv-blue-d" />
  ) : null;

  if (!item.menu) {
    return (
      <NavLink href={item.href ?? '/'} className={base} aria-current={active ? 'page' : undefined}>
        {item.label}
        {underline}
      </NavLink>
    );
  }

  const menuId = `nav-menu-${item.label.toLowerCase()}`;
  const chevron = <ChevronDown aria-hidden="true" className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')} />;

  return (
    <>
      {item.href ? (
        <span className="flex items-center">
          <NavLink href={item.href} className={clsx(base, 'pr-1')}>
            {item.label}
            {underline}
          </NavLink>
          <button
            type="button"
            aria-label={`${item.label} menu`}
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={onToggle}
            className="grid h-8 w-6 place-items-center rounded text-fv-navy hover:text-fv-blue-d"
          >
            {chevron}
          </button>
        </span>
      ) : (
        <button type="button" aria-haspopup="true" aria-expanded={open} aria-controls={menuId} onClick={onToggle} className={base}>
          {item.label}
          {chevron}
          {underline}
        </button>
      )}
      {open && (
        <div id={menuId} className={`absolute left-0 top-full z-50 pt-2 ${item.menu.some((l) => l.description) ? 'w-80' : 'w-72'}`}>
          {/* A3: a long Solutions list scrolls inside the dropdown instead of running off-screen. */}
          <ul className="fv-card max-h-[calc(100vh-84px)] overflow-y-auto p-2 shadow-fv-raised">
            {item.menu.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-fv-wash">
                  <IconTileFrame color={link.color ?? 'blue'} size="sm">
                    {link.icon}
                  </IconTileFrame>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-fv-navy">{link.label}</span>
                    {link.description && <span className="block truncate text-xs text-fv-slate">{link.description}</span>}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
