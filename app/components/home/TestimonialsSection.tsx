'use client';

import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Quote, Star } from 'lucide-react';
import { testimonialService } from '@/app/lib/api';
import { Testimonial } from '@/app/lib/api/types';
import 'swiper/css';
import 'swiper/css/pagination';

// Brand-only color schemes: white→light-blue glass card, avatars
// alternate between the two brand gradients.
const colorSchemes = [
  { bgColor: 'bg-gradient-to-br from-white to-light-blue/50', avatarColor: 'from-accent to-primary', quoteColor: 'text-accent/25' },
  { bgColor: 'bg-gradient-to-br from-white to-[#EDF5F1]', avatarColor: 'from-teal to-success', quoteColor: 'text-teal/25' },
];

const TRUNCATE_LENGTH = 130;

function TestimonialCard({
  testimonial,
  colorScheme,
}: {
  testimonial: Testimonial;
  colorScheme: typeof colorSchemes[number];
}) {
  const [expanded, setExpanded] = useState(false);
  const text = testimonial.testimonial || '';
  const isTruncated = text.length > TRUNCATE_LENGTH;
  const meta = [testimonial.personRole, testimonial.companyName].filter(Boolean).join(', ');

  return (
    <div
      className={`group h-full flex flex-col ${colorScheme.bgColor} border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200`}
    >
      {/* Quote mark + rating */}
      <div className="flex items-start justify-between mb-3">
        <Quote className={`w-6 h-6 ${colorScheme.quoteColor} fill-current shrink-0`} strokeWidth={0} />
        <div className="flex items-center gap-0.5" aria-label={`${testimonial.rating || 5} out of 5 stars`}>
          {[...Array(testimonial.rating || 5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />
          ))}
        </div>
      </div>

      {/* Testimonial text */}
      <p className="text-gray-700 text-[15px] leading-relaxed mb-4 flex-1">
        {expanded || !isTruncated ? text : text.slice(0, TRUNCATE_LENGTH) + '...'}
        {isTruncated && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="text-accent font-semibold ml-1 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded"
          >
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </p>

      {/* Author footer */}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-3 mt-auto">
        {testimonial.personAvatar ? (
          <img
            src={testimonial.personAvatar}
            alt={testimonial.personName}
            loading="lazy"
            decoding="async"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorScheme.avatarColor} flex items-center justify-center shrink-0`}>
            <span className="text-white font-bold text-sm">
              {testimonial.personName?.charAt(0) || '?'}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p className="font-heading font-semibold text-sm text-gray-900 truncate" title={testimonial.personName}>
            {testimonial.personName}
          </p>
          {meta && (
            <p className="text-xs text-gray-500 truncate" title={meta}>
              {meta}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface TestimonialsSectionProps {
  serverData?: Testimonial[];
}

export default function TestimonialsSection({ serverData }: TestimonialsSectionProps) {
  const hasServerData = Array.isArray(serverData) && serverData.length > 0;

  const [testimonials, setTestimonials] = useState<Testimonial[]>(hasServerData ? serverData : []);
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasFetchedRef = useRef(!!hasServerData);

  useEffect(() => {
    if (hasServerData) return;
    if (typeof window === 'undefined' || !sectionRef.current) return;

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
  }, [hasServerData]);

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

  if (!hasFetchedRef.current) {
    return <section ref={sectionRef} className="py-16 md:py-20" />;
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative bg-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-3">Trusted by Thousands</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-3">
            What our clients say
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            See what our users have to say about their experience
          </p>
        </div>

        {/* Desktop / tablet: static grid, 4 cards on desktop */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((testimonial, index) => {
            const colorScheme = colorSchemes[index % colorSchemes.length];
            return (
              <TestimonialCard
                key={testimonial._id || index}
                testimonial={testimonial}
                colorScheme={colorScheme}
              />
            );
          })}
        </div>

        {/* Mobile: one card per view, swipeable */}
        <div className="md:hidden">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            autoplay={{
              delay: 3500,
              disableOnInteraction: true,
            }}
            pagination={{ clickable: true }}
            loop={testimonials.length > 1}
            style={{ '--swiper-pagination-color': '#2587C4', '--swiper-pagination-bullet-inactive-color': '#D1D7E7', '--swiper-pagination-bullet-inactive-opacity': '1' } as React.CSSProperties}
            className="testimonials-swiper !pb-10"
          >
            {testimonials.map((testimonial, index) => {
              const colorScheme = colorSchemes[index % colorSchemes.length];
              return (
                <SwiperSlide key={testimonial._id || index}>
                  <TestimonialCard
                    testimonial={testimonial}
                    colorScheme={colorScheme}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
