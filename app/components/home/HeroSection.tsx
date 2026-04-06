'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import RequestCallbackModal from './RequestCallbackModal';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo } from '@/app/lib/api/types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

// Default/fallback data
const defaultBanner = {
  heading: 'Your Complete Tax & Compliance Solution',
  description: 'Calculate, Comply, and Save with Confidence. Professional tax calculators, compliance dashboard, and expert guidance all in one place.',
  button1Text: 'Request Callback',
  button2Text: 'Connect on WhatsApp',
  checklistItems: ['10M+ Invoices Processed', '50K+ Businesses Trust Us', '100% Accurate Calculations'],
  heroImage: '',
  heroImageAlt: 'Tax Solutions',
  heroImages: [] as HomeInfo['banner']['heroImages'],
};

export default function HeroSection() {
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerData, setBannerData] = useState<HomeInfo['banner']>(defaultBanner);

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
    // Wrap by words (not letters) to prevent mid-word line breaks
    import('gsap').then((gsapModule) => {
      const gsap = gsapModule.gsap;
      const words = bannerData.heading.split(' ');
      titleRef.current!.innerHTML = words
        .map((word) => `<span class="inline-block">${word}</span>`)
        .join('<span class="inline-block">&nbsp;</span>');

      gsap.fromTo(
        titleRef.current!.querySelectorAll('span'),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.08,
          stagger: 0.04,
          ease: 'power2.out',
        }
      );
    });
  }, [bannerData.heading]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#E8F4FB] via-[#EDF5F1] to-white">
      {/* Decorative mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-teal/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green-light/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-accent/20 rounded-full text-sm font-medium text-accent mb-6"
            >
              <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              Trusted by 50,000+ Businesses
            </motion.div>

            <h1
              ref={titleRef}
              className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-primary mb-6 leading-tight"
            >
              {bannerData.heading}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
              {bannerData.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-glow"
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

          {/* Right Image with Parallax / Slider */}
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-teal/15 to-brand-green-light/20 rounded-2xl transform rotate-3"></div>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border border-white/50">
              {(() => {
                const images = (bannerData.heroImages?.length ?? 0) > 0
                  ? bannerData.heroImages!
                  : bannerData.heroImage
                    ? [{ url: bannerData.heroImage, alt: bannerData.heroImageAlt }]
                    : [];
                if (images.length === 0) {
                  return (
                    <div className="text-center p-8">
                      <div className="w-64 h-64 mx-auto bg-gradient-to-br from-accent via-teal to-success rounded-full flex items-center justify-center mb-6 shadow-glow">
                        <span className="text-white text-6xl font-bold">&#x20B9;</span>
                      </div>
                      <p className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Smart Tax Solutions
                      </p>
                    </div>
                  );
                }
                const slickSettings = {
                  dots: false,
                  arrows: false,
                  infinite: true,
                  autoplay: true,
                  autoplaySpeed: 3000,
                  fade: true,
                  speed: 500,
                };
                return (
                  <Slider {...slickSettings} className="w-full h-full [&_.slick-list]:h-full [&_.slick-track]:h-full [&_.slick-slide]:h-full [&_.slick-slide>div]:h-full">
                    {images.map((img, i) => (
                      <div key={i} className="h-full">
                        <img
                          src={img.url}
                          alt={img.alt || 'Hero'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </Slider>
                );
              })()}
            </div>
          </motion.div>
        </div>
      </div>

      <RequestCallbackModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
