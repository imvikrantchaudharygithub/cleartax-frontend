'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Phone, MapPin, Clock, Mail, MessageCircle, Globe, Facebook, Twitter, Linkedin, Instagram, Youtube, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactService } from '@/app/lib/api';
import { ContactInfo } from '@/app/lib/api/types';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import TextArea from '@/app/components/ui/TextArea';

export default function AdminContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    location: '',
    website: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
      github: '',
    },
    businessHours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false },
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const data = await contactService.get();
      if (data) {
        // Ensure socialMedia object exists with all fields
        setContactInfo({
          ...data,
          socialMedia: {
            facebook: data.socialMedia?.facebook || '',
            twitter: data.socialMedia?.twitter || '',
            linkedin: data.socialMedia?.linkedin || '',
            instagram: data.socialMedia?.instagram || '',
            youtube: data.socialMedia?.youtube || '',
            github: data.socialMedia?.github || '',
          },
          businessHours: data.businessHours || {
            monday: { open: '', close: '', closed: false },
            tuesday: { open: '', close: '', closed: false },
            wednesday: { open: '', close: '', closed: false },
            thursday: { open: '', close: '', closed: false },
            friday: { open: '', close: '', closed: false },
            saturday: { open: '', close: '', closed: false },
            sunday: { open: '', close: '', closed: false },
          },
        });
      }
    } catch (err) {
      console.error('Error fetching contact info:', err);
      // If API doesn't exist yet, just show empty form
      if (process.env.NODE_ENV === 'development') {
        console.warn('Contact API not available yet');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!contactInfo.phone || !contactInfo.whatsapp || !contactInfo.email || !contactInfo.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate business hours
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    for (const day of days) {
      const dayHours = contactInfo.businessHours[day];
      if (!dayHours.closed && (!dayHours.open || !dayHours.close)) {
        toast.error(`Please provide open and close times for ${day} or mark it as closed`);
        return;
      }
      // Validate time format (HH:mm)
      if (!dayHours.closed) {
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(dayHours.open) || !timeRegex.test(dayHours.close)) {
          toast.error(`Invalid time format for ${day}. Please use HH:mm format (e.g., 09:00)`);
          return;
        }
        // Validate close time is after open time
        const [openHour, openMin] = dayHours.open.split(':').map(Number);
        const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;
        if (closeTime <= openTime) {
          toast.error(`Close time must be after open time for ${day}`);
          return;
        }
      }
    }
    
    try {
      setSaving(true);
      // Prepare data for API - ensure all fields are properly formatted
      const dataToSend: ContactInfo = {
        phone: contactInfo.phone.trim(),
        whatsapp: contactInfo.whatsapp.trim(),
        email: contactInfo.email.trim().toLowerCase(),
        address: contactInfo.address.trim(),
        location: contactInfo.location?.trim() || undefined,
        website: contactInfo.website?.trim() || undefined,
        socialMedia: contactInfo.socialMedia ? {
          facebook: contactInfo.socialMedia.facebook?.trim() || undefined,
          twitter: contactInfo.socialMedia.twitter?.trim() || undefined,
          linkedin: contactInfo.socialMedia.linkedin?.trim() || undefined,
          instagram: contactInfo.socialMedia.instagram?.trim() || undefined,
          youtube: contactInfo.socialMedia.youtube?.trim() || undefined,
          github: contactInfo.socialMedia.github?.trim() || undefined,
        } : undefined,
        businessHours: contactInfo.businessHours,
      };

      // Remove undefined social media fields
      if (dataToSend.socialMedia) {
        Object.keys(dataToSend.socialMedia).forEach((key) => {
          if (!dataToSend.socialMedia![key as keyof typeof dataToSend.socialMedia]) {
            delete dataToSend.socialMedia![key as keyof typeof dataToSend.socialMedia];
          }
        });
        // If all social media fields are empty, set to undefined
        if (Object.keys(dataToSend.socialMedia).length === 0) {
          dataToSend.socialMedia = undefined;
        }
      }

      await contactService.update(dataToSend);
      toast.success('Contact information saved successfully!');
      // Refresh data after save
      await fetchContactInfo();
    } catch (err: any) {
      console.error('Error saving contact info:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save contact information. Please try again.';
      const errors = err?.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        const errorList = errors.map((e: any) => e.message).join(', ');
        toast.error(errorList || errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessHoursChange = (
    day: keyof typeof contactInfo.businessHours,
    field: 'open' | 'close' | 'closed',
    value: string | boolean
  ) => {
    setContactInfo({
      ...contactInfo,
      businessHours: {
        ...contactInfo.businessHours,
        [day]: {
          ...contactInfo.businessHours[day],
          [field]: value,
        },
      },
    });
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Contact Information</h1>
        <p className="text-gray-400">Manage your business contact details displayed on the client side</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Contact Information */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Basic Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <Input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder="+91 1234567890"
                required
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                WhatsApp Number <span className="text-red-400">*</span>
              </label>
              <Input
                type="tel"
                value={contactInfo.whatsapp}
                onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                placeholder="+91 1234567890"
                required
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="contact@cleartax.com"
                required
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website URL
              </label>
              <Input
                type="url"
                value={contactInfo.website || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, website: e.target.value })}
                placeholder="https://www.cleartax.com"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Address & Location */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Address & Location
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Address <span className="text-red-400">*</span>
              </label>
              <TextArea
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                placeholder="123 Business Street, City, State, PIN Code"
                rows={3}
                required
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location (City/Area)
              </label>
              <Input
                type="text"
                value={contactInfo.location || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, location: e.target.value })}
                placeholder="Mumbai, Maharashtra"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Social Media Links
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-500" />
                Facebook URL
              </label>
              <Input
                type="url"
                value={contactInfo.socialMedia?.facebook || ''}
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    socialMedia: {
                      ...contactInfo.socialMedia,
                      facebook: e.target.value,
                    },
                  })
                }
                placeholder="https://www.facebook.com/yourpage"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter/X URL
              </label>
              <Input
                type="url"
                value={contactInfo.socialMedia?.twitter || ''}
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    socialMedia: {
                      ...contactInfo.socialMedia,
                      twitter: e.target.value,
                    },
                  })
                }
                placeholder="https://twitter.com/yourhandle"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600" />
                LinkedIn URL
              </label>
              <Input
                type="url"
                value={contactInfo.socialMedia?.linkedin || ''}
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    socialMedia: {
                      ...contactInfo.socialMedia,
                      linkedin: e.target.value,
                    },
                  })
                }
                placeholder="https://www.linkedin.com/company/yourcompany"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram URL
              </label>
              <Input
                type="url"
                value={contactInfo.socialMedia?.instagram || ''}
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    socialMedia: {
                      ...contactInfo.socialMedia,
                      instagram: e.target.value,
                    },
                  })
                }
                placeholder="https://www.instagram.com/yourhandle"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                YouTube URL
              </label>
              <Input
                type="url"
                value={contactInfo.socialMedia?.youtube || ''}
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    socialMedia: {
                      ...contactInfo.socialMedia,
                      youtube: e.target.value,
                    },
                  })
                }
                placeholder="https://www.youtube.com/@yourchannel"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Github className="w-4 h-4 text-gray-300" />
                GitHub URL
              </label>
              <Input
                type="url"
                value={contactInfo.socialMedia?.github || ''}
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    socialMedia: {
                      ...contactInfo.socialMedia,
                      github: e.target.value,
                    },
                  })
                }
                placeholder="https://github.com/yourusername"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Business Hours
          </h2>
          
          <div className="space-y-4">
            {daysOfWeek.map((day) => {
              const dayData = contactInfo.businessHours[day.key];
              return (
                <div
                  key={day.key}
                  className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700"
                >
                  <div className="w-32">
                    <label className="text-sm font-medium text-gray-300">{day.label}</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dayData.closed}
                      onChange={(e) =>
                        handleBusinessHoursChange(day.key, 'closed', e.target.checked)
                      }
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-400">Closed</span>
                  </div>

                  {!dayData.closed && (
                    <>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Open Time</label>
                        <Input
                          type="time"
                          value={dayData.open}
                          onChange={(e) =>
                            handleBusinessHoursChange(day.key, 'open', e.target.value)
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Close Time</label>
                        <Input
                          type="time"
                          value={dayData.close}
                          onChange={(e) =>
                            handleBusinessHoursChange(day.key, 'close', e.target.value)
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </>
                  )}

                  {dayData.closed && (
                    <div className="flex-1 text-sm text-gray-500 italic">Closed all day</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Contact Information
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

