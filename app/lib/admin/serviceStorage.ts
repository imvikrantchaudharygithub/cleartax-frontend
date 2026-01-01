import { Service } from '@/app/types/services';
import * as lucideIcons from 'lucide-react';

const STORAGE_KEY = 'cleartax_admin_services';

// Helper to get icon component from name
function getIconFromName(iconName: string) {
  if (!iconName) return lucideIcons.FileText;
  const IconComponent = (lucideIcons as any)[iconName];
  return IconComponent || lucideIcons.FileText;
}

export function saveService(service: any): void {
  const existing = getServices();
  const index = existing.findIndex((s) => s.id === service.id);
  
  // Prepare service for storage (remove icon component, keep iconName)
  const serviceToStore = {
    ...service,
    iconName: service.iconName || 'FileText',
  };
  delete serviceToStore.icon; // Remove component before storing
  
  if (index >= 0) {
    existing[index] = serviceToStore;
  } else {
    existing.push(serviceToStore);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getServices(): Service[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const services = JSON.parse(stored);
    // Reconstruct icon components from icon names
    return services.map((service: any) => ({
      ...service,
      icon: getIconFromName(service.iconName || 'FileText'),
    }));
  } catch {
    return [];
  }
}

export function deleteService(serviceId: string): void {
  const existing = getServices();
  const filtered = existing.filter((s) => s.id !== serviceId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getServiceById(serviceId: string): Service | undefined {
  return getServices().find((s) => s.id === serviceId);
}

