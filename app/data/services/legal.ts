import { Scale, Gavel, Building2, FileText, CheckCircle, Users, Shield, Zap } from 'lucide-react';
import { LegalCategory, LegalSubService } from '@/app/types/legal';

export const legalCategories: LegalCategory[] = [
  {
    id: 'civil-law',
    slug: 'civil-law',
    title: 'Civil Law',
    description: 'Comprehensive civil litigation services including property disputes, recovery suits, and injunction matters.',
    icon: Scale,
    heroTitle: 'Civil Law Services',
    heroDescription: 'Expert legal representation for civil matters including property disputes, recovery suits, and injunction cases with proven track record.',
    stats: [
      { label: '500+ Cases Won', icon: CheckCircle },
      { label: 'Expert Advocates', icon: Users },
      { label: '95% Success Rate', icon: Shield },
      { label: 'Fast Resolution', icon: Zap },
    ],
    subServices: [
      {
        id: 'civil-suits-injunction',
        slug: 'civil-suits-injunction',
        title: 'Civil Suits & Injunction Matters',
        shortDescription: 'Expert representation in civil suits and injunction matters with strategic legal approach.',
        longDescription: 'Our experienced advocates handle all types of civil suits including property disputes, contract breaches, and other civil matters. We also specialize in obtaining and defending injunctions to protect your rights and interests during ongoing litigation.',
        icon: FileText,
        price: { min: 50000, max: 500000, currency: 'INR' },
        duration: '3-12 months',
        features: [
          'Drafting and filing of civil suits',
          'Injunction applications and defense',
          'Court representation and arguments',
          'Document preparation and evidence management',
          'Settlement negotiations',
          'Appeal filing and representation',
        ],
        benefits: [
          'Expert legal representation',
          'Strategic case management',
          'Timely resolution',
          'Cost-effective solutions',
        ],
        requirements: [
          'Relevant documents and agreements',
          'Property papers (if applicable)',
          'Correspondence records',
          'Witness details',
        ],
        process: [
          { step: 1, title: 'Case Assessment', description: 'Review of case details and legal position', duration: '1 week' },
          { step: 2, title: 'Document Preparation', description: 'Drafting petitions, plaints, and applications', duration: '2 weeks' },
          { step: 3, title: 'Court Filing', description: 'Filing in appropriate court with all documents', duration: '1 week' },
          { step: 4, title: 'Representation', description: 'Court appearances and case proceedings', duration: 'Ongoing' },
        ],
        faqs: [
          { id: 'civil-1', question: 'What is the typical duration of a civil suit?', answer: 'Civil suits typically take 3-12 months depending on complexity, court workload, and cooperation of parties.' },
          { id: 'civil-2', question: 'Can I get an injunction immediately?', answer: 'Temporary injunctions can be obtained quickly, usually within 1-2 weeks of filing, subject to court schedule.' },
        ],
        relatedServices: ['recovery-summary-suits', 'property-possession-disputes'],
      },
      {
        id: 'recovery-summary-suits',
        slug: 'recovery-summary-suits',
        title: 'Recovery & Summary Suits',
        shortDescription: 'Fast-track recovery of debts and dues through summary suits and execution proceedings.',
        longDescription: 'We specialize in recovery of outstanding debts, loans, and dues through summary suits which provide faster resolution compared to regular suits. Our team ensures quick recovery through strategic legal approach and execution proceedings.',
        icon: Gavel,
        price: { min: 30000, max: 300000, currency: 'INR' },
        duration: '2-6 months',
        features: [
          'Summary suit filing',
          'Execution proceedings',
          'Attachment and recovery',
          'Negotiation and settlement',
        ],
        benefits: [
          'Faster resolution',
          'Higher recovery rate',
          'Cost-effective process',
        ],
        requirements: [
          'Loan agreements or invoices',
          'Default notices',
          'Communication records',
        ],
        process: [
          { step: 1, title: 'Document Review', description: 'Review of loan agreements and default documents', duration: '3 days' },
          { step: 2, title: 'Suit Filing', description: 'Filing summary suit in appropriate court', duration: '1 week' },
          { step: 3, title: 'Execution', description: 'Execution proceedings for recovery', duration: '2-4 months' },
        ],
        faqs: [
          { id: 'recovery-1', question: 'How fast can I recover my money?', answer: 'Summary suits typically result in recovery within 2-6 months depending on case complexity.' },
        ],
        relatedServices: ['civil-suits-injunction'],
      },
    ],
  },
  {
    id: 'criminal-law',
    slug: 'criminal-law',
    title: 'Criminal Law',
    description: 'Expert criminal defense and prosecution services including bail applications, FIR quashing, and trial representation.',
    icon: Gavel,
    heroTitle: 'Criminal Law Services',
    heroDescription: 'Experienced criminal lawyers providing defense and prosecution services with focus on bail, FIR quashing, and trial representation.',
    stats: [
      { label: '1000+ Cases', icon: CheckCircle },
      { label: 'Expert Lawyers', icon: Users },
      { label: '24/7 Support', icon: Shield },
      { label: 'Quick Bail', icon: Zap },
    ],
    subServices: [
      {
        id: 'criminal-complaints-defense',
        slug: 'criminal-complaints-defense',
        title: 'Criminal Complaints & Defence',
        shortDescription: 'Expert defense in criminal cases with strategic legal representation.',
        longDescription: 'Our criminal law experts provide comprehensive defense services in all types of criminal cases. We handle everything from initial complaint filing to trial representation, ensuring your rights are protected throughout the legal process.',
        icon: Shield,
        price: { min: 50000, max: 1000000, currency: 'INR' },
        duration: '6-24 months',
        features: [
          'Criminal complaint drafting',
          'Defense strategy development',
          'Court representation',
          'Witness examination',
          'Bail applications',
        ],
        benefits: [
          'Expert legal defense',
          'Protection of rights',
          'Strategic case handling',
        ],
        requirements: [
          'FIR copy or complaint',
          'Case documents',
          'Witness details',
        ],
        process: [
          { step: 1, title: 'Case Review', description: 'Detailed review of charges and evidence', duration: '1 week' },
          { step: 2, title: 'Strategy Development', description: 'Developing defense strategy', duration: '1 week' },
          { step: 3, title: 'Court Representation', description: 'Regular court appearances and arguments', duration: 'Ongoing' },
        ],
        faqs: [
          { id: 'criminal-1', question: 'How long do criminal cases take?', answer: 'Criminal cases typically take 6-24 months depending on complexity and court schedule.' },
        ],
        relatedServices: ['bail-applications', 'fir-drafting-quashing'],
      },
      {
        id: 'bail-applications',
        slug: 'bail-applications',
        title: 'Bail Applications (Regular & Anticipatory)',
        shortDescription: 'Quick and effective bail applications for regular and anticipatory bail matters.',
        longDescription: 'We specialize in filing and arguing bail applications, both regular and anticipatory. Our experienced lawyers ensure quick bail grants through strong legal arguments and proper documentation.',
        icon: Zap,
        price: { min: 25000, max: 200000, currency: 'INR' },
        duration: '1-4 weeks',
        features: [
          'Regular bail applications',
          'Anticipatory bail applications',
          'Bail arguments in court',
          'Bail condition compliance',
        ],
        benefits: [
          'Quick bail processing',
          'High success rate',
          'Expert representation',
        ],
        requirements: [
          'FIR copy',
          'Case details',
          'Personal documents',
        ],
        process: [
          { step: 1, title: 'Application Drafting', description: 'Preparing bail application with strong grounds', duration: '2-3 days' },
          { step: 2, title: 'Court Filing', description: 'Filing bail application in appropriate court', duration: '1 day' },
          { step: 3, title: 'Arguments', description: 'Presenting arguments for bail', duration: '1-2 weeks' },
        ],
        faqs: [
          { id: 'bail-1', question: 'How quickly can I get bail?', answer: 'Bail applications are typically heard within 1-4 weeks of filing, depending on court schedule.' },
        ],
        relatedServices: ['criminal-complaints-defense'],
      },
    ],
  },
  {
    id: 'corporate-commercial-law',
    slug: 'corporate-commercial-law',
    title: 'Corporate & Commercial Law',
    description: 'Expert legal services for corporate disputes, shareholder matters, and commercial litigation.',
    icon: Building2,
    heroTitle: 'Corporate & Commercial Law Services',
    heroDescription: 'Comprehensive legal solutions for corporate and commercial disputes including company law matters, shareholder disputes, and contract enforcement.',
    stats: [
      { label: '200+ Companies', icon: CheckCircle },
      { label: 'Corporate Experts', icon: Users },
      { label: 'Strategic Solutions', icon: Shield },
      { label: 'Fast Resolution', icon: Zap },
    ],
    subServices: [
      {
        id: 'company-law-disputes',
        slug: 'company-law-disputes',
        title: 'Company Law Disputes',
        shortDescription: 'Expert handling of company law disputes and corporate governance matters.',
        longDescription: 'We handle all types of company law disputes including director disputes, corporate governance issues, and compliance matters. Our team ensures proper representation in NCLT and other corporate forums.',
        icon: Building2,
        price: { min: 100000, max: 1000000, currency: 'INR' },
        duration: '6-18 months',
        features: [
          'NCLT representation',
          'Corporate governance disputes',
          'Director disputes',
          'Compliance matters',
        ],
        benefits: [
          'Expert corporate law knowledge',
          'Strategic dispute resolution',
        ],
        requirements: [
          'Company documents',
          'Board resolutions',
          'Shareholding details',
        ],
        process: [
          { step: 1, title: 'Case Analysis', description: 'Review of corporate dispute and legal position', duration: '1 week' },
          { step: 2, title: 'Forum Filing', description: 'Filing in NCLT or appropriate forum', duration: '1 week' },
          { step: 3, title: 'Representation', description: 'Court representation and arguments', duration: 'Ongoing' },
        ],
        faqs: [
          { id: 'corp-1', question: 'Which forum handles company law disputes?', answer: 'Company law disputes are typically handled by NCLT (National Company Law Tribunal) and NCLAT.' },
        ],
        relatedServices: ['shareholder-partnership-disputes'],
      },
    ],
  },
  {
    id: 'tax-litigation',
    slug: 'tax-litigation',
    title: 'Tax Litigation',
    description: 'Expert representation in GST, Income Tax, and Customs litigation matters.',
    icon: FileText,
    heroTitle: 'Tax Litigation Services',
    heroDescription: 'Comprehensive tax litigation services covering GST, Income Tax, and Customs matters with expert representation at all levels.',
    stats: [
      { label: '500+ Appeals', icon: CheckCircle },
      { label: 'Tax Experts', icon: Users },
      { label: 'High Success Rate', icon: Shield },
      { label: 'Quick Resolution', icon: Zap },
    ],
    subServices: [
      {
        id: 'gst-litigation',
        slug: 'gst-litigation',
        title: 'GST Litigation (Appeals, Writs, Adjudication)',
        shortDescription: 'Expert GST litigation services including appeals, writs, and adjudication matters.',
        longDescription: 'We provide comprehensive GST litigation services including filing appeals, writ petitions, and representation in adjudication proceedings. Our team ensures effective representation at all levels of GST litigation.',
        icon: FileText,
        price: { min: 50000, max: 500000, currency: 'INR' },
        duration: '3-12 months',
        features: [
          'GST appeal filing',
          'Writ petition filing',
          'Adjudication representation',
          'Appellate representation',
        ],
        benefits: [
          'Expert GST knowledge',
          'Strategic litigation approach',
        ],
        requirements: [
          'Assessment orders',
          'Appeal documents',
          'Supporting documents',
        ],
        process: [
          { step: 1, title: 'Case Review', description: 'Review of assessment order and grounds', duration: '1 week' },
          { step: 2, title: 'Appeal Filing', description: 'Filing appeal or writ petition', duration: '1 week' },
          { step: 3, title: 'Representation', description: 'Court representation and arguments', duration: 'Ongoing' },
        ],
        faqs: [
          { id: 'gst-lit-1', question: 'What is the time limit for GST appeals?', answer: 'GST appeals must be filed within 3 months from the date of order, extendable by 1 month with sufficient cause.' },
        ],
        relatedServices: ['income-tax-litigation'],
      },
    ],
  },
];

export function getLegalCategoryBySlug(slug: string): LegalCategory | undefined {
  return legalCategories.find(category => category.slug === slug);
}

export function getLegalSubServiceBySlug(categorySlug: string, subServiceSlug: string): LegalSubService | undefined {
  const category = getLegalCategoryBySlug(categorySlug);
  return category?.subServices.find(service => service.slug === subServiceSlug);
}

