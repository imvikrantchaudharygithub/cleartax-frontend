/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Blog Types
 */
export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogDto {
  slug: string;
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
  featured?: boolean;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

/**
 * Service Types
 */
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

export interface DraftMeta {
  completionStep?: number;
  lastSavedAt?: string;
}

export interface Service {
  _id: string;
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
  process: ProcessStep[];
  faqs: FAQ[];
  relatedServices: string[];
  status?: 'draft' | 'published';
  draftMeta?: DraftMeta;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceCategory {
  _id: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  heroTitle: string;
  heroDescription: string;
  categoryType?: 'simple' | 'banking-finance' | 'ipo' | 'legal';
  subServices?: string[];
  services?: Service[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceDto {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  iconName: string;
  category: string;
  subcategory?: string;
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
  status?: 'draft' | 'published';
  draftMeta?: DraftMeta;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

/**
 * Inquiry Types
 */
export interface Inquiry {
  _id: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  notes?: string;
  message?: string;
  sourcePage: string;
  type: 'callback' | 'query';
  status?: 'pending' | 'contacted' | 'resolved' | 'archived';
  serviceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInquiryDto {
  name: string;
  phone: string;
  email?: string;
  businessType: string; // Required by API
  message: string; // Required by API
  sourcePage: string;
  type: 'callback' | 'query';
  serviceId?: string;
  interest?: string; // Legacy field, kept for backward compatibility
  notes?: string; // Legacy field, kept for backward compatibility
}

export interface InquiryStats {
  total: number;
  callbacks: number;
  queries: number;
  today: number;
  pending: number;
  contacted: number;
  resolved: number;
}

/**
 * Team Types
 */
export interface TeamMember {
  _id: string;
  id: string;
  name: string;
  role: string;
  description: string;
  linkedin: string;
  avatar?: string;
  accent?: string;
  focusOn?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeamMemberDto {
  id: string;
  name: string;
  role: string;
  description: string;
  linkedin: string;
  avatar?: string;
  accent?: string;
  focusOn?: string;
}

export interface UpdateTeamMemberDto extends Partial<CreateTeamMemberDto> {}

// Testimonial Types
export interface Testimonial {
  _id: string;
  id: string;
  companyName: string;
  companyLogo?: string;
  testimonial: string;
  personName: string;
  personRole: string;
  personAvatar?: string;
  rating: number;
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTestimonialDto {
  id: string;
  companyName: string;
  companyLogo?: string;
  testimonial: string;
  personName: string;
  personRole: string;
  personAvatar?: string;
  rating: number;
  featured?: boolean;
  order?: number;
}

export interface UpdateTestimonialDto extends Partial<CreateTestimonialDto> {}

// Contact Information Types
export interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  location?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
  };
  businessHours: BusinessHours;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Compliance Types
 */
export interface ComplianceDeadline {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'urgent' | 'upcoming' | 'completed';
  category: 'GST' | 'Income Tax' | 'TDS' | 'Other';
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplianceDocument {
  _id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'verified' | 'pending' | 'rejected';
  fileUrl: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplianceStats {
  filingsDue: number;
  completed: number;
  documents: number;
  lastUpdated: string;
}

/**
 * Calculator Types
 */
export interface IncomeTaxInput {
  financialYear: string;
  incomeType: 'salary' | 'business' | 'investment' | 'other';
  grossIncome: number;
  age: number;
  deductions: {
    section80C: number;
    section80D: number;
    section80E: number;
    others: number;
  };
  state: string;
  surcharge: boolean;
}

export interface IncomeTaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxLiability: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  breakdown: Array<{
    slab: string;
    rate: number;
    amount: number;
    tax: number;
  }>;
}

export interface GSTInput {
  calculationType: 'add' | 'remove';
  amount: number;
  gstRate: 5 | 12 | 18 | 28;
  transactionType: 'b2b' | 'b2c';
  interstate: boolean;
}

export interface GSTResult {
  baseAmount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  breakdown: {
    baseAmount: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    total: number;
  };
}

export interface EMIInput {
  loanAmount: number;
  interestRate: number;
  loanDuration: number;
  loanType: 'home' | 'auto' | 'personal' | 'education';
  processingFee?: number;
  insurance?: number;
  prepayment?: number;
}

export interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  processingFee: number;
  totalCost: number;
  schedule: Array<{
    month: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export interface HRAInput {
  basicSalary: number;
  da: number;
  hraReceived: number;
  cityType: 'metro' | 'non-metro';
  rentPaid: number;
  spouseIncome?: number;
}

export interface HRAResult {
  hraReceived: number;
  actualRentPaid: number;
  rentPaidMinus10Percent: number;
  cityLimit: number;
  exemption: number;
  taxableHRA: number;
  breakdown: {
    actualHRA: number;
    rentPaidMinus10Percent: number;
    cityLimit: number;
    exemption: number;
  };
}

export interface TDSInput {
  tdsType: 'salary' | 'professional' | 'contract' | 'rent' | 'commission' | 'interest' | 'dividend';
  amount: number;
  hasPAN: boolean;
  financialYear: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  specialCategory?: boolean;
}

export interface TDSResult {
  amount: number;
  tdsRate: number;
  tdsAmount: number;
  netAmount: number;
  threshold: number;
  applicable: boolean;
  breakdown: {
    amount: number;
    rate: number;
    tds: number;
    net: number;
  };
}

// Home Info Types
export interface HeroImageItem {
  url: string;
  alt?: string;
  publicId?: string;
}

export interface HomeInfo {
  banner: {
    heading: string;
    description: string;
    button1Text: string;
    button2Text: string;
    checklistItems: string[]; // Array of 3 items
    heroImage?: string; // URL
    heroImageAlt?: string;
    heroImages?: HeroImageItem[];
  };
  benefits: {
    heading: string;
    subheading: string;
    items: Array<{
      title: string;
      description: string;
      image?: string; // URL
      imagePosition: 'left' | 'right';
      imageAlt?: string;
    }>; // Array of 3 items
  };
  services: {
    heading: string;
    subheading: string;
    cards: Array<{
      title: string;
      description: string;
      features: string[];
      href: string;
      icon: 'Receipt' | 'Building2' | 'Calculator' | 'Award';
      colorGradient: string;
    }>; // Array of 4 items
    ctaButtonText: string;
    ctaButtonLink: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateHomeInfoDto = Partial<HomeInfo>;
