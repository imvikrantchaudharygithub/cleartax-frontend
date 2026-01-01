'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const testimonials = [
  {
    name: 'Vermillion D. White',
    title: 'CEO, planetX.ai',
    company: 'planetX',
    rating: 5,
    quote: 'I have waited my entire life for a design tool like this - nearly my entire life. With SlothUI, less is truly more. Period.',
    bgColor: 'bg-orange-100',
    avatarColor: 'from-orange-300 to-pink-300',
  },
  {
    name: 'Priya Sharma',
    title: 'CFO, TechCorp',
    company: 'TechCorp',
    rating: 5,
    quote: 'ClearTax has simplified our GST filing process completely. What used to take days now takes just hours. The reconciliation feature is a game-changer!',
    bgColor: 'bg-blue-100',
    avatarColor: 'from-blue-300 to-purple-300',
  },
  {
    name: 'Rahul Verma',
    title: 'Tax Consultant',
    company: 'VermaAssociates',
    rating: 5,
    quote: 'I use ClearTax for all my clients. The accuracy of calculations and the detailed reports help me provide better service. Highly recommended!',
    bgColor: 'bg-green-100',
    avatarColor: 'from-green-300 to-teal-300',
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    // Wait for DOM to be ready and layout to be calculated
    const initAnimations = () => {
      const cards = sectionRef.current?.querySelectorAll<HTMLElement>('.testimonial-card');
      
      if (!cards || cards.length === 0) return;

      // Check if mobile device
      const isMobile = window.innerWidth < 768;
      
      // Refresh ScrollTrigger to recalculate positions
      ScrollTrigger.refresh();

      // Kill all existing ScrollTriggers for this section
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger && sectionRef.current?.contains(trigger.vars.trigger as Node)) {
          trigger.kill();
        }
      });

      // Set initial state for all cards
      cards.forEach((card, index) => {
        if (isMobile) {
          // Mobile: Cards start hidden for scroll animation
          gsap.set(card, {
            opacity: 0,
            y: 40,
            scale: 0.95,
            zIndex: 1,
          });
        } else {
          // Desktop: Set z-index for proper stacking
          gsap.set(card, {
            zIndex: testimonials.length - index,
          });

          if (index === 0) {
            // First card starts visible
            gsap.set(card, {
              opacity: 1,
              scale: 1,
              y: 0,
            });
          } else {
            // Other cards start hidden
            gsap.set(card, {
              opacity: 0,
              scale: 0.9,
              y: 30,
            });
          }
        }
      });

      // On mobile, use simple scroll-triggered fade-in animations (no pinning)
      if (isMobile) {
        cards.forEach((card, index) => {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
            onEnter: () => {
              gsap.to(card, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: 'power3.out',
                delay: index * 0.15,
              });
            },
          });
        });
        return; // Exit early for mobile - simple animations only, no pinning
      }

      // Desktop: Set absolute positioning for sticky effect
      if (!isMobile) {
        cards.forEach((card, index) => {
          if (index < cards.length - 1) {
            gsap.set(card, {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              width: '100%',
            });
          }
        });
      }

      // Desktop: Create sticky scroll animation
      if (!isMobile) {
        cards.forEach((card, index) => {
          // Skip the last card - it will just scroll normally
          if (index === cards.length - 1) {
            return;
          }

          const nextCard = cards[index + 1];
          if (!nextCard) return;

          // Pin duration for desktop
          const pinDuration = 200;

          // Create ScrollTrigger for sticky effect
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            end: `+=${pinDuration}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              
              // Current card fades out and moves up slightly
              gsap.set(card, {
                opacity: Math.max(0, 1 - progress),
                scale: Math.max(0.9, 1 - (progress * 0.1)),
                y: -(progress * 15),
              });

              // Next card fades in and moves up
              gsap.set(nextCard, {
                opacity: Math.min(1, progress),
                scale: Math.min(1, 0.95 + (progress * 0.05)),
                y: Math.max(0, 20 - (progress * 20)),
              });
            },
            onLeave: () => {
              // Ensure final states
              gsap.set(card, { 
                opacity: 0, 
                scale: 0.9, 
                y: -15 
              });
              gsap.set(nextCard, { 
                opacity: 1, 
                scale: 1, 
                y: 0 
              });
            },
            onEnterBack: () => {
              // Reset states when scrolling back
              gsap.set(card, { 
                opacity: 1, 
                scale: 1, 
                y: 0 
              });
              gsap.set(nextCard, { 
                opacity: 0, 
                scale: 0.95, 
                y: 20 
              });
            },
          });
        });
      }

      // Add hover effect animations
      cards.forEach((card) => {
        const cardContent = card.querySelector<HTMLElement>('.testimonial-card-content');
        if (cardContent) {
          let hoverTween: gsap.core.Tween | null = null;

          card.addEventListener('mouseenter', () => {
            if (hoverTween) hoverTween.kill();
            hoverTween = gsap.to(cardContent, {
              scale: 1.02,
              y: -5,
              duration: 0.3,
              ease: 'power2.out',
            });
          });

          card.addEventListener('mouseleave', () => {
            if (hoverTween) hoverTween.kill();
            hoverTween = gsap.to(cardContent, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          });
        }
      });
    };

    // Wait for layout to be ready
    const timer = setTimeout(() => {
      initAnimations();
      // Refresh after a short delay to ensure everything is calculated
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    }, 150);

    // Handle window resize
    const handleResize = () => {
      // Kill all triggers and reinitialize
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger && sectionRef.current?.contains(trigger.vars.trigger as Node)) {
          trigger.kill();
        }
      });
      setTimeout(() => {
        initAnimations();
        ScrollTrigger.refresh();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      // Cleanup ScrollTriggers
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger && sectionRef.current?.contains(trigger.vars.trigger as Node)) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50 overflow-hidden"
      style={{ isolation: 'isolate', position: 'relative', zIndex: 1 }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center pt-8 pb-4">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-2">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-gray-600">
            See what our users have to say about their experience
          </p>
        </div>

        {/* Testimonials Stack */}
        <div ref={containerRef} className="relative md:min-h-[400px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card"
              style={{
                position: 'relative',
                marginBottom: '1.5rem',
              }}
            >
              <div 
                className={`testimonial-card-content ${testimonial.bgColor} rounded-[2rem] p-8 md:p-10 shadow-2xl will-change-transform transition-shadow duration-300 hover:shadow-3xl`}
                style={{
                  transformOrigin: 'center center',
                }}
              >
                {/* Company Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">
                      {testimonial.company.charAt(0)}
                    </span>
                  </div>
                  <span className="font-heading font-bold text-xl text-primary">
                    {testimonial.company}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-gray-800 text-lg md:text-xl leading-relaxed mb-8 font-normal">
                  {testimonial.quote}
                </p>

                {/* Author & Rating */}
                <div className="flex items-center justify-between flex-wrap gap-4 border-t border-gray-200 pt-6">
                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center shadow-md`}>
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-base text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-orange-400 fill-orange-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
