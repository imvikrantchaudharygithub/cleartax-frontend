import { LucideIcon } from 'lucide-react';
import { ProcessStep, FAQ } from './services';

export interface IPOSubService {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: LucideIcon;
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
}

export interface IPOCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  heroTitle: string;
  heroDescription: string;
  subServices: IPOSubService[];
}

