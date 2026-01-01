'use client';

import { useState, useEffect } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import Link from 'next/link';
import { serviceService } from '@/app/lib/api';
import { convertApiCategoryToDisplay, getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { ArrowRight, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import { motion } from 'framer-motion';
import { ServiceCategory } from '@/app/types/services';

export default function IPOSection() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allCategories = await serviceService.getCategories();
        const ipoCategories = allCategories.filter((cat: any) => cat.categoryType === 'ipo');
        
        const categoriesWithServices = await Promise.all(
          ipoCategories.map(async (cat: any) => {
            const services = await serviceService.getByCategory(cat.slug);
            return convertApiCategoryToDisplay({
              ...cat,
              services: services,
            });
          })
        );
        
        setCategories(categoriesWithServices);
      } catch (error) {
        console.error('Error fetching IPO services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-white to-accent/5 py-16 md:py-24">
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
                        {category.services.length} Services
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

