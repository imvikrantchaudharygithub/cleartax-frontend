'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Shield, Zap } from 'lucide-react';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo } from '@/app/lib/api/types';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  Shield,
  Zap,
};

// Default/fallback data
const defaultBenefits = {
  heading: 'Why Choose ClearTax?',
  subheading: 'All our products are designed to deliver exceptional value',
  items: [
    {
      title: 'Maximum Tax Savings',
      description: 'Businesses save up to 2-7% of their net GST with us every month. Individuals can save up to ₹86,500 by filing their tax returns through our platform.',
      image: '',
      imagePosition: 'right' as const,
      imageAlt: 'Tax Savings',
    },
    {
      title: 'Unparalleled Speed',
      description: 'Experience 3x faster GST filings, 5x faster invoice reconciliation, and 10x faster e-waybill generation. Individuals file their tax returns in under 3 minutes.',
      image: '',
      imagePosition: 'left' as const,
      imageAlt: 'Speed',
    },
    {
      title: 'Accurate Compliance',
      description: 'Our products are designed and tested by in-house tax experts, ensuring every new clause, form, or feature is updated and sent to you over the cloud.',
      image: '',
      imagePosition: 'right' as const,
      imageAlt: 'Compliance',
    },
  ],
};

export default function BenefitsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollTriggersRef = useRef<any[]>([]);
  const [benefitsData, setBenefitsData] = useState<HomeInfo['benefits']>(defaultBenefits);

  useEffect(() => {
    // Fetch home info from API
    const fetchHomeInfo = async () => {
      try {
        const data = await homeInfoService.get();
        if (data?.benefits) {
          setBenefitsData(data.benefits);
        }
      } catch (error) {
        console.error('Error fetching home info:', error);
        // Use default data on error
      }
    };

    fetchHomeInfo();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sectionRef.current) return;

    // Dynamically import GSAP only on client side
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([gsapModule, ScrollTriggerModule]) => {
      const gsap = gsapModule.gsap;
      const ScrollTrigger = ScrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const blocks = sectionRef.current!.querySelectorAll('.benefit-block');

      blocks.forEach((block, index) => {
        const textElement = block.querySelector('.benefit-text');
        const imageElement = block.querySelector('.benefit-image');

        if (!textElement || !imageElement) return;

        const isTextLeft = index % 2 === 0;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        })
        .fromTo(
          textElement,
          {
            x: isTextLeft ? -100 : 100,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
          }
        )
        .fromTo(
          imageElement,
          {
            x: isTextLeft ? 100 : -100,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.6'
        );

        // Store reference to the scroll trigger for cleanup
        const scrollTrigger = timeline.scrollTrigger;
        if (scrollTrigger) {
          scrollTriggersRef.current.push(scrollTrigger);
        }
      });
    });

    // Cleanup function
    return () => {
      // Kill all stored scroll triggers
      scrollTriggersRef.current.forEach(trigger => {
        if (trigger && typeof trigger.kill === 'function') {
          trigger.kill();
        }
      });
      scrollTriggersRef.current = [];
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
            {benefitsData.heading}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {benefitsData.subheading}
          </p>
        </div>

        <div className="space-y-24">
          {benefitsData.items.map((benefit, index) => {
            // Use first available icon from iconMap as fallback
            const Icon = iconMap[Object.keys(iconMap)[index % Object.keys(iconMap).length]] || TrendingUp;
            const isImageRight = benefit.imagePosition === 'right';

            return (
              <div
                key={index}
                className="benefit-block grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Text Content */}
                <div className={`benefit-text ${isImageRight ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-xl mb-6">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl md:text-3xl text-primary mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Image/Visual */}
                <div className={`benefit-image ${isImageRight ? 'lg:order-2' : 'lg:order-1'}`}>
                  {benefit.image ? (
                    <img
                      src={benefit.image}
                      alt={benefit.imageAlt || benefit.title}
                      className="w-full h-80 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-12 h-80 flex items-center justify-center">
                      <div className="text-center">
                        <Icon className="w-32 h-32 text-accent mx-auto mb-4" />
                        <p className="text-xl font-heading font-bold text-primary">
                          {benefit.title}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

