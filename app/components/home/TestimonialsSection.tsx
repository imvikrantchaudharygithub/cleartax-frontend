'use client';

import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import Section from '../fv/Section';
import SectionHead from '../fv/SectionHead';
import { testimonialService } from '@/app/lib/api';
import { Testimonial } from '@/app/lib/api/types';
import 'swiper/css';
import 'swiper/css/pagination';

// Design 3 `S.testi()`: three quote cards side by side from lg; a one-card swiper below lg.
const SHOWN = 3;
const TRUNCATE_LENGTH = 130;
const AUTOPLAY = { delay: 3500, disableOnInteraction: true };

function TestimonialCard({ testimonial, className }: { testimonial: Testimonial; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const text = testimonial.testimonial || '';
  const isTruncated = text.length > TRUNCATE_LENGTH;
  const meta = [testimonial.personRole, testimonial.companyName].filter(Boolean).join(' · ');
  const logo = testimonial.companyLogo || testimonial.personAvatar;

  return (
    <figure className={clsx('fv-card flex flex-col p-[22px]', className)}>
      <div className="flex gap-0.5" aria-label={`${testimonial.rating || 5} out of 5 stars`}>
        {[...Array(testimonial.rating || 5)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[#F5A524] text-[#F5A524]" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="mb-[18px] mt-3.5 text-[14.5px] leading-[1.65] text-fv-slate">
        {expanded || !isTruncated ? text : text.slice(0, TRUNCATE_LENGTH) + '...'}
        {isTruncated && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="ml-1 cursor-pointer rounded font-semibold text-fv-blue-d hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d"
          >
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-[11px] border-t border-fv-line pt-3.5">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" loading="lazy" decoding="async" className="h-10 w-10 flex-none rounded-[10px] border border-fv-line bg-white object-contain p-[3px]" />
        ) : (
          <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-fv-blue-50 text-sm font-bold text-fv-blue-d">
            {testimonial.personName?.charAt(0) || '?'}
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm font-bold text-fv-navy">{testimonial.personName}</span>
          {meta && <span className="block text-xs leading-[1.6] text-fv-slate">{meta}</span>}
        </span>
      </figcaption>
    </figure>
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
  // Read after mount (not during render) so server and first client render match.
  const [reduceMotion, setReduceMotion] = useState(false);
  const swiperRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // The prop below covers swipers mounted after the preference is known; this stops (or resumes)
  // one that was already autoplaying when it was read.
  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay) return;
    if (reduceMotion) autoplay.stop();
    else if (!autoplay.running) autoplay.start();
  }, [reduceMotion]);

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

  const shown = testimonials.slice(0, SHOWN);

  return (
    <Section soft>
      <SectionHead align="center" title="What our clients say" subtitle="See what our users have to say about their experience" />

      {/* lg and up: static 3-column grid */}
      <div className="hidden items-start gap-[18px] lg:grid lg:grid-cols-3">
        {shown.map((testimonial, index) => (
          <TestimonialCard key={testimonial._id || index} testimonial={testimonial} />
        ))}
      </div>

      {/* Below lg: one card per view, swipeable */}
      <div className="lg:hidden">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          autoplay={reduceMotion ? false : AUTOPLAY}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          pagination={{ clickable: true }}
          loop={shown.length > 1}
          style={{ '--swiper-pagination-color': '#2587C4', '--swiper-pagination-bullet-inactive-color': '#D1D7E7', '--swiper-pagination-bullet-inactive-opacity': '1' } as React.CSSProperties}
          className="testimonials-swiper !pb-10"
        >
          {shown.map((testimonial, index) => (
            <SwiperSlide key={testimonial._id || index}>
              <TestimonialCard testimonial={testimonial} className="h-full" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Section>
  );
}
