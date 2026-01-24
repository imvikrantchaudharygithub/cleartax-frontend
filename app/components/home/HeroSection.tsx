'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import RequestCallbackModal from './RequestCallbackModal';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo } from '@/app/lib/api/types';

// Default/fallback data
const defaultBanner = {
  heading: 'Your Complete Tax & Compliance Solution',
  description: 'Calculate, Comply, and Save with Confidence. Professional tax calculators, compliance dashboard, and expert guidance all in one place.',
  button1Text: 'Request Callback',
  button2Text: 'Connect on WhatsApp',
  checklistItems: ['10M+ Invoices Processed', '50K+ Businesses Trust Us', '100% Accurate Calculations'],
  heroImage: '',
  heroImageAlt: 'Tax Solutions',
};

export default function HeroSection() {
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerData, setBannerData] = useState(defaultBanner);

  useEffect(() => {
    // Fetch home info from API
    const fetchHomeInfo = async () => {
      try {
        const data = await homeInfoService.get();
        if (data?.banner) {
          setBannerData(data.banner);
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
    
    // Dynamically import GSAP only on client side
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([gsapModule, ScrollTriggerModule]) => {
      const gsap = gsapModule.gsap;
      const ScrollTrigger = ScrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!imageRef.current) return;

      gsap.to(imageRef.current, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: imageRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!titleRef.current) return;

    // Dynamically import GSAP only on client side
    import('gsap').then((gsapModule) => {
      const gsap = gsapModule.gsap;
      const letters = bannerData.heading.split('');
      titleRef.current!.innerHTML = letters
        .map((letter) => `<span class="inline-block">${letter === ' ' ? '&nbsp;' : letter}</span>`)
        .join('');

      gsap.fromTo(
        titleRef.current!.querySelectorAll('span'),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.05,
          stagger: 0.02,
          ease: 'power2.out',
        }
      );
    });
  }, [bannerData.heading]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-light-blue to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="z-10"
          >
            <h1 
              ref={titleRef}
              className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-primary mb-6 leading-tight"
            >
              {bannerData.heading}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              {bannerData.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => setIsModalOpen(true)}
              >
                {bannerData.button1Text}
                <Phone className="ml-2 w-5 h-5" />
              </Button>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'YOUR_PHONE_NUMBER'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="tertiary" size="lg" className="w-full sm:w-auto">
                  {bannerData.button2Text}
                  <MessageCircle className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>

            <div className="space-y-3">
              {bannerData.checklistItems.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Image with Parallax */}
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl transform rotate-3"></div>
            <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
              {bannerData.heroImage ? (
                <img
                  src={bannerData.heroImage}
                  alt={bannerData.heroImageAlt || 'Hero'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <div className="w-64 h-64 mx-auto bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mb-6">
                    <span className="text-white text-6xl font-bold">₹</span>
                  </div>
                  <p className="text-2xl font-heading font-bold text-primary">
                    Smart Tax Solutions
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

      <RequestCallbackModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}

