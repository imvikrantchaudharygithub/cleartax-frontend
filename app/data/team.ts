export type TeamMember = {
  id: string;
  name: string;
  role: string;
  description: string;
  linkedin: string;
  avatar?: string;
  accent?: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: 'ananya-mehta',
    name: 'Ananya Mehta',
    role: 'Chief Executive Officer',
    description: 'Guides vision, product direction, and builds high-performing teams focused on customer trust.',
    linkedin: 'https://www.linkedin.com/',
    accent: 'from-orange-400 to-amber-500',
  },
  {
    id: 'rahul-iyer',
    name: 'Rahul Iyer',
    role: 'Chief Technology Officer',
    description: 'Scales the platform architecture, security, and reliability for millions of filings.',
    linkedin: 'https://www.linkedin.com/',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'priya-kapoor',
    name: 'Priya Kapoor',
    role: 'Head of Product',
    description: 'Obsesses over user journeys and outcomes, turning compliance workflows into simple flows.',
    linkedin: 'https://www.linkedin.com/',
    accent: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'arjun-malhotra',
    name: 'Arjun Malhotra',
    role: 'Head of Engineering',
    description: 'Leads engineering excellence, performance budgets, and delivery velocity across squads.',
    linkedin: 'https://www.linkedin.com/',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'isha-singh',
    name: 'Isha Singh',
    role: 'Design Lead',
    description: 'Owns the design system and accessible experiences that keep the brand consistent.',
    linkedin: 'https://www.linkedin.com/',
    accent: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'karthik-menon',
    name: 'Karthik Menon',
    role: 'Customer Success Lead',
    description: 'Partners with customers to ensure smooth onboarding, training, and ongoing value.',
    linkedin: 'https://www.linkedin.com/',
    accent: 'from-amber-500 to-lime-500',
  },
];

