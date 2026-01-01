/**
 * Utility script to push all dummy service data to APIs
 * Run this once to migrate all dummy data to the database
 */

import { serviceService } from '@/app/lib/api';
import { gstCategory } from '@/app/data/services/gst';
import { incomeTaxCategory } from '@/app/data/services/income-tax';
import { registrationCategory } from '@/app/data/services/registration';
import { trademarksCategory } from '@/app/data/services/trademarks';
import { ipoCategories } from '@/app/data/services/ipo';
import { legalCategories } from '@/app/data/services/legal';
import { bankingFinanceCategories } from '@/app/data/services/banking-finance';
import { ServiceCategory, Service } from '@/app/types/services';
import { IPOCategory, IPOSubService } from '@/app/types/ipo';
import { LegalCategory, LegalSubService } from '@/app/types/legal';
import { BankingFinanceCategory, BankingFinanceSubService } from '@/app/types/banking-finance';
import toast from 'react-hot-toast';
import * as lucideIcons from 'lucide-react';

// Helper to convert icon component to iconName string
// Since Lucide React icons don't expose their name easily, we'll use a mapping approach
function getIconName(icon: any): string {
  if (!icon) return 'FileText';
  if (typeof icon === 'string') return icon;
  
  // Common Lucide icon names used in the codebase
  const iconNames = [
    'Receipt', 'FileText', 'RefreshCw', 'FileX', 'FileCheck', 'Edit', 'Shield', 'Zap',
    'Calculator', 'Building2', 'Award', 'Scale', 'TrendingUp', 'CreditCard', 'DollarSign',
    'FileSearch', 'Users', 'BarChart3', 'CheckCircle', 'Phone', 'Mail', 'Briefcase'
  ];
  
  // Try to match the icon component to a known icon name by reference
  for (const name of iconNames) {
    const lucideIcon = (lucideIcons as any)[name];
    if (lucideIcon === icon) {
      return name;
    }
  }
  
  // Fallback: try to extract from component properties
  let iconName = icon.displayName || icon.name || icon.type?.displayName || icon.type?.name || 'FileText';
  iconName = iconName.replace(/Icon$/, '').replace(/Component$/, '').replace(/^Icon$/, 'FileText');
  
  return iconName || 'FileText';
}

// Convert Service to CreateServiceDto
function convertServiceToDto(service: Service, categorySlug: string): any {
  return {
    slug: service.slug,
    title: service.title,
    shortDescription: service.shortDescription,
    longDescription: service.longDescription,
    iconName: getIconName(service.icon),
    category: categorySlug,
    price: service.price,
    duration: service.duration,
    features: service.features || [],
    benefits: service.benefits || [],
    requirements: service.requirements || [],
    process: service.process || [],
    faqs: service.faqs || [],
    // relatedServices must be MongoDB ObjectIds, but during initial migration we don't have them yet
    // So we set it to empty array - can be updated later after all services are created
    relatedServices: [],
  };
}

// Convert IPOSubService to CreateServiceDto
function convertIPOSubServiceToDto(
  subService: IPOSubService,
  categorySlug: string,
  subcategorySlug: string
): any {
  return {
    slug: subService.slug,
    title: subService.title,
    shortDescription: subService.shortDescription,
    longDescription: subService.longDescription,
    iconName: getIconName(subService.icon),
    category: categorySlug,
    subcategory: subcategorySlug,
    price: subService.price,
    duration: subService.duration,
    features: subService.features || [],
    benefits: subService.benefits || [],
    requirements: subService.requirements || [],
    process: subService.process || [],
    faqs: subService.faqs || [],
    relatedServices: [],
  };
}

