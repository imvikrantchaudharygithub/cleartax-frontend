'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { gstCategory } from '@/app/data/services/gst';
import { incomeTaxCategory } from '@/app/data/services/income-tax';
import { registrationCategory } from '@/app/data/services/registration';
import { trademarksCategory } from '@/app/data/services/trademarks';
import { ipoCategories } from '@/app/data/services/ipo';
import { legalCategories } from '@/app/data/services/legal';
import ServiceCategorySection from '@/app/components/admin/ServiceCategorySection';
import AddServiceModal from '@/app/components/admin/AddServiceModal';
import { Service, ServiceCategory } from '@/app/types/services';
import { IPOCategory } from '@/app/types/ipo';
import { LegalCategory } from '@/app/types/legal';
import { getServices } from '@/app/lib/admin/serviceStorage';

// Convert IPO and Legal categories to ServiceCategory format for display
function convertIPOCategoryToServiceCategory(ipoCategory: IPOCategory): ServiceCategory[] {
  // IPO has subServices, we'll create a service category for each IPO category
  return [{
    id: ipoCategory.id,
    slug: ipoCategory.slug,
    title: ipoCategory.title,
    description: ipoCategory.description,
    icon: ipoCategory.icon,
    heroTitle: ipoCategory.heroTitle,
    heroDescription: ipoCategory.heroDescription,
    services: ipoCategory.subServices.map(sub => ({
      id: sub.id,
      slug: sub.slug,
      title: sub.title,
      shortDescription: sub.shortDescription,
      longDescription: sub.longDescription,
      icon: sub.icon,
      category: 'IPO',
      price: sub.price,
      duration: sub.duration,
      features: sub.features,
      benefits: sub.benefits || [],
      requirements: sub.requirements || [],
      process: sub.process || [],
      faqs: sub.faqs || [],
      relatedServices: [],
    })),
  }];
}

function convertLegalCategoryToServiceCategory(legalCategory: LegalCategory): ServiceCategory[] {
  return [{
    id: legalCategory.id,
    slug: legalCategory.slug,
    title: legalCategory.title,
    description: legalCategory.description,
    icon: legalCategory.icon,
    heroTitle: legalCategory.heroTitle,
    heroDescription: legalCategory.heroDescription,
    services: legalCategory.subServices.map(sub => ({
      id: sub.id,
      slug: sub.slug,
      title: sub.title,
      shortDescription: sub.shortDescription,
      longDescription: sub.longDescription,
      icon: sub.icon,
      category: 'Legal',
      price: sub.price,
      duration: sub.duration,
      features: sub.features,
      benefits: sub.benefits || [],
      requirements: sub.requirements || [],
      process: sub.process || [],
      faqs: sub.faqs || [],
      relatedServices: sub.relatedServices || [],
    })),
  }];
}

export default function AdminServicesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Get services from localStorage
  const storedServices = getServices();

  // Combine all categories
  let allCategories: ServiceCategory[] = [
    gstCategory,
    incomeTaxCategory,
    registrationCategory,
    trademarksCategory,
    ...ipoCategories.flatMap(convertIPOCategoryToServiceCategory),
    ...legalCategories.flatMap(convertLegalCategoryToServiceCategory),
  ];

  // Add stored services to their respective categories
  if (storedServices.length > 0) {
    const categoryMap = new Map<string, Service[]>();
    
    // Group stored services by category
    storedServices.forEach((service) => {
      const category = service.category.toLowerCase();
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(service);
    });

    // Add stored services to existing categories or create new ones
    categoryMap.forEach((services, categoryKey) => {
      const existingCategory = allCategories.find(
        (cat) => cat.id.toLowerCase() === categoryKey || cat.slug.toLowerCase() === categoryKey
      );
      
      if (existingCategory) {
        // Merge with existing services (avoid duplicates)
        services.forEach((service) => {
          if (!existingCategory.services.find((s) => s.id === service.id)) {
            existingCategory.services.push(service);
          }
        });
      } else {
        // Create new category for stored services
        if (services.length > 0) {
          const firstService = services[0];
          allCategories.push({
            id: categoryKey,
            slug: categoryKey,
            title: `${firstService.category} Services`,
            description: `Custom ${firstService.category} services`,
            icon: firstService.icon,
            heroTitle: `${firstService.category} Services`,
            heroDescription: `Custom services in ${firstService.category} category`,
            services,
          });
        }
      }
    });
  }

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsAddModalOpen(true);
  };

  const handleDelete = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      // TODO: Implement delete functionality
      console.log('Delete service:', serviceId);
    }
  };

  const handleAddNew = () => {
    setEditingService(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
          <p className="text-gray-400">Select a category from the sidebar to manage services</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">
            Please select a service category from the sidebar menu to view and manage services.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {[
              { label: 'GST Services', href: '/admin/services/gst' },
              { label: 'Income Tax', href: '/admin/services/income-tax' },
              { label: 'Registration', href: '/admin/services/registration' },
              { label: 'Trademarks', href: '/admin/services/trademarks' },
              { label: 'IPO Services', href: '/admin/services/ipo' },
              { label: 'Legal Services', href: '/admin/services/legal' },
            ].map((cat) => (
              <a
                key={cat.href}
                href={cat.href}
                className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-primary transition-colors text-gray-300 hover:text-white"
              >
                {cat.label}
              </a>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
}

