import AllServicesClient from '@/app/components/services/AllServicesClient';
import { API_CONFIG } from '@/app/lib/api/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services — GST, Income Tax, Registration & Compliance',
  description:
    'Explore FinVidhi services: GST registration & filing, income tax, business registration, trademarks & IP, and legal compliance for Indian businesses.',
  alternates: { canonical: '/services' },
};

// Serializable service type for passing from server to client
interface SerializableService {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string; // Keep as string, not component
  category: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  relatedServices: string[];
  subcategorySlug?: string; // For complex categories
}

interface ServiceGroup {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  services: SerializableService[];
}

const categoryConfig = [
  { id: 'gst', title: 'GST Services', description: 'Complete GST compliance and filing solutions', iconName: 'Receipt', href: '/services/gst', categoryType: 'simple' },
  { id: 'income-tax', title: 'Income Tax', description: 'Expert tax filing and planning services', iconName: 'Calculator', href: '/services/income-tax', categoryType: 'simple' },
  { id: 'registration', title: 'Business Registration', description: 'Start your business with proper registration', iconName: 'Building2', href: '/services/registration', categoryType: 'simple' },
  { id: 'trademarks', title: 'Trademarks & IP', description: 'Protect your brand and intellectual property', iconName: 'Award', href: '/services/trademarks', categoryType: 'simple' },
  { id: 'legal', title: 'Legal Services', description: 'Comprehensive legal solutions for your business', iconName: 'Scale', href: '/services/legal', categoryType: 'legal' },
  { id: 'ipo', title: 'IPO Services', description: 'Take your company public with confidence', iconName: 'TrendingUp', href: '/services/ipo', categoryType: 'ipo' },
  { id: 'banking-finance', title: 'Banking & Finance', description: 'Secure financing for your business growth', iconName: 'CreditCard', href: '/services/banking-finance', categoryType: 'banking-finance' },
  // Appended (not inserted) so the chips above keep their colorAt(i) colours.
  { id: 'mca', title: 'Company Law (MCA)', description: 'Annual ROC filings, directors and company changes', iconName: 'Landmark', href: '/services/mca', categoryType: 'simple' },
  { id: 'accounting-hr', title: 'Accounting & HR', description: 'Bookkeeping, payroll and HR compliance', iconName: 'ClipboardList', href: '/services/accounting-hr', categoryType: 'simple' },
  { id: 'fssai', title: 'FSSAI & Food', description: 'Food licences, registration and compliance', iconName: 'UtensilsCrossed', href: '/services/fssai', categoryType: 'simple' },
  { id: 'ngo', title: 'NGO & Trust', description: 'Registration and compliance for NGOs and trusts', iconName: 'HeartHandshake', href: '/services/ngo', categoryType: 'simple' },
];

// Category slug mapping for simple categories
// Maps API category slugs to config ids
const categorySlugMap: Record<string, string> = {
  'gst-services': 'gst',
  'income-tax-services': 'income-tax',
  'business-registration': 'registration',
  'trademark-ip-services': 'trademarks',
  'mca-company-law-compliance': 'mca',
  'accounting-hr-services': 'accounting-hr',
  'fssai-registration-compliance': 'fssai',
  'ngo-trust-services': 'ngo',
};

/**
 * Get category slug from service
 * For simple categories: extracts base category from categoryInfo.slug
 * For complex categories: returns null (we use categoryType instead)
 */
function getCategorySlug(service: any): string | null {
  if (service.categoryInfo?.categoryType === 'simple') {
    // For simple categories, map categoryInfo.slug to config id
    const apiSlug = service.categoryInfo.slug;
    if (apiSlug && categorySlugMap[apiSlug]) {
      return categorySlugMap[apiSlug];
    }
    // Fallback: try to extract base category from slug (e.g., "gst-services" -> "gst")
    if (apiSlug) {
      return apiSlug.split('-')[0];
    }
  }
  // For complex categories, return null (we use categoryType instead)
  return null;
}