// Convert LegalSubService to CreateServiceDto
function convertLegalSubServiceToDto(
  subService: LegalSubService,
  categorySlug: string,
  subcategorySlug: string
): any {
  return {
    slug: subService.slug,
    title: subService.title,
    shortDescription: subService.shortDescription,
    longDescription: subService.longDescription,
    iconName: getIconName(subService.icon),
    category: categorySlug,
    subcategory: subcategorySlug,
    price: subService.price,
    duration: subService.duration,
    features: subService.features || [],
    benefits: subService.benefits || [],
    requirements: subService.requirements || [],
    process: subService.process || [],
    faqs: subService.faqs || [],
    // relatedServices must be MongoDB ObjectIds, but during initial migration we don't have them yet
    // So we set it to empty array - can be updated later after all services are created
    relatedServices: [],
  };
}

// Convert BankingFinanceSubService to CreateServiceDto
function convertBankingFinanceSubServiceToDto(
  subService: BankingFinanceSubService,
  categorySlug: string,
  subcategorySlug: string
): any {
  return {
    slug: subService.slug,
    title: subService.title,
    shortDescription: subService.shortDescription,
    longDescription: subService.longDescription,
    iconName: getIconName(subService.icon),
    category: categorySlug,
    subcategory: subcategorySlug,
    price: subService.price,
    duration: subService.duration,
    features: subService.features || [],
    benefits: subService.benefits || [],
    requirements: subService.requirements || [],
    process: subService.process || [],
    faqs: subService.faqs || [],
    relatedServices: [],
  };
}

// Convert ServiceCategory to API format
function convertCategoryToDto(category: ServiceCategory): any {
  return {
    id: category.slug,
    slug: category.slug,
    title: category.title,
    description: category.description,
    iconName: getIconName(category.icon),
    heroTitle: category.heroTitle,
    heroDescription: category.heroDescription,
    categoryType: 'simple',
  };
}

// Convert IPOCategory to API format
function convertIPOCategoryToDto(category: IPOCategory): any {
  return {
    id: category.slug,
    slug: category.slug,
    title: category.title,
    description: category.description,
    iconName: getIconName(category.icon),
    heroTitle: category.heroTitle,
    heroDescription: category.heroDescription,
    categoryType: 'ipo',
  };
}

// Convert LegalCategory to API format
function convertLegalCategoryToDto(category: LegalCategory): any {
  return {
    id: category.slug,
    slug: category.slug,
    title: category.title,
    description: category.description,
    iconName: getIconName(category.icon),
    heroTitle: category.heroTitle,
    heroDescription: category.heroDescription,
    categoryType: 'legal',
  };
}

// Convert BankingFinanceCategory to API format
function convertBankingFinanceCategoryToDto(category: BankingFinanceCategory): any {
  return {
    id: category.slug,
    slug: category.slug,
    title: category.title,
    description: category.description,
    iconName: getIconName(category.icon),
    heroTitle: category.heroTitle,
    heroDescription: category.heroDescription,
    categoryType: 'banking-finance',
  };
}

/**
 * Push all dummy data to APIs
 */
