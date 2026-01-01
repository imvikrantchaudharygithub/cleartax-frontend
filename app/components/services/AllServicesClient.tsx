'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Search, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Building2,
  FileText
} from 'lucide-react';
import Input from '@/app/components/ui/Input';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';

// Serializable service type (matches what server passes)
interface SerializableService {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  category: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  relatedServices: string[];
  subcategorySlug?: string;
}

interface ServiceGroup {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  services: SerializableService[];
  color: string;
  gradient: string;
}

interface AllServicesClientProps {
  serviceGroups: ServiceGroup[];
}

export default function AllServicesClient({ serviceGroups }: AllServicesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Ensure serviceGroups is always an array
  const safeServiceGroups = Array.isArray(serviceGroups) ? serviceGroups : [];

  // Filter services
  const filteredGroups = useMemo(() => {
    return safeServiceGroups
      .map(group => ({
        ...group,
        services: (group.services || []).filter(service => {
          const matchesSearch = 
            service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = selectedCategory === 'all' || selectedCategory === group.id;
          return matchesSearch && matchesCategory;
        }),
      }))
      .filter(group => group.services && group.services.length > 0);
  }, [safeServiceGroups, searchQuery, selectedCategory]);

  const totalServices = safeServiceGroups.reduce((sum, group) => sum + ((group.services || []).length), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue via-white to-white">
      {/* Hero Section with Parallax */}
      <motion.div 
        style={{ opacity }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-white py-20 md:py-28"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl mb-8 shadow-2xl"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-primary mb-6"
              >
                All Services
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl md:text-2xl text-gray-600 mb-12"
              >
                Comprehensive solutions for your business needs. Explore {totalServices}+ professional services.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefixIcon={<Search className="w-5 h-5" />}
                />
              </motion.div>

              {/* Category Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                  }`}
                >
                  All Services
                </button>
                {safeServiceGroups.map((group) => {
                  const Icon = getIconFromName(group.iconName) || FileText;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedCategory(group.id)}
                      className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                        selectedCategory === group.id
                          ? `bg-gradient-to-r ${group.color} text-white shadow-lg scale-105`
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {group.title}
                    </button>
                  );
                })}
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredGroups.map((group, groupIndex) => {
          const GroupIcon = getIconFromName(group.iconName) || FileText;
          return (
            <ScrollReveal key={group.id} direction="up" delay={groupIndex * 0.1}>
              <div className="mb-20">
                {/* Category Header */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${group.color} shadow-lg flex-shrink-0`}>
                      <GroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-primary mb-1 sm:mb-2">
                        {group.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600">{group.description}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 sm:ml-auto">
                    <Link
                      href={group.href}
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-full font-medium text-sm sm:text-base text-gray-700 hover:border-primary hover:text-primary transition-all whitespace-nowrap"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(group.services || [])
                    .filter(service => service != null && service.id && service.slug)
                    .map((service, index) => {
                    // Convert iconName to component with fallback - ensure it's always a valid component
                    let ServiceIcon: any = FileText;
                    try {
                      const icon = getIconFromName(service?.iconName);
                      if (icon && typeof icon === 'function') {
                        ServiceIcon = icon;
                      }
                    } catch (error) {
                      // If icon conversion fails, use default
                      ServiceIcon = FileText;
                    }
                    
                    // Determine service href based on category type
                    let serviceHref = `${group.href}/${service.slug}`;
                    
                    // For complex categories (legal, ipo, banking-finance), use subcategory if available
                    if ((group.id === 'legal' || group.id === 'ipo' || group.id === 'banking-finance') && service.subcategorySlug) {
                      serviceHref = `${group.href}/${service.subcategorySlug}/${service.slug}`;
                    }

                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="group"
                      >
                        <Link href={serviceHref}>
                          <div className={`relative h-full ${group.gradient} rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all overflow-hidden`}>
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full blur-3xl" />
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full blur-2xl" />
                            </div>

                            <div className="relative z-10">
                              {/* Icon */}
                              <motion.div
                                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                                className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${group.color} rounded-2xl mb-4 shadow-lg`}
                              >
                                <ServiceIcon className="w-8 h-8 text-white" />
                              </motion.div>

                              {/* Title */}
                              <h3 className="font-heading font-bold text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                {service?.title || 'Untitled Service'}
                              </h3>

                              {/* Description */}
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {service?.shortDescription || ''}
                              </p>

                              {/* Price & Duration */}
                              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200/50">
                                <div>
                                  <p className="text-sm font-semibold text-primary">
                                    ₹{service?.price?.min?.toLocaleString('en-IN') || '0'} - ₹{service?.price?.max?.toLocaleString('en-IN') || '0'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Zap className="w-3 h-3" />
                                  <span>{service?.duration || ''}</span>
                                </div>
                              </div>

                              {/* Features Preview */}
                              {service?.features && Array.isArray(service.features) && service.features.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex flex-wrap gap-2">
                                    {service.features.slice(0, 3).map((feature: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-white/80 text-xs font-medium text-gray-700 rounded-lg"
                                      >
                                        {feature.length > 20 ? feature.substring(0, 20) + '...' : feature}
                                      </span>
                                    ))}
                                    {service.features.length > 3 && (
                                      <span className="px-2 py-1 bg-white/80 text-xs font-medium text-gray-700 rounded-lg">
                                        +{service.features.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* CTA */}
                              <motion.div
                                className="flex items-center justify-between mt-auto pt-4"
                                whileHover={{ x: 5 }}
                              >
                                <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                                  Learn More
                                </span>
                                <ArrowRight className="w-5 h-5 text-primary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                              </motion.div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          );
        })}

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Stats Section */}
        <ScrollReveal direction="up">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-white shadow-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Total Services', value: totalServices, icon: Sparkles },
                { label: 'Service Categories', value: serviceGroups.length, icon: Building2 },
                { label: 'Happy Clients', value: '10K+', icon: CheckCircle },
                { label: 'Success Rate', value: '95%', icon: Zap },
              ].map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
                      <StatIcon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  );
}

