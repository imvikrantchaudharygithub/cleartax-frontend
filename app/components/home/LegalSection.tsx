'use client';

import { useState, useEffect, useRef } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import Link from 'next/link';
import { serviceService } from '@/app/lib/api';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { ArrowRight, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import { motion } from 'framer-motion';
import { ServiceCategory } from '@/app/types/services';

export default function LegalSection() {
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
        const result = await serviceService.getCategoryWithSubcategories('legal');
        if (!result?.subcategories?.length) return [];
        return result.subcategories.map((sub) => ({
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
      })();

      const categories = await Promise.race([fetchPromise, timeoutPromise]) as (ServiceCategory & { itemsCount?: number })[];
      setCategories(categories);
    } catch (error) {
      // Silently fail - don't show section if API times out or fails
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Legal services could not be loaded:', error);
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (!hasLoaded) {
    return <section ref={sectionRef} className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-white py-16 md:py-24" />;
  }

  if (loading) {
    return (
      <section ref={sectionRef} className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-white py-16 md:py-24">
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
    <section ref={sectionRef} className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
            Legal Services
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            Expert Legal Representation
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Comprehensive legal services across civil, criminal, corporate, and tax litigation matters.
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
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="legal-swiper pb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <SwiperSlide key={category.id} className="h-auto">
                <Link href={`/services/legal/${category.slug}`}>
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
            href="/services/legal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
          >
            View All Legal Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .legal-swiper .swiper-pagination {
          position: static;
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          gap: 0.4rem;
        }
        .legal-swiper .swiper-pagination-bullet {
          background: #00a3e0;
          opacity: 0.3;
        }
        .legal-swiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}

