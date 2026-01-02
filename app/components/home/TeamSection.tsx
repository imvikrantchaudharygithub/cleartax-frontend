'use client';

import { useState, useEffect, useRef } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';

import { teamService } from '@/app/lib/api';
import { TeamMember } from '@/app/lib/api/types';
import TeamCard from '../team/TeamCard';
import { Loader2 } from 'lucide-react';

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
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
          fetchTeam();
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

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      const fetchPromise = teamService.getAll();
      const members = await Promise.race([fetchPromise, timeoutPromise]) as TeamMember[];
      setTeamMembers(members);
    } catch (error) {
      // Silently fail - don't show section if API times out or fails
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Team members could not be loaded:', error);
      }
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  if (!hasLoaded) {
    return <section ref={sectionRef} className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-16 md:py-24" />;
  }

  if (loading) {
    return (
      <section ref={sectionRef} className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-16 md:py-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
            Our Team
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            Meet the people behind the mission
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            A cross-functional crew of builders, designers, and domain experts
            focused on simplifying taxes and compliance for everyone.
          </p>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="team-swiper pb-12"
        >
          {teamMembers.map((member) => (
            <SwiperSlide key={member._id} className="h-auto">
              <TeamCard member={member} className="h-full" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .team-swiper .swiper-pagination {
          position: static;
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          gap: 0.4rem;
        }
        .team-swiper .swiper-pagination-bullet {
          background: #00a3e0;
          opacity: 0.3;
        }
        .team-swiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}

