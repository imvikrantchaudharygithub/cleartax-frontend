export interface ComplianceDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'urgent' | 'upcoming' | 'completed';
  category: 'GST' | 'Income Tax' | 'TDS' | 'Other';
}

export interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'verified' | 'pending' | 'rejected';
}

export const complianceDeadlines: ComplianceDeadline[] = [
  {
    id: '1',
    title: 'GSTR-3B Filing',
    description: 'Monthly GST return filing for March 2024',
    dueDate: '2024-04-20',
    status: 'urgent',
    category: 'GST',
  },
  {
    id: '2',
    title: 'TDS Return Q4',
    description: 'Quarterly TDS return for Jan-Mar 2024',
    dueDate: '2024-05-31',
    status: 'upcoming',
    category: 'TDS',
  },
  {
    id: '3',
    title: 'GSTR-1 Filing',
    description: 'Outward supplies return for March 2024',
    dueDate: '2024-04-11',
    status: 'urgent',
    category: 'GST',
  },
  {
    id: '4',
    title: 'Advance Tax Q4',
    description: 'Fourth installment of advance tax payment',
    dueDate: '2024-03-15',
    status: 'completed',
    category: 'Income Tax',
  },
  {
    id: '5',
    title: 'ITR Filing',
    description: 'Income Tax Return filing for AY 2024-25',
    dueDate: '2024-07-31',
    status: 'upcoming',
    category: 'Income Tax',
  },
  {
    id: '6',
    title: 'GST Annual Return',
    description: 'GSTR-9 Annual return for FY 2023-24',
    dueDate: '2024-12-31',
    status: 'upcoming',
    category: 'GST',
  },
  {
    id: '7',
    title: 'Form 16 Issuance',
    description: 'Issue Form 16 to employees',
    dueDate: '2024-06-15',
    status: 'upcoming',
    category: 'TDS',
  },
];

export const complianceDocuments: ComplianceDocument[] = [
  {
    id: '1',
    name: 'GSTR-3B_March_2024.pdf',
    type: 'GST Return',
    uploadDate: '2024-03-28',
    size: '245 KB',
    status: 'verified',
  },
  {
    id: '2',
    name: 'Form_26AS_FY2023-24.pdf',
    type: 'TDS Certificate',
    uploadDate: '2024-04-01',
    size: '189 KB',
    status: 'verified',
  },
  {
    id: '3',
    name: 'ITR_AY2023-24.json',
    type: 'Income Tax Return',
    uploadDate: '2024-07-15',
    size: '156 KB',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Invoice_Register_Q4.xlsx',
    type: 'Invoice Register',
    uploadDate: '2024-03-31',
    size: '1.2 MB',
    status: 'verified',
  },
  {
    id: '5',
    name: 'Balance_Sheet_FY24.pdf',
    type: 'Financial Statement',
    uploadDate: '2024-04-10',
    size: '890 KB',
    status: 'pending',
  },
  {
    id: '6',
    name: 'TDS_Certificate_Q3.pdf',
    type: 'TDS Certificate',
    uploadDate: '2024-01-15',
    size: '167 KB',
    status: 'verified',
  },
];

export interface ComplianceStats {
  filingsDue: number;
  completed: number;
  documents: number;
  lastUpdated: string;
}

export const complianceStats: ComplianceStats = {
  filingsDue: 3,
  completed: 12,
  documents: 24,
  lastUpdated: '2024-04-01',
};

export function getUpcomingDeadlines(limit?: number): ComplianceDeadline[] {
  const upcoming = complianceDeadlines
    .filter(d => d.status === 'urgent' || d.status === 'upcoming')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export function getRecentDocuments(limit?: number): ComplianceDocument[] {
  const sorted = [...complianceDocuments].sort(
    (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );
  
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getDeadlinesByStatus(status: 'urgent' | 'upcoming' | 'completed'): ComplianceDeadline[] {
  return complianceDeadlines.filter(d => d.status === status);
}

