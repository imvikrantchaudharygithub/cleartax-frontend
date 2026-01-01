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

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = gsap.utils.toArray<HTMLElement>('.testimonial-card');
    
    // Set initial state immediately to prevent jerk
    cards.forEach((card) => {
      gsap.set(card, {
        scale: 1,
        opacity: 1,
        y: 0,
        transformOrigin: 'center center',
      });
    });
    
    // Kill all existing ScrollTriggers for this section
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger && sectionRef.current?.contains(trigger.vars.trigger as Node)) {
        trigger.kill();
      }
    });

    cards.forEach((card, index) => {
      // Don't pin the last card - it just scrolls normally
      if (index === cards.length - 1) return;

      ScrollTrigger.create({
        trigger: card,
        start: 'top 20%',
        end: () => `+=${window.innerHeight * 0.6}`,
        pin: true,
        pinSpacing: false,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // More aggressive fade out - go to 0 opacity at the end
          const scale = 1 - (progress * 0.15);
          const opacity = 1 - (progress * 1); // Fade to 0
          const y = -(progress * 50);
          
          gsap.set(card, {
            scale: scale,
            opacity: opacity,
            y: y,
            transformOrigin: 'center center',
          });
        },
      });
    });

    return () => {
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
      className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center pt-32 pb-20">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-gray-600">
            See what our users have to say about their experience
          </p>
        </div>

        {/* Testimonials Stack */}
        <div className="relative pb-32">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card mb-16 last:mb-0"
            >
              <div 
                className={`${testimonial.bgColor} rounded-[2rem] p-8 md:p-10 shadow-2xl will-change-transform`}
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
