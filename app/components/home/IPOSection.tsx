'use client';

import { useState, useEffect, useRef } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import Link from 'next/link';
import { serviceService } from '@/app/lib/api';
import { API_CONFIG } from '@/app/lib/api/config';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { ArrowRight, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import { motion } from 'framer-motion';
import { ServiceCategory } from '@/app/types/services';

export default function IPOSection() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only create observer once on mount
    if (observerRef.current || hasFetchedRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasFetchedRef.current) {
          hasFetchedRef.current = true;
          setHasLoaded(true);
          fetchData();
        }
      },
      { threshold: 0.1 }
    );

    const currentSection = sectionRef.current;
    if (currentSection && observerRef.current) {
      observerRef.current.observe(currentSection);
    }

    return () => {
      if (observerRef.current && currentSection) {
        observerRef.current.unobserve(currentSection);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const fetchData = async () => {
    try {
      setLoading(true);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      const fetchPromise = (async () => {
        const result = await serviceService.getCategoryWithSubcategories('ipo');
        if (!result?.subcategories?.length) return [];
        const mapped = result.subcategories.map((sub) => ({
          id: sub._id,
          slug: sub.slug,
          title: sub.title,
          description: sub.shortDescription ?? '',
          icon: getIconFromName(sub.iconName),
          heroTitle: sub.title,
          heroDescription: sub.shortDescription ?? '',
          services: [],
          itemsCount: sub.itemsCount,
        }));
        console.log('[IPOSection] API response subcategories:', result.subcategories.map((s: any) => ({ slug: s.slug, title: s.title, itemsCount: s.itemsCount })));

        // Fill missing counts using per-subcategory endpoint
        const withCounts = await Promise.all(
          mapped.map(async (sub) => {
            if ((sub as { itemsCount?: number }).itemsCount !== 0) {
              return sub;
            }
            try {
              const response = await fetch(`${API_CONFIG.BASE_URL}/services/ipo/${sub.slug}`, {
                next: { revalidate: 60 },
              });
              if (!response.ok) return sub;
              const data = await response.json();
              const fallbackCount = typeof data?.subcategory?.itemsCount === 'number'
                ? data.subcategory.itemsCount
                : Array.isArray(data?.data)
                  ? data.data.length
                  : sub.itemsCount;

              return {
                ...sub,
                itemsCount: fallbackCount,
              };
            } catch {
              return sub;
            }
          })
        );

        return withCounts;
      })();

      const categories = await Promise.race([fetchPromise, timeoutPromise]) as (ServiceCategory & { itemsCount?: number })[];
      setCategories(categories);
    } catch (error) {
      // Silently fail - don't show section if API times out or fails
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('IPO services could not be loaded:', error);
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-accent/5 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!hasLoaded) {
    return <section ref={sectionRef} className="relative bg-gradient-to-br from-primary/5 via-white to-accent/5 py-16 md:py-24" />;
  }

  if (loading) {
    return (
      <section ref={sectionRef} className="relative bg-gradient-to-br from-primary/5 via-white to-accent/5 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-primary/5 via-white to-accent/5 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
            IPO Services
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            Take Your Company Public with Confidence
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Comprehensive Initial Public Offering services from advisory to listing, 
            guiding you through every step of your IPO journey.
          </p>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="ipo-swiper pb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <SwiperSlide key={category.id} className="h-auto">
                <Link href={`/services/ipo/${category.slug}`}>
                  <Card hoverable className="h-full flex flex-col group">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-heading font-semibold text-xl text-primary mb-2 group-hover:text-accent transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-grow text-sm">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="text-sm text-gray-500">
                        {(category as { itemsCount?: number }).itemsCount ?? category.services.length} Services
                      </span>
                      <motion.div
                        className="flex items-center text-accent font-medium text-sm"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        Explore
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </motion.div>
                    </div>
                  </Card>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="text-center mt-8">
          <Link
            href="/services/ipo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
          >
            View All IPO Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .ipo-swiper .swiper-pagination {
          position: static;
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          gap: 0.4rem;
        }
        .ipo-swiper .swiper-pagination-bullet {
          background: #00a3e0;
          opacity: 0.3;
        }
        .ipo-swiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}

