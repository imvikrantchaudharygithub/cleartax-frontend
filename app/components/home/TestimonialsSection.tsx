'use client';

import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Star } from 'lucide-react';
import 'swiper/css';

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
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-amber-50 py-20 md:py-24">
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
          loop={true}
          className="testimonials-swiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div 
                className={`testimonial-card-content ${testimonial.bgColor} rounded-[2rem] p-8 md:p-10`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">
                      {testimonial.company.charAt(0)}
                    </span>
                  </div>
                  <span className="font-heading font-bold text-xl text-primary">
                    {testimonial.company}
                  </span>
                </div>

                <p className="text-gray-800 text-lg md:text-xl leading-relaxed mb-8">
                  {testimonial.quote}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4 border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.avatarColor} flex items-center justify-center`}>
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-base text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-orange-400 fill-orange-400" />
                    ))}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
