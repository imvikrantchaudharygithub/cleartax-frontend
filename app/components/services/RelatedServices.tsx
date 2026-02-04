'use client';

import { Service } from '@/app/types/services';
import ServiceCard from './ServiceCard';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';

/** Serializable service (no icon component) for Server Component parents. */
export type SerializableService = Omit<Service, 'icon'> & { iconName: string };

interface RelatedServicesProps {
  services: (Service | SerializableService)[];
  currentServiceId: string;
  category: string;
}

export default function RelatedServices({
  services,
  currentServiceId,
  category,
}: RelatedServicesProps) {
  // Filter out current service and limit to 3
  const relatedServices = services
    .filter((service) => service.id !== currentServiceId)
    .slice(0, 3);

  if (relatedServices.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary mb-8 text-center">
        Related Services
      </h2>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedServices.map((service) => (
          <StaggerItem key={service.id}>
            <ServiceCard
              title={service.title}
              shortDescription={service.shortDescription}
              icon={'icon' in service ? service.icon : undefined}
              iconName={service.iconName}
              price={service.price}
              duration={service.duration}
              slug={service.slug}
              category={category}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}





