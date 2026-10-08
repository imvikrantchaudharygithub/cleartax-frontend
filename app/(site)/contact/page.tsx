'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { contactSchema, ContactFormData } from '@/app/lib/schemas/calculatorSchemas';
import { contactService } from '@/app/lib/api';
import { ContactInfo } from '@/app/lib/api/types';
import Input from '@/app/components/fv/Input';
import TextArea from '@/app/components/fv/TextArea';
import Select from '@/app/components/fv/Select';
import Button from '@/app/components/fv/Button';
import FormError from '@/app/components/forms/FormError';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, MessageCircle, Globe, Loader2, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import IconTile from '@/app/components/fv/IconTile';
import Section from '@/app/components/fv/Section';
import { fvColorVars, type FvColor } from '@/app/lib/fv/colors';

const SUBJECTS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'feedback', label: 'Feedback' },
];

/** One contact-information row: tinted icon tile + label + value (theme rule 6). */
function InfoRow({ icon, color, label, children }: { icon: LucideIcon; color: FvColor; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <IconTile icon={icon} color={color} />
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-base font-bold text-fv-navy">{label}</h3>
        {children}
      </div>
    </div>
  );
}

const INFO_LINK = 'break-words font-medium text-fv-blue-d transition-colors hover:text-fv-blue-dd hover:underline underline-offset-4';

/** Social icon button in its category colour (tinted, solid on hover). */
function SocialLink({ href, label, color, children }: { href: string; label: string; color: FvColor; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={fvColorVars(color) as CSSProperties}
      className="grid h-12 w-12 place-items-center rounded-[11px] bg-[var(--cb)] text-[var(--c)] transition duration-150 hover:bg-[var(--c)] hover:text-white motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
    >
      {children}
    </a>
  );
}

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

  const businessHoursRows = useMemo(() => {
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

    const rows = days
      .filter((day) => {
        const dayHours = contactInfo.businessHours[day.key];
        return !dayHours.closed;
      })
      .map((day) => {
        const dayHours = contactInfo.businessHours[day.key];
        return {
          day: day.label,
          range: `${formatTime(dayHours.open)} – ${formatTime(dayHours.close)}`,
        };
      });

    return rows.length > 0 ? rows : null;
  }, [contactInfo?.businessHours]);

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
    <div className="min-h-screen bg-white">
      <PageHero
        icon={MessageSquare}
        title="Get In Touch"
        subtitle="Have a question or need assistance? We're here to help!"
      />
      <Section soft>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Contact Form */}
            <div className="fv-card min-w-0 p-6 sm:p-8 lg:self-start">
              <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-fv-navy">
                Send us a Message
              </h2>

              {isSuccess && (
                <div
                  role="status"
                  className="mb-6 rounded-lg border border-fv-green/30 bg-fv-green-50 p-4 font-medium text-fv-green-d"
                >
                  ✓ Your message has been sent successfully! We&apos;ll get back to you soon.
                </div>
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
                  prefixIcon={<Mail className="w-5 h-5" aria-hidden="true" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="9876543210"
                  prefixIcon={<Phone className="w-5 h-5" aria-hidden="true" />}
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
                  <Send className="w-5 h-5" aria-hidden="true" />
                  Send Message
                </Button>
              </form>
            </div>

          {/* Contact Information */}
            <div className="min-w-0 space-y-6">
              {/* Contact Cards */}
              <div className="fv-card p-6 sm:p-8">
                <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-fv-navy">
                  Contact Information
                </h2>

                {loadingContact ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-fv-blue" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {contactInfo?.email && (
                      <InfoRow icon={Mail} color="blue" label="Email">
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className={INFO_LINK}
                        >
                          {contactInfo.email}
                        </a>
                      </InfoRow>
                    )}

                    {contactInfo?.phone && (
                      <InfoRow icon={Phone} color="green" label="Phone">
                        <a
                          href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                          className={INFO_LINK}
                        >
                          {contactInfo.phone}
                        </a>
                      </InfoRow>
                    )}

                    {contactInfo?.whatsapp && (
                      <InfoRow icon={MessageCircle} color="teal" label="WhatsApp">
                        <a
                          href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={INFO_LINK}
                        >
                          {contactInfo.whatsapp}
                        </a>
                      </InfoRow>
                    )}

                    {contactInfo?.address && (
                      <InfoRow icon={MapPin} color="orange" label="Address">
                        <p className="whitespace-pre-line break-words leading-relaxed text-fv-slate">
                          {contactInfo.address}
                          {contactInfo.location && `\n${contactInfo.location}`}
                        </p>
                      </InfoRow>
                    )}

                    {contactInfo?.businessHours && (
                      <InfoRow icon={Clock} color="purple" label="Business Hours">
                        {businessHoursRows ? (
                          <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
                            {businessHoursRows.map(({ day, range }) => (
                              <Fragment key={day}>
                                <span className="font-medium text-fv-navy">{day}</span>
                                <span className="tabular-nums text-fv-slate">{range}</span>
                              </Fragment>
                            ))}
                          </div>
                        ) : (
                          <p className="text-fv-slate">Please contact us for business hours</p>
                        )}
                      </InfoRow>
                    )}

                    {!contactInfo && (
                      <div className="text-center py-8 text-fv-slate">
                        <p>Contact information will be displayed here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Social Media */}
              {contactInfo?.socialMedia && (
                <div className="fv-card p-6 sm:p-8">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-fv-navy">
                    <Globe className="w-5 h-5 text-fv-blue-d" aria-hidden="true" />
                    Follow Us
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {contactInfo.socialMedia.facebook && (
                      <SocialLink href={contactInfo.socialMedia.facebook} label="Facebook" color="blue">
                        <Facebook className="w-5 h-5" aria-hidden="true" />
                      </SocialLink>
                    )}
                    {contactInfo.socialMedia.twitter && (
                      <SocialLink href={contactInfo.socialMedia.twitter} label="Twitter" color="blue">
                        <Twitter className="w-5 h-5" aria-hidden="true" />
                      </SocialLink>
                    )}
                    {contactInfo.socialMedia.linkedin && (
                      <SocialLink href={contactInfo.socialMedia.linkedin} label="LinkedIn" color="blue">
                        <Linkedin className="w-5 h-5" aria-hidden="true" />
                      </SocialLink>
                    )}
                    {contactInfo.socialMedia.instagram && (
                      <SocialLink href={contactInfo.socialMedia.instagram} label="Instagram" color="pink">
                        <Instagram className="w-5 h-5" aria-hidden="true" />
                      </SocialLink>
                    )}
                    {contactInfo.socialMedia.youtube && (
                      <SocialLink href={contactInfo.socialMedia.youtube} label="YouTube" color="red">
                        <Youtube className="w-5 h-5" aria-hidden="true" />
                      </SocialLink>
                    )}
                  </div>
                  {Object.values(contactInfo.socialMedia).every((val) => !val) && (
                    <p className="text-fv-slate text-sm mt-4">Social media links will appear here</p>
                  )}
                </div>
              )}

              {/* Website Link */}
              {contactInfo?.website && (
                <div className="fv-card p-6 sm:p-8">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-fv-navy">
                    <Globe className="w-5 h-5 text-fv-blue-d" aria-hidden="true" />
                    Visit Our Website
                  </h3>
                  <a
                    href={contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-medium text-fv-blue-d transition-colors hover:text-fv-blue-dd hover:underline underline-offset-4"
                  >
                    {contactInfo.website}
                  </a>
                </div>
              )}
            </div>
        </div>
      </Section>
    </div>
  );
}
