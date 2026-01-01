/**
 * Utility functions to convert API data to component format
 */

import * as lucideIcons from 'lucide-react';
import { Service, ServiceCategory } from '@/app/types/services';

// Helper to get icon component from iconName
export function getIconFromName(iconName: string | null | undefined) {
  if (!iconName) return lucideIcons.FileText;
  try {
    const IconComponent = (lucideIcons as any)[iconName];
    return IconComponent || lucideIcons.FileText;
  } catch {
    return lucideIcons.FileText;
  }
}

// Convert API Service to display format
export function convertApiServiceToDisplay(apiService: any): Service {
  return {
    id: apiService._id || apiService.id,
    slug: apiService.slug,
    title: apiService.title,
    shortDescription: apiService.shortDescription,
    longDescription: apiService.longDescription,
    icon: getIconFromName(apiService.iconName),
    category: apiService.category,
    price: apiService.price || {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    duration: apiService.duration || 'N/A',
    features: apiService.features || [],
    benefits: apiService.benefits || [],
    requirements: apiService.requirements || [],
    process: apiService.process || [],
    faqs: apiService.faqs || [],
    relatedServices: apiService.relatedServices || [],
  };
}

// Convert API ServiceCategory to display format
export function convertApiCategoryToDisplay(apiCategory: any): ServiceCategory {
  return {
    id: apiCategory._id || apiCategory.id,
    slug: apiCategory.slug,
    title: apiCategory.title,
    description: apiCategory.description,
    icon: getIconFromName(apiCategory.iconName),
    heroTitle: apiCategory.heroTitle,
    heroDescription: apiCategory.heroDescription,
    services: (apiCategory.services || []).map(convertApiServiceToDisplay),
  };
}

