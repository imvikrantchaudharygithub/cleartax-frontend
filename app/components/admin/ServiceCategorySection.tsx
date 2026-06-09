'use client';

import { ServiceCategory } from '@/app/types/services';
import ServiceCard from './ServiceCard';
import { Service } from '@/app/types/services';
import { PencilLine } from 'lucide-react';

interface ServiceCategorySectionProps {
  category: ServiceCategory;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onEditCategory?: (category: ServiceCategory) => void;
  onPublish?: (service: Service) => void;
  onUnpublish?: (service: Service) => void;
  categoryType?: 'ipo' | 'legal' | 'banking-finance' | 'simple';
}

export default function ServiceCategorySection({
  category,
  onEdit,
  onDelete,
  onEditCategory,
  onPublish,
  onUnpublish,
  categoryType,
}: ServiceCategorySectionProps) {
  const Icon = category.icon;

  const services = category.services || [];
  const draftCount = services.filter((s) => s.status === 'draft').length;
  const liveCount = services.length - draftCount;
  const countLabel = draftCount > 0 ? `${liveCount} live · ${draftCount} draft` : `${services.length} services`;

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
          <div className="flex items-center gap-2">
            {onEditCategory && (
              <button
                type="button"
                onClick={() => onEditCategory(category)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 shadow-sm transition-colors"
              >
                <PencilLine className="w-4 h-4" />
                Edit
              </button>
            )}
            <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
              {countLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={onEdit}
            onDelete={onDelete}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
          />
        ))}
      </div>
    </div>
  );
}
