'use client';

import { ServiceCategory } from '@/app/types/services';
import ServiceCard from './ServiceCard';
import { Service } from '@/app/types/services';

interface ServiceCategorySectionProps {
  category: ServiceCategory;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  categoryType?: 'ipo' | 'legal' | 'banking-finance' | 'simple';
}

export default function ServiceCategorySection({
  category,
  onEdit,
  onDelete,
  categoryType,
}: ServiceCategorySectionProps) {
  const Icon = category.icon;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{category.title}</h2>
          <p className="text-sm text-gray-400">{category.description}</p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
            {category.services.length} services
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

