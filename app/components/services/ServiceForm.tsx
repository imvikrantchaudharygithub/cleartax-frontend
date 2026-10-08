'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { inquiryFormSchema, InquiryFormData } from '@/app/lib/schemas/serviceSchemas';
import Input from '../fv/Input';
import Select from '../fv/Select';
import TextArea from '../fv/TextArea';
import Button from '../fv/Button';
import { User, Mail, Phone, Building, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServiceFormProps {
  serviceId: string;
  serviceTitle: string;
}

export default function ServiceForm({ serviceId, serviceTitle }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<InquiryFormData>({
    resolver: yupResolver(inquiryFormSchema) as any,
    mode: 'onChange',
    defaultValues: {
      serviceId,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: InquiryFormData) => {
    try {
      setIsSubmitting(true);
      const { inquiryService } = await import('@/app/lib/api');
      await inquiryService.create({
        name: data.name,
        email: data.email ? String(data.email) : undefined,
        phone: data.phone,
        businessType: data.businessType,
        message: data.message,
        sourcePage: window.location.pathname,
        type: 'query',
        serviceId: data.serviceId,
      });
      // Toast notification is handled by apiPost in axios.ts
      reset();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      // Toast notification is handled by apiPost in axios.ts
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership Firm' },
    { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
    { value: 'private-limited', label: 'Private Limited Company' },
    { value: 'public-limited', label: 'Public Limited Company' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="fv-card p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="mb-2 text-2xl font-extrabold tracking-[-0.02em] text-fv-navy">
            Get Started Today
          </h3>
          <p className="text-fv-slate">
            Fill out this form and our expert will contact you within 24 hours
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your name"
              prefixIcon={<User className="w-5 h-5" />}
              error={errors.name?.message}
              {...register('name')}
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              prefixIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Phone */}
            <Input
              label="Phone Number"
              type="tel"
              placeholder="10-digit mobile number"
              prefixIcon={<Phone className="w-5 h-5" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            {/* Business Type */}
            <Select
              label="Business Type"
              options={businessTypeOptions}
              error={errors.businessType?.message}
              {...register('businessType')}
            >
              <Building className="w-5 h-5" />
            </Select>
          </div>

          {/* Message */}
          <TextArea
            label="Your Message"
            placeholder="Tell us about your requirements..."
            rows={4}
            error={errors.message?.message}
            {...register('message')}
          />

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full" 
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" />
                Submit Inquiry
              </>
            )}
          </Button>

          <p className="text-xs text-center text-fv-slate">
            By submitting this form, you agree to our{' '}
            <a href="/terms" className="font-semibold text-fv-blue-d hover:underline">
              Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-semibold text-fv-blue-d hover:underline">
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}



