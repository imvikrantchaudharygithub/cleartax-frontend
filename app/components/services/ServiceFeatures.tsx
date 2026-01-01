'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ServiceFeaturesProps {
  features: string[];
  benefits?: string[];
}

export default function ServiceFeatures({ features, benefits }: ServiceFeaturesProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Features */}
      <div>
        <h3 className="font-heading font-semibold text-xl text-primary mb-4 flex items-center">
          <span className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
            <CheckCircle className="w-5 h-5 text-accent" />
          </span>
          What's Included
        </h3>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Benefits */}
      {benefits && benefits.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-xl text-primary mb-4 flex items-center">
            <span className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-success" />
            </span>
            Key Benefits
          </h3>
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}





