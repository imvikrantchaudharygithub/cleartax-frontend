import { Service } from '@/app/types/services';
import ServiceCard from './ServiceCard';

/** Serializable service (no icon component) for Server Component parents. */
export type SerializableService = Omit<Service, 'icon'> & { iconName: string };

interface RelatedServicesProps {
  services: (Service | SerializableService)[];
  currentServiceId: string;
  category: string;
  /** Set on 3-level pages so cards link to /services/<cat>/<sub>/<slug>. */
  subcategory?: string;
}

export default function RelatedServices({ services, currentServiceId, category, subcategory }: RelatedServicesProps) {
  const relatedServices = services.filter((service) => service.id !== currentServiceId).slice(0, 3);
  if (relatedServices.length === 0) return null;

  return (
    <section aria-labelledby="related-services-title">
      <h2 id="related-services-title" className="mb-6 text-2xl font-extrabold tracking-[-0.02em] text-fv-navy md:text-[30px]">
        Related Services
      </h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {relatedServices.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            shortDescription={service.shortDescription}
            icon={'icon' in service ? service.icon : undefined}
            iconName={service.iconName}
            price={service.price}
            duration={service.duration}
            slug={service.slug}
            category={category}
            subcategory={subcategory}
          />
        ))}
      </div>
    </section>
  );
}