/**
 * Get category type from service
 */
function getCategoryType(service: any): string | null {
  if (service.categoryInfo?.categoryType) {
    return service.categoryInfo.categoryType;
  }
  return null;
}

/**
 * Check if service belongs to a category config
 */
function serviceBelongsToCategory(service: any, config: typeof categoryConfig[0]): boolean {
  if (config.categoryType === 'simple') {
    // For simple categories, match by mapped category slug
    const categorySlug = getCategorySlug(service);
    return categorySlug === config.id;
  } else {
    // For complex categories, match by categoryType
    return service.categoryInfo?.categoryType === config.categoryType;
  }
}

export default async function AllServicesPage() {
  let allServices: any[] = [];
  let allCategories: any[] = [];

  try {
    // Fetch all services from API
    const servicesUrl = `${API_CONFIG.BASE_URL}/services`;
    const servicesResponse = await fetch(servicesUrl, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      if (servicesData.success && Array.isArray(servicesData.data)) {
        allServices = servicesData.data;
      }
    } else {
      console.error(`Failed to fetch services: ${servicesResponse.status} ${servicesResponse.statusText}`);
    }

    // Fetch categories to help with subcategory mapping for complex categories
    const categoriesUrl = `${API_CONFIG.BASE_URL}/services/categories`;
    const categoriesResponse = await fetch(categoriesUrl, {
      next: { revalidate: 60 },
    });

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success && Array.isArray(categoriesData.data)) {
        allCategories = categoriesData.data;
      } else if (Array.isArray(categoriesData)) {
        // Handle case where API returns array directly
        allCategories = categoriesData;
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Continue with empty arrays if fetch fails
  }

  // Create a map of category IDs to category slugs for complex categories
  const categoryIdToSlugMap = new Map<string, string>();
  allCategories.forEach((cat: any) => {
    if (cat._id && cat.slug) {
      categoryIdToSlugMap.set(cat._id, cat.slug);
    }
  });

  // Group services by category
  const serviceGroups: ServiceGroup[] = categoryConfig.map((config) => {
    // Find services that belong to this category
    const categoryServices = (allServices || []).filter(service => 
      serviceBelongsToCategory(service, config)
    );

    // Convert services to serializable format (keep iconName as string, don't convert to component)
    const displayServices: SerializableService[] = (categoryServices || []).map(service => {
      const serializableService: SerializableService = {
        id: service._id || service.id,
        slug: service.slug,
        title: service.title,
        shortDescription: service.shortDescription,
        longDescription: service.longDescription,
        iconName: service.iconName, // Keep as string
        category: typeof service.category === 'string' ? service.category : (service.category?._id || service.category),
        price: service.price,
        duration: service.duration,
        features: service.features || [],
        benefits: service.benefits || [],
        requirements: service.requirements || [],
        process: (service.process || []).map((p: any) => ({
          step: p.step || 0,
          title: p.title || '',
          description: p.description || '',
          duration: p.duration || '',
        })),
        faqs: (service.faqs || []).map((faq: any) => ({
          id: faq.id || faq._id || '',
          question: faq.question || '',
          answer: faq.answer || '',
        })),
        relatedServices: service.relatedServices || [],
      };
      
      // For complex categories, extract subcategory slug from categoryInfo.slug
      if (config.categoryType !== 'simple' && service.categoryInfo?.slug) {
        // The categoryInfo.slug contains the subcategory slug for complex categories
        serializableService.subcategorySlug = service.categoryInfo.slug;
      }
      
      return serializableService;
    });

    return {
      id: config.id,
      title: config.title,
      description: config.description,
      iconName: config.iconName, // Pass icon name as string
      href: config.href,
      services: displayServices || [], // Ensure services is always an array
    };
  });

  return <AllServicesClient serviceGroups={serviceGroups} />;
}
