'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import { ProcessStep } from '@/app/types/services';

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-accent via-primary to-accent/30" />

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative flex gap-6"
          >
            {/* Step Number/Icon */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{step.step}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow pb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-accent/30 hover:shadow-md transition-all">
                {/* Title and Duration */}
                <div className="flex items-start justify-between mb-2 gap-4">
                  <h4 className="font-heading font-semibold text-lg text-primary">
                    {step.title}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                    <Clock className="w-4 h-4" />
                    <span>{step.duration}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Check Icon */}
                <div className="mt-3 flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Completed by our experts</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}