export async function pushAllDummyDataToAPI(): Promise<{
  categoriesCreated: number;
  servicesCreated: number;
  errors: string[];
}> {
  const results = {
    categoriesCreated: 0,
    servicesCreated: 0,
    errors: [] as string[],
  };

  try {
    // Test API connection first
    console.log('Testing API connection...');
    try {
      await serviceService.getCategories();
      console.log('API connection successful!');
    } catch (error: any) {
      const errorMsg = `API connection failed: ${error.message}. Please check your API URL (currently: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'})`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
      throw new Error(errorMsg);
    }

    // 1. Push GST Category and Services
    console.log('Pushing GST data...');
    try {
      const gstDto = convertCategoryToDto(gstCategory);
      console.log('Creating GST category:', gstDto.title);
      try {
        await serviceService.createCategory(gstDto);
        results.categoriesCreated++;
        console.log(`✓ GST category created`);
      } catch (error: any) {
        // If category already exists, that's okay - continue with services
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`ℹ GST category already exists, skipping creation`);
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
      
      // Create services regardless of whether category was just created or already existed
      for (const service of gstCategory.services || []) {
        try {
          console.log(`  Creating service: ${service.title}`);
          await serviceService.create(convertServiceToDto(service, 'gst'));
          results.servicesCreated++;
        } catch (error: any) {
          // Skip if service already exists
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`  ℹ Service ${service.title} already exists, skipping`);
          } else {
            const errorMsg = `GST Service ${service.title}: ${error.message || error}`;
            console.error(`  ✗ ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }
      }
      console.log(`✓ GST: ${gstCategory.services?.length || 0} services processed`);
    } catch (error: any) {
      const errorMsg = `GST Category: ${error.message || error}`;
      console.error(`✗ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    // 2. Push Income Tax Category and Services
    console.log('Pushing Income Tax data...');
    try {
      try {
        await serviceService.createCategory(convertCategoryToDto(incomeTaxCategory));
        results.categoriesCreated++;
        console.log(`✓ Income Tax category created`);
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`ℹ Income Tax category already exists, skipping creation`);
        } else {
          throw error;
        }
      }
      
      for (const service of incomeTaxCategory.services || []) {
        try {
          await serviceService.create(convertServiceToDto(service, 'income-tax'));
          results.servicesCreated++;
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`  ℹ Service ${service.title} already exists, skipping`);
          } else {
            const errorMsg = `Income Tax Service ${service.title}: ${error.message || error}`;
            console.error(`  ✗ ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }
      }
      console.log(`✓ Income Tax: ${incomeTaxCategory.services?.length || 0} services processed`);
    } catch (error: any) {
      const errorMsg = `Income Tax Category: ${error.message || error}`;
      console.error(`✗ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    // 3. Push Registration Category and Services
    console.log('Pushing Registration data...');
    try {
      try {
        await serviceService.createCategory(convertCategoryToDto(registrationCategory));
        results.categoriesCreated++;
        console.log(`✓ Registration category created`);
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`ℹ Registration category already exists, skipping creation`);
        } else {
          throw error;
        }
      }
      
      for (const service of registrationCategory.services || []) {
        try {
          await serviceService.create(convertServiceToDto(service, 'registration'));
          results.servicesCreated++;
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`  ℹ Service ${service.title} already exists, skipping`);
          } else {
            const errorMsg = `Registration Service ${service.title}: ${error.message || error}`;
            console.error(`  ✗ ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }
      }
      console.log(`✓ Registration: ${registrationCategory.services?.length || 0} services processed`);
    } catch (error: any) {
      const errorMsg = `Registration Category: ${error.message || error}`;
      console.error(`✗ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    // 4. Push Trademarks Category and Services
    console.log('Pushing Trademarks data...');
    try {
      try {
        await serviceService.createCategory(convertCategoryToDto(trademarksCategory));
        results.categoriesCreated++;
        console.log(`✓ Trademarks category created`);
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`ℹ Trademarks category already exists, skipping creation`);
        } else {
          throw error;
        }
      }
      
      for (const service of trademarksCategory.services || []) {
        try {
          await serviceService.create(convertServiceToDto(service, 'trademarks'));
          results.servicesCreated++;
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`  ℹ Service ${service.title} already exists, skipping`);
          } else {
            const errorMsg = `Trademarks Service ${service.title}: ${error.message || error}`;
            console.error(`  ✗ ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }
      }
      console.log(`✓ Trademarks: ${trademarksCategory.services?.length || 0} services processed`);
    } catch (error: any) {
      const errorMsg = `Trademarks Category: ${error.message || error}`;
      console.error(`✗ ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    // 5. Push IPO Categories and SubServices
    console.log('Pushing IPO data...');
    for (const category of ipoCategories) {
      try {
        try {
          await serviceService.createCategory(convertIPOCategoryToDto(category));
          results.categoriesCreated++;
          console.log(`✓ IPO category created: ${category.title}`);
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`ℹ IPO category ${category.title} already exists, skipping creation`);
          } else {
            throw error;
          }
        }
        
        for (const subService of category.subServices || []) {
          try {
            await serviceService.create(
              convertIPOSubServiceToDto(subService, 'ipo', category.slug)
            );
            results.servicesCreated++;
          } catch (error: any) {
            if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
              console.log(`  ℹ Service ${subService.title} already exists, skipping`);
            } else {
              const errorMsg = `IPO Service ${subService.title}: ${error.message || error}`;
              console.error(`  ✗ ${errorMsg}`);
              results.errors.push(errorMsg);
            }
          }
        }
        console.log(`✓ IPO category ${category.title}: ${category.subServices?.length || 0} services processed`);
      } catch (error: any) {
        const errorMsg = `IPO Category ${category.title}: ${error.message || error}`;
        console.error(`✗ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    // 6. Push Legal Categories and SubServices
    console.log('Pushing Legal data...');
    for (const category of legalCategories) {
      try {
        try {
          await serviceService.createCategory(convertLegalCategoryToDto(category));
          results.categoriesCreated++;
          console.log(`✓ Legal category created: ${category.title}`);
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`ℹ Legal category ${category.title} already exists, skipping creation`);
          } else {
            throw error;
          }
        }
        
        for (const subService of category.subServices || []) {
          try {
            await serviceService.create(
              convertLegalSubServiceToDto(subService, 'legal', category.slug)
            );
            results.servicesCreated++;
          } catch (error: any) {
            if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
              console.log(`  ℹ Service ${subService.title} already exists, skipping`);
            } else {
              const errorMsg = `Legal Service ${subService.title}: ${error.message || error}`;
              console.error(`  ✗ ${errorMsg}`);
              results.errors.push(errorMsg);
            }
          }
        }
        console.log(`✓ Legal category ${category.title}: ${category.subServices?.length || 0} services processed`);
      } catch (error: any) {
        const errorMsg = `Legal Category ${category.title}: ${error.message || error}`;
        console.error(`✗ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    // 7. Push Banking & Finance Categories and SubServices
    console.log('Pushing Banking & Finance data...');
    for (const category of bankingFinanceCategories) {
      try {
        try {
          await serviceService.createCategory(convertBankingFinanceCategoryToDto(category));
          results.categoriesCreated++;
          console.log(`✓ Banking & Finance category created: ${category.title}`);
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`ℹ Banking & Finance category ${category.title} already exists, skipping creation`);
          } else {
            throw error;
          }
        }
        
        for (const subService of category.subServices || []) {
          try {
            await serviceService.create(
              convertBankingFinanceSubServiceToDto(subService, 'banking-finance', category.slug)
            );
            results.servicesCreated++;
          } catch (error: any) {
            if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
              console.log(`  ℹ Service ${subService.title} already exists, skipping`);
            } else {
              const errorMsg = `Banking & Finance Service ${subService.title}: ${error.message || error}`;
              console.error(`  ✗ ${errorMsg}`);
              results.errors.push(errorMsg);
            }
          }
        }
        console.log(`✓ Banking & Finance category ${category.title}: ${category.subServices?.length || 0} services processed`);
      } catch (error: any) {
        const errorMsg = `Banking & Finance Category ${category.title}: ${error.message || error}`;
        console.error(`✗ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    // Summary
    console.log('=== Migration Summary ===');
    console.log(`Categories created: ${results.categoriesCreated}`);
    console.log(`Services created: ${results.servicesCreated}`);
    console.log(`Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.error('Errors encountered:', results.errors);
      toast.error(`Migration completed with ${results.errors.length} errors. ${results.categoriesCreated} categories and ${results.servicesCreated} services created.`);
    } else {
      toast.success(
        `Successfully migrated ${results.categoriesCreated} categories and ${results.servicesCreated} services!`
      );
    }
    
    return results;
  } catch (error: any) {
    console.error('Migration failed:', error);
    const errorMsg = error.message || 'Unknown error occurred';
    toast.error(`Migration failed: ${errorMsg}`);
    results.errors.push(errorMsg);
    return results;
  }
}

