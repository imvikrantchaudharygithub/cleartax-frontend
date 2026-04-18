import { LucideIcon } from 'lucide-react';

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: LucideIcon;
  /** Serializable icon name for Server Components (e.g. "FileText"). */
  iconName?: string;
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
  process: ProcessStep[];
  faqs: FAQ[];
  relatedServices: string[];
}

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconName?: string;
  heroTitle: string;
  heroDescription: string;
  whyChooseSection?: {
    heading: string;
    items: Array<{
      title: string;
      description: string;
      iconName: string;
    }>;
  };
  heroStats?: Array<{
    label: string;
    iconName: string;
  }>;
  services: Service[];
}

export type ServiceCategoryType = 'gst' | 'registration' | 'income-tax' | 'trademarks';

export interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  message: string;
  serviceId?: string;
}






