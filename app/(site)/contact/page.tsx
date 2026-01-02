'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import { contactSchema, ContactFormData } from '@/app/lib/schemas/calculatorSchemas';
import { contactService } from '@/app/lib/api';
import { ContactInfo } from '@/app/lib/api/types';
import Input from '@/app/components/ui/Input';
import TextArea from '@/app/components/ui/TextArea';
import Select from '@/app/components/ui/Select';
import Button from '@/app/components/ui/Button';
import FormError from '@/app/components/forms/FormError';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, MessageCircle, Globe, Loader2, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

const SUBJECTS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'feedback', label: 'Feedback' },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoadingContact(true);
      const data = await contactService.get();
      setContactInfo(data);
    } catch (err) {
      console.error('Error fetching contact info:', err);
      // Silently fail - show default values if API fails
    } finally {
      setLoadingContact(false);
    }
  };

  const formatBusinessHours = () => {
    if (!contactInfo?.businessHours) return null;

    const days = [
      { key: 'monday', label: 'Monday' },
      { key: 'tuesday', label: 'Tuesday' },
      { key: 'wednesday', label: 'Wednesday' },
      { key: 'thursday', label: 'Thursday' },
      { key: 'friday', label: 'Friday' },
      { key: 'saturday', label: 'Saturday' },
      { key: 'sunday', label: 'Sunday' },
    ] as const;

    const formatTime = (time: string) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return days
      .filter((day) => {
        const dayHours = contactInfo.businessHours[day.key];
        return !dayHours.closed;
      })
      .map((day) => {
        const dayHours = contactInfo.businessHours[day.key];
        return `${day.label}: ${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
      })
      .join('\n');
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
    setIsSubmitting(true);
      const { inquiryService } = await import('@/app/lib/api');
      await inquiryService.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessType: 'other',
        message: `${data.subject}: ${data.message}`,
        sourcePage: '/contact',
        type: 'query',
      });
    setIsSuccess(true);
    reset();
    setTimeout(() => setIsSuccess(false), 3000);
      // Toast notification is handled by apiPost in axios.ts
    } catch (error) {
      console.error('Error submitting contact form:', error);
      // Toast notification is handled by apiPost in axios.ts
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or need assistance? We're here to help!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-card p-8">
              <h2 className="font-heading font-semibold text-2xl text-primary mb-6">
                Send us a Message
              </h2>

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg text-success"
                >
                  ✓ Your message has been sent successfully! We'll get back to you soon.
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Your Name"
                  type="text"
                  placeholder="John Doe"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  prefixIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="9876543210"
                  prefixIcon={<Phone className="w-5 h-5" />}
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Select
                  label="Subject"
                  options={SUBJECTS}
                  error={errors.subject?.message}
                  {...register('subject')}
                />

                <TextArea
                  label="Message"
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  error={errors.message?.message}
                  {...register('message')}
                />

                {Object.keys(errors).length > 0 && (
                  <FormError message="Please fix the errors above" />
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>

          {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Cards */}
              <div className="bg-white rounded-xl shadow-card p-8">
                <h2 className="font-heading font-semibold text-2xl text-primary mb-6">
                  Contact Information
                </h2>

                {loadingContact ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {contactInfo?.email && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary mb-1">Email</h3>
                          <a
                            href={`mailto:${contactInfo.email}`}
                            className="text-gray-600 hover:text-primary transition-colors"
                          >
                            {contactInfo.email}
                          </a>
                        </div>
                      </motion.div>
                    )}

                    {contactInfo?.phone && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary mb-1">Phone</h3>
                          <a
                            href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                            className="text-gray-600 hover:text-primary transition-colors"
                          >
                            {contactInfo.phone}
                          </a>
                        </div>
                      </motion.div>
                    )}

                    {contactInfo?.whatsapp && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary mb-1">WhatsApp</h3>
                          <a
                            href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-primary transition-colors"
                          >
                            {contactInfo.whatsapp}
                          </a>
                        </div>
                      </motion.div>
                    )}

                    {contactInfo?.address && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary mb-1">Address</h3>
                          <p className="text-gray-600 whitespace-pre-line">
                            {contactInfo.address}
                            {contactInfo.location && `\n${contactInfo.location}`}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {contactInfo?.businessHours && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary mb-1">Business Hours</h3>
                          {formatBusinessHours() ? (
                            <p className="text-gray-600 whitespace-pre-line">{formatBusinessHours()}</p>
                          ) : (
                            <p className="text-gray-600">Please contact us for business hours</p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {!contactInfo && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Contact information will be displayed here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Social Media */}
              {contactInfo?.socialMedia && (
                <div className="bg-white rounded-xl shadow-card p-8">
                  <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Follow Us
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {contactInfo.socialMedia.facebook && (
                      <motion.a
                        href={contactInfo.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-500 hover:text-white transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </motion.a>
                    )}
                    {contactInfo.socialMedia.twitter && (
                      <motion.a
                        href={contactInfo.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-blue-400/10 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="w-5 h-5" />
                      </motion.a>
                    )}
                    {contactInfo.socialMedia.linkedin && (
                      <motion.a
                        href={contactInfo.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-5 h-5" />
                      </motion.a>
                    )}
                    {contactInfo.socialMedia.instagram && (
                      <motion.a
                        href={contactInfo.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </motion.a>
                    )}
                    {contactInfo.socialMedia.youtube && (
                      <motion.a
                        href={contactInfo.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        aria-label="YouTube"
                      >
                        <Youtube className="w-5 h-5" />
                      </motion.a>
                    )}
                  </div>
                  {Object.values(contactInfo.socialMedia).every((val) => !val) && (
                    <p className="text-gray-500 text-sm mt-4">Social media links will appear here</p>
                  )}
                </div>
              )}

              {/* Website Link */}
              {contactInfo?.website && (
                <div className="bg-white rounded-xl shadow-card p-8">
                  <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Visit Our Website
                  </h3>
                  <a
                    href={contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-primary transition-colors break-all"
                  >
                    {contactInfo.website}
                  </a>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

