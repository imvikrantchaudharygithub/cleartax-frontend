import { z } from 'zod';

// Income Tax Calculator Schema
export const incomeTaxSchema = z.object({
  financialYear: z.string().min(1, 'Financial year is required'),
  incomeType: z.enum(['salary', 'business', 'investment', 'other']),
  grossIncome: z.number().min(0, 'Gross income must be positive').max(100000000, 'Amount too large'),
  age: z.number().min(0, 'Age must be positive').max(120, 'Invalid age'),
  deductions: z.object({
    section80C: z.number().min(0).max(150000, '80C deduction limited to ₹1,50,000'),
    section80D: z.number().min(0).max(100000, '80D deduction limited to ₹1,00,000'),
    section80E: z.number().min(0).max(500000, 'Invalid deduction amount'),
    others: z.number().min(0).max(500000, 'Invalid deduction amount'),
  }),
  state: z.string().min(1, 'State is required'),
  surcharge: z.boolean(),
});

export type IncomeTaxFormData = z.infer<typeof incomeTaxSchema>;

// GST Calculator Schema
export const gstSchema = z.object({
  calculationType: z.enum(['add', 'remove']),
  amount: z.number().min(1, 'Amount must be greater than 0').max(10000000000, 'Amount too large'),
  gstRate: z.union([z.literal(5), z.literal(12), z.literal(18), z.literal(28)]),
  transactionType: z.enum(['b2b', 'b2c']),
  interstate: z.boolean(),
});

export type GSTFormData = z.infer<typeof gstSchema>;

// EMI Calculator Schema
export const emiSchema = z.object({
  loanAmount: z.number().min(10000, 'Minimum loan amount is ₹10,000').max(100000000, 'Amount too large'),
  interestRate: z.number().min(1, 'Interest rate must be at least 1%').max(30, 'Interest rate too high'),
  loanDuration: z.number().min(1, 'Loan duration must be at least 1 month').max(360, 'Maximum 30 years (360 months)'),
  loanType: z.enum(['home', 'auto', 'personal', 'education']),
  processingFee: z.number().min(0).max(100000).optional(),
  insurance: z.number().min(0).max(10000).optional(),
  prepayment: z.number().min(0).optional(),
});

export type EMIFormData = z.infer<typeof emiSchema>;

// HRA Calculator Schema
export const hraSchema = z.object({
  basicSalary: z.number().min(0, 'Basic salary must be positive').max(10000000, 'Amount too large'),
  da: z.number().min(0, 'DA must be positive').max(10000000, 'Amount too large'),
  hraReceived: z.number().min(0, 'HRA received must be positive').max(10000000, 'Amount too large'),
  cityType: z.enum(['metro', 'non-metro']),
  rentPaid: z.number().min(0, 'Rent paid must be positive').max(10000000, 'Amount too large'),
  spouseIncome: z.number().min(0).max(10000000).optional(),
});

export type HRAFormData = z.infer<typeof hraSchema>;

// TDS Calculator Schema
export const tdsSchema = z.object({
  tdsType: z.enum(['salary', 'professional', 'contract', 'rent', 'commission', 'interest', 'dividend']),
  amount: z.number().min(1, 'Amount must be greater than 0').max(100000000, 'Amount too large'),
  hasPAN: z.boolean(),
  financialYear: z.string().min(1, 'Financial year is required'),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  specialCategory: z.boolean().optional(),
});

export type TDSFormData = z.infer<typeof tdsSchema>;

// Contact Form Schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Login Form Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup Form Schema
export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

