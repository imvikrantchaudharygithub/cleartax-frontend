export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  notes: string;
  sourcePage: string;
  timestamp: string;
  type: 'callback' | 'query';
}

const STORAGE_KEY = 'cleartax_admin_inquiries';

export function saveInquiry(inquiry: Omit<Inquiry, 'id' | 'timestamp'>): void {
  const existing = getInquiries();
  const newInquiry: Inquiry = {
    ...inquiry,
    id: `inquiry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  
  existing.push(newInquiry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getInquiries(): Inquiry[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function deleteInquiry(inquiryId: string): void {
  const existing = getInquiries();
  const filtered = existing.filter((i) => i.id !== inquiryId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getInquiryById(inquiryId: string): Inquiry | undefined {
  return getInquiries().find((i) => i.id === inquiryId);
}

