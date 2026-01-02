'use client';

import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Star, Loader2 } from 'lucide-react';
import { testimonialService } from '@/app/lib/api';
import { Testimonial } from '@/app/lib/api/types';
import 'swiper/css';

// Color schemes for testimonials
const colorSchemes = [
  { bgColor: 'bg-orange-100', avatarColor: 'from-orange-300 to-pink-300' },
  { bgColor: 'bg-blue-100', avatarColor: 'from-blue-300 to-purple-300' },
  { bgColor: 'bg-green-100', avatarColor: 'from-green-300 to-teal-300' },
  { bgColor: 'bg-purple-100', avatarColor: 'from-purple-300 to-indigo-300' },
  { bgColor: 'bg-pink-100', avatarColor: 'from-pink-300 to-rose-300' },
  { bgColor: 'bg-teal-100', avatarColor: 'from-teal-300 to-cyan-300' },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return;

    // Create observer once
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchTestimonials();
          }
        },
        { threshold: 0.1 }
      );
    }

    observerRef.current.observe(sectionRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      const fetchPromise = (async () => {
        // Try to get featured testimonials first, fallback to all if none featured
        const featured = await testimonialService.getFeatured();
        if (featured && featured.length > 0) {
          return featured;
        }
        // If no featured testimonials, get all and limit to first 6
        const all = await testimonialService.getAll();
        return all.slice(0, 6);
      })();

      const result = await Promise.race([fetchPromise, timeoutPromise]) as Testimonial[];
      setTestimonials(result);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error fetching testimonials:', error);
      }
      setTestimonials([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Don't render until fetched
  if (!hasFetchedRef.current) {
    return <section ref={sectionRef} className="py-20 md:py-24" />;
  }

  if (loading) {
    return (
      <section ref={sectionRef} className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50 py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't render section if no testimonials
  }

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50 py-20 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-3">
            Trusted by Thousands
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            See what our users have to say about their experience
          </p>
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          loop={testimonials.length > 1}
          className="testimonials-swiper"
        >
          {testimonials.map((testimonial, index) => {
            const colorScheme = colorSchemes[index % colorSchemes.length];
            return (
              <SwiperSlide key={testimonial._id || index}>
                <div 
                  className={`testimonial-card-content ${colorScheme.bgColor} rounded-[2rem] p-8 md:p-10`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    {testimonial.companyLogo ? (
                      <img
                        src={testimonial.companyLogo}
                        alt={testimonial.companyName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorScheme.avatarColor} flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">
                          {testimonial.companyName?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <span className="font-heading font-bold text-xl text-primary">
                      {testimonial.companyName}
                    </span>
                  </div>

                  <p className="text-gray-800 text-lg md:text-xl leading-relaxed mb-8">
                    {testimonial.testimonial}
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-4 border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-3">
                      {testimonial.personAvatar ? (
                        <img
                          src={testimonial.personAvatar}
                          alt={testimonial.personName}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorScheme.avatarColor} flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">
                            {testimonial.personName?.charAt(0) || '👤'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-heading font-bold text-base text-gray-900">
                          {testimonial.personName}
                        </p>
                        <p className="text-sm text-gray-600">{testimonial.personRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-orange-400 fill-orange-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
