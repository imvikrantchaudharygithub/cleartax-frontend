import AllServicesClient from '@/app/components/services/AllServicesClient';
import { API_CONFIG } from '@/app/lib/api/config';

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
  color: string;
  gradient: string;
}

const categoryConfig = [
  { id: 'gst', title: 'GST Services', description: 'Complete GST compliance and filing solutions', iconName: 'Receipt', href: '/services/gst', color: 'from-blue-500 to-cyan-500', gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50', categoryType: 'simple' },
  { id: 'income-tax', title: 'Income Tax', description: 'Expert tax filing and planning services', iconName: 'Calculator', href: '/services/income-tax', color: 'from-green-500 to-emerald-500', gradient: 'bg-gradient-to-br from-green-50 to-emerald-50', categoryType: 'simple' },
  { id: 'registration', title: 'Business Registration', description: 'Start your business with proper registration', iconName: 'Building2', href: '/services/registration', color: 'from-purple-500 to-pink-500', gradient: 'bg-gradient-to-br from-purple-50 to-pink-50', categoryType: 'simple' },
  { id: 'trademarks', title: 'Trademarks & IP', description: 'Protect your brand and intellectual property', iconName: 'Award', href: '/services/trademarks', color: 'from-orange-500 to-amber-500', gradient: 'bg-gradient-to-br from-orange-50 to-amber-50', categoryType: 'simple' },
  { id: 'legal', title: 'Legal Services', description: 'Comprehensive legal solutions for your business', iconName: 'Scale', href: '/services/legal', color: 'from-indigo-500 to-violet-500', gradient: 'bg-gradient-to-br from-indigo-50 to-violet-50', categoryType: 'legal' },
  { id: 'ipo', title: 'IPO Services', description: 'Take your company public with confidence', iconName: 'TrendingUp', href: '/services/ipo', color: 'from-teal-500 to-cyan-500', gradient: 'bg-gradient-to-br from-teal-50 to-cyan-50', categoryType: 'ipo' },
  { id: 'banking-finance', title: 'Banking & Finance', description: 'Secure financing for your business growth', iconName: 'CreditCard', href: '/services/banking-finance', color: 'from-rose-500 to-pink-500', gradient: 'bg-gradient-to-br from-rose-50 to-pink-50', categoryType: 'banking-finance' },
];

// Category slug mapping for simple categories
// Maps API category slugs to config ids
const categorySlugMap: Record<string, string> = {
  'gst-services': 'gst',
  'income-tax-services': 'income-tax',
  'business-registration': 'registration',
  'trademark-ip-services': 'trademarks',
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
      color: config.color,
      gradient: config.gradient,
    };
  });

  return <AllServicesClient serviceGroups={serviceGroups} />;
}
