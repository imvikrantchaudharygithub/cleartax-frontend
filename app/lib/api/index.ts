/**
 * API Services Index
 * Export all API services from a single entry point
 */

export * from './config';
export * from './types';
export * from './axios';

// Services
export { blogService } from './services/blog.service';
export { serviceService } from './services/service.service';
export { inquiryService } from './services/inquiry.service';
export { teamService } from './services/team.service';
export { testimonialService } from './services/testimonial.service';
export { contactService } from './services/contact.service';
export { complianceService } from './services/compliance.service';
export { calculatorService } from './services/calculator.service';

// Default axios instance
export { default as api } from './axios';

