import { IPOCategory } from '@/app/types/ipo';
import { LegalCategory } from '@/app/types/legal';
import { BankingFinanceCategory } from '@/app/types/banking-finance';
import * as lucideIcons from 'lucide-react';

const IPO_STORAGE_KEY = 'cleartax_admin_ipo_subcategories';
const LEGAL_STORAGE_KEY = 'cleartax_admin_legal_subcategories';
const BANKING_FINANCE_STORAGE_KEY = 'cleartax_admin_banking_finance_subcategories';

// Helper to get icon component from name
function getIconFromName(iconName: string) {
  if (!iconName) return lucideIcons.FileText;
  const IconComponent = (lucideIcons as any)[iconName];
  return IconComponent || lucideIcons.FileText;
}

// IPO Subcategories
export function saveIPOSubcategory(subcategory: any): void {
  const existing = getIPOSubcategories();
  const index = existing.findIndex((s) => s.id === subcategory.id);
  
  const subcategoryToStore = {
    ...subcategory,
    iconName: subcategory.iconName || 'FileText',
  };
  delete subcategoryToStore.icon;
  
  if (index >= 0) {
    existing[index] = subcategoryToStore;
  } else {
    existing.push(subcategoryToStore);
  }
  
  localStorage.setItem(IPO_STORAGE_KEY, JSON.stringify(existing));
}

export function getIPOSubcategories(): IPOCategory[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(IPO_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const subcategories = JSON.parse(stored);
    return subcategories.map((sub: any) => ({
      ...sub,
      icon: getIconFromName(sub.iconName || 'FileText'),
      subServices: sub.subServices || [],
    }));
  } catch {
    return [];
  }
}

export function deleteIPOSubcategory(subcategoryId: string): void {
  const existing = getIPOSubcategories();
  const filtered = existing.filter((s) => s.id !== subcategoryId);
  localStorage.setItem(IPO_STORAGE_KEY, JSON.stringify(filtered));
}

// Legal Subcategories
export function saveLegalSubcategory(subcategory: any): void {
  const existing = getLegalSubcategories();
  const index = existing.findIndex((s) => s.id === subcategory.id);
  
  const subcategoryToStore = {
    ...subcategory,
    iconName: subcategory.iconName || 'FileText',
  };
  delete subcategoryToStore.icon;
  
  if (index >= 0) {
    existing[index] = subcategoryToStore;
  } else {
    existing.push(subcategoryToStore);
  }
  
  localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify(existing));
}

export function getLegalSubcategories(): LegalCategory[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(LEGAL_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const subcategories = JSON.parse(stored);
    return subcategories.map((sub: any) => ({
      ...sub,
      icon: getIconFromName(sub.iconName || 'FileText'),
      subServices: sub.subServices || [],
      stats: sub.stats || [],
    }));
  } catch {
    return [];
  }
}

export function deleteLegalSubcategory(subcategoryId: string): void {
  const existing = getLegalSubcategories();
  const filtered = existing.filter((s) => s.id !== subcategoryId);
  localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify(filtered));
}

// Banking & Finance Subcategories
export function saveBankingFinanceSubcategory(subcategory: any): void {
  const existing = getBankingFinanceSubcategories();
  const index = existing.findIndex((s) => s.id === subcategory.id);
  
  const subcategoryToStore = {
    ...subcategory,
    iconName: subcategory.iconName || 'FileText',
  };
  delete subcategoryToStore.icon;
  
  if (index >= 0) {
    existing[index] = subcategoryToStore;
  } else {
    existing.push(subcategoryToStore);
  }
  
  localStorage.setItem(BANKING_FINANCE_STORAGE_KEY, JSON.stringify(existing));
}

export function getBankingFinanceSubcategories(): BankingFinanceCategory[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(BANKING_FINANCE_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const subcategories = JSON.parse(stored);
    return subcategories.map((sub: any) => ({
      ...sub,
      icon: getIconFromName(sub.iconName || 'FileText'),
      subServices: sub.subServices || [],
    }));
  } catch {
    return [];
  }
}

export function deleteBankingFinanceSubcategory(subcategoryId: string): void {
  const existing = getBankingFinanceSubcategories();
  const filtered = existing.filter((s) => s.id !== subcategoryId);
  localStorage.setItem(BANKING_FINANCE_STORAGE_KEY, JSON.stringify(filtered));
}

