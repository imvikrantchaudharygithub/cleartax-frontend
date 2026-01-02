'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { scaleInVariants } from '@/app/lib/animations/staggerConfig';

export default function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-95"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleInVariants}
          className="text-center"
        >
          <motion.div
            variants={scaleInVariants}
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h2
            variants={scaleInVariants}
            className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-6"
          >
            Ready to Simplify Your Taxes?
          </motion.h2>
          
          <motion.p
            variants={scaleInVariants}
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
          >
            Join 50,000+ businesses and individuals who trust ClearTax for their tax and compliance needs. Start for free today!
          </motion.p>

          <motion.div
            variants={scaleInVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/services">
              <Button variant="secondary" size="lg" className="!bg-white !text-primary hover:!bg-gray-100">
                View Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/calculators">
              <Button variant="tertiary" size="lg" className="!border-white !text-white hover:!bg-white/10">
                Explore Calculators
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={scaleInVariants}
            className="mt-8 text-sm text-white/80"
          >
            No credit card required • Free forever • Setup in 2 minutes
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

