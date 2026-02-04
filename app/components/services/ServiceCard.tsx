'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight, Clock, IndianRupee, FileText } from 'lucide-react';
import Card from '../ui/Card';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';

interface ServiceCardProps {
  title: string;
  shortDescription: string;
  /** Omit when passing from Server Component; use iconName instead. */
  icon?: LucideIcon;
  iconName?: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  slug: string;
  category: string;
  subcategory?: string; // Optional subcategory for complex categories
}

export default function ServiceCard({
  title,
  shortDescription,
  icon: IconProp,
  iconName,
  price,
  duration,
  slug,
  category,
  subcategory,
}: ServiceCardProps) {
  const Icon = IconProp ?? (iconName ? getIconFromName(iconName) : FileText);
  // Build the correct route based on whether subcategory exists
  const href = subcategory 
    ? `/services/${category.toLowerCase()}/${subcategory}/${slug}`
    : `/services/${category.toLowerCase()}/${slug}`;

  return (
    <Link href={href}>
      <Card hoverable className="h-full flex flex-col group">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-xl mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="font-heading font-semibold text-lg text-primary mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
          {shortDescription}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <IndianRupee className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium">
              {price.min === price.max
                ? `${price.min.toLocaleString('en-IN')}`
                : `${price.min.toLocaleString('en-IN')} - ${price.max.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{duration}</span>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="inline-flex items-center text-accent font-medium text-sm"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          Learn More
          <ArrowRight className="ml-2 w-4 h-4" />
        </motion.div>
      </Card>
    </Link>
  );
}



