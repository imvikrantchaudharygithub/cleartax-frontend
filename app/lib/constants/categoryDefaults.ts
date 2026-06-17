/**
 * Shared category page-content defaults and icon options.
 *
 * The public category page falls back to these when a category has no
 * heroStats / whyChooseSection in the DB, so the admin editor uses the SAME
 * values as placeholders — what an admin sees while editing is exactly what a
 * visitor sees on the live page.
 */

export interface WhyChooseItem {
  title: string;
  description: string;
  iconName: string;
}

export interface WhyChooseSection {
  heading: string;
  items: WhyChooseItem[];
}

export interface HeroStatItem {
  label: string;
  iconName: string;
}

export const DEFAULT_WHY_CHOOSE_SECTION: WhyChooseSection = {
  heading: 'Why Choose FinVidhi?',
  items: [
    {
      title: 'Expert CA Team',
      description: 'Our team of experienced Chartered Accountants ensures 100% accurate compliance.',
      iconName: 'Users',
    },
    {
      title: 'Quick Processing',
      description: 'Fast turnaround time with most services completed within the specified timeline.',
      iconName: 'Zap',
    },
    {
      title: 'Secure & Reliable',
      description: 'Your data is safe with us. Bank-grade security and complete confidentiality.',
      iconName: 'Shield',
    },
  ],
};

export const DEFAULT_HERO_STATS: HeroStatItem[] = [
  { label: '50,000+ Registrations', iconName: 'CircleCheckBig' },
  { label: 'Expert CA Team', iconName: 'Users' },
  { label: '99.9% Success Rate', iconName: 'Shield' },
  { label: 'Quick Processing', iconName: 'Zap' },
];

/** Curated lucide-react icon names offered in the admin icon picker. */
export const ICON_OPTIONS: string[] = Array.from(
  new Set([
    'Receipt', 'FileText', 'Calculator', 'Building2', 'Award', 'Scale',
    'Briefcase', 'Shield', 'CheckCircle', 'Users', 'Zap', 'TrendingUp',
    'Landmark', 'Banknote', 'Percent', 'BadgeCheck', 'FileBadge', 'Stamp',
    'ClipboardCheck', 'FileCheck', 'FileSearch', 'FileSpreadsheet', 'Wallet',
    'CircleDollarSign', 'CreditCard', 'Library', 'Gavel', 'Building',
    'BadgeDollarSign', 'ChartBar', 'ChartLine', 'ChartPie', 'Coins', 'IndianRupee',
    'HandCoins', 'PiggyBank', 'ReceiptIndianRupee', 'CirclePercent',
    'FilePenLine', 'FileChartColumn', 'FileClock', 'FolderSearch',
    'ShieldCheck', 'ShieldAlert', 'BriefcaseBusiness',
    'Store', 'WalletCards', 'WalletMinimal', 'TicketCheck',
    'BadgePercent', 'CircleCheck', 'CircleCheckBig', 'CircleHelp',
    'ClipboardList', 'DollarSign', 'Handshake',
    'NotebookPen', 'Scan', 'ShieldHalf', 'ShieldQuestion',
    'Signature', 'TicketPercent', 'UserCheck',
    'UsersRound', 'FolderCheck', 'FolderClock', 'FolderKey',
  ])
);

/** lucide-react also exports non-renderable helpers (e.g. the base `Icon`). */
export const NON_RENDERABLE_ICONS = new Set([
  'Icon', 'LucideIcon', 'createLucideIcon', 'icons', 'default',
]);
