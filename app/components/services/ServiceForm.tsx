'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inquiryFormSchema, InquiryFormData } from '@/app/lib/schemas/serviceSchemas';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
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
    formState: { errors },
    reset,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
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
        email: data.email,
        phone: data.phone,
        interest: data.businessType, // Map businessType to interest
        notes: data.message, // Map message to notes
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
    <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-8 border-2 border-accent/20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="font-heading font-bold text-2xl text-primary mb-2">
            Get Started Today
          </h3>
          <p className="text-gray-600">
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
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 mr-2" />
                Submit Inquiry
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By submitting this form, you agree to our{' '}
            <a href="/terms" className="text-accent hover:underline">
              Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}



