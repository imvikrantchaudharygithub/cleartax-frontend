'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, ChevronDown, ChevronUp, Image as ImageIcon, Plus, X, Home, Sparkles, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { homeInfoService } from '@/app/lib/api';
import { HomeInfo } from '@/app/lib/api/types';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import TextArea from '@/app/components/ui/TextArea';
import Select from '@/app/components/ui/Select';

export default function AdminHomeInfoPage() {
  const [homeInfo, setHomeInfo] = useState<HomeInfo>({
    banner: {
      heading: 'Your Complete Tax & Compliance Solution',
      description: 'Calculate, Comply, and Save with Confidence. Professional tax calculators, compliance dashboard, and expert guidance all in one place.',
      button1Text: 'Request Callback',
      button2Text: 'Connect on WhatsApp',
      checklistItems: ['10M+ Invoices Processed', '50K+ Businesses Trust Us', '100% Accurate Calculations'],
      heroImage: '',
      heroImageAlt: 'Tax Solutions',
    },
    benefits: {
      heading: 'Why Choose ClearTax?',
      subheading: 'All our products are designed to deliver exceptional value',
      items: [
        {
          title: 'Maximum Tax Savings',
          description: 'Businesses save up to 2-7% of their net GST with us every month. Individuals can save up to ₹86,500 by filing their tax returns through our platform.',
          image: '',
          imagePosition: 'right',
          imageAlt: 'Tax Savings',
        },
        {
          title: 'Unparalleled Speed',
          description: 'Experience 3x faster GST filings, 5x faster invoice reconciliation, and 10x faster e-waybill generation. Individuals file their tax returns in under 3 minutes.',
          image: '',
          imagePosition: 'left',
          imageAlt: 'Speed',
        },
        {
          title: 'Accurate Compliance',
          description: 'Our products are designed and tested by in-house tax experts, ensuring every new clause, form, or feature is updated and sent to you over the cloud.',
          image: '',
          imagePosition: 'right',
          imageAlt: 'Compliance',
        },
      ],
    },
    services: {
      heading: 'Professional Services',
      subheading: 'From business registration to tax compliance, we handle all your professional service needs with expert guidance',
      cards: [
        {
          title: 'GST Services',
          description: 'Complete GST registration, filing, and compliance solutions for your business.',
          features: ['GST Registration', 'Return Filing', 'Annual Returns', 'LUT Filing'],
          href: '/services/gst',
          icon: 'Receipt',
          colorGradient: 'from-accent to-primary',
        },
        {
          title: 'Business Registration',
          description: 'Start your business with expert guidance on company formation and registration.',
          features: ['Private Limited', 'LLP Registration', 'OPC Formation', 'Proprietorship'],
          href: '/services/registration',
          icon: 'Building2',
          colorGradient: 'from-primary to-accent',
        },
        {
          title: 'Income Tax Services',
          description: 'Expert income tax filing and compliance for individuals and businesses.',
          features: ['ITR Filing', 'TDS Returns', 'Tax Planning', 'Notice Handling'],
          href: '/services/income-tax',
          icon: 'Calculator',
          colorGradient: 'from-success to-primary',
        },
        {
          title: 'Trademark & IP',
          description: 'Protect your brand with trademark registration and IP services.',
          features: ['Trademark Registration', 'Copyright', 'Patent Filing', 'Design Registration'],
          href: '/services/trademarks',
          icon: 'Award',
          colorGradient: 'from-warning to-accent',
        },
      ],
      ctaButtonText: 'View All Services',
      ctaButtonLink: '/services',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    banner: true,
    benefits: false,
    services: false,
  });

  // File upload states
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [benefitImageFiles, setBenefitImageFiles] = useState<(File | null)[]>([null, null, null]);

  useEffect(() => {
    fetchHomeInfo();
  }, []);

  const fetchHomeInfo = async () => {
    try {
      setLoading(true);
      const data = await homeInfoService.get();
      if (data) {
        setHomeInfo(data);
      }
    } catch (err) {
      console.error('Error fetching home info:', err);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Home Info API not available yet');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBannerChange = (field: keyof HomeInfo['banner'], value: any) => {
    setHomeInfo((prev) => ({
      ...prev,
      banner: { ...prev.banner, [field]: value },
    }));
  };

  const handleChecklistItemChange = (index: number, value: string) => {
    const newItems = [...homeInfo.banner.checklistItems];
    newItems[index] = value;
    handleBannerChange('checklistItems', newItems);
  };

  const handleBenefitChange = (index: number, field: keyof HomeInfo['benefits']['items'][0], value: any) => {
    const newItems = [...homeInfo.benefits.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setHomeInfo((prev) => ({
      ...prev,
      benefits: { ...prev.benefits, items: newItems },
    }));
  };

  const handleServiceCardChange = (index: number, field: keyof HomeInfo['services']['cards'][0], value: any) => {
    const newCards = [...homeInfo.services.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setHomeInfo((prev) => ({
      ...prev,
      services: { ...prev.services, cards: newCards },
    }));
  };

  const handleServiceFeatureChange = (cardIndex: number, featureIndex: number, value: string) => {
    const newCards = [...homeInfo.services.cards];
    newCards[cardIndex].features[featureIndex] = value;
    setHomeInfo((prev) => ({
      ...prev,
      services: { ...prev.services, cards: newCards },
    }));
  };

  const addServiceFeature = (cardIndex: number) => {
    const newCards = [...homeInfo.services.cards];
    newCards[cardIndex].features.push('');
    setHomeInfo((prev) => ({
      ...prev,
      services: { ...prev.services, cards: newCards },
    }));
  };

  const removeServiceFeature = (cardIndex: number, featureIndex: number) => {
    const newCards = [...homeInfo.services.cards];
    newCards[cardIndex].features.splice(featureIndex, 1);
    setHomeInfo((prev) => ({
      ...prev,
      services: { ...prev.services, cards: newCards },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!homeInfo.banner.heading || !homeInfo.banner.description) {
      toast.error('Please fill in all required banner fields');
      return;
    }

    if (homeInfo.banner.checklistItems.length !== 3 || homeInfo.banner.checklistItems.some((item) => !item.trim())) {
      toast.error('Please provide exactly 3 checklist items');
      return;
    }

    if (!homeInfo.benefits.heading || !homeInfo.benefits.subheading) {
      toast.error('Please fill in all required benefits section fields');
      return;
    }

    if (homeInfo.benefits.items.length !== 3) {
      toast.error('Please provide exactly 3 benefit items');
      return;
    }

    if (!homeInfo.services.heading || !homeInfo.services.subheading) {
      toast.error('Please fill in all required services section fields');
      return;
    }

    if (homeInfo.services.cards.length !== 4) {
      toast.error('Please provide exactly 4 service cards');
      return;
    }

    try {
      setSaving(true);

      const hasFileUpload = heroImageFile || benefitImageFiles.some((file) => file !== null);

      if (hasFileUpload) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();

        // Banner data
        formDataToSend.append('banner[heading]', homeInfo.banner.heading);
        formDataToSend.append('banner[description]', homeInfo.banner.description);
        formDataToSend.append('banner[button1Text]', homeInfo.banner.button1Text);
        formDataToSend.append('banner[button2Text]', homeInfo.banner.button2Text);
        homeInfo.banner.checklistItems.forEach((item, index) => {
          formDataToSend.append(`banner[checklistItems][${index}]`, item);
        });
        if (homeInfo.banner.heroImage && !heroImageFile) {
          formDataToSend.append('banner[heroImage]', homeInfo.banner.heroImage);
        }
        if (homeInfo.banner.heroImageAlt) {
          formDataToSend.append('banner[heroImageAlt]', homeInfo.banner.heroImageAlt);
        }
        if (heroImageFile) {
          formDataToSend.append('banner[heroImageFile]', heroImageFile);
        }

        // Benefits data
        formDataToSend.append('benefits[heading]', homeInfo.benefits.heading);
        formDataToSend.append('benefits[subheading]', homeInfo.benefits.subheading);
        homeInfo.benefits.items.forEach((item, index) => {
          formDataToSend.append(`benefits[items][${index}][title]`, item.title);
          formDataToSend.append(`benefits[items][${index}][description]`, item.description);
          formDataToSend.append(`benefits[items][${index}][imagePosition]`, item.imagePosition);
          if (item.image && !benefitImageFiles[index]) {
            formDataToSend.append(`benefits[items][${index}][image]`, item.image);
          }
          if (item.imageAlt) {
            formDataToSend.append(`benefits[items][${index}][imageAlt]`, item.imageAlt);
          }
          if (benefitImageFiles[index]) {
            formDataToSend.append(`benefits[items][${index}][imageFile]`, benefitImageFiles[index]!);
          }
        });

        // Services data
        formDataToSend.append('services[heading]', homeInfo.services.heading);
        formDataToSend.append('services[subheading]', homeInfo.services.subheading);
        formDataToSend.append('services[ctaButtonText]', homeInfo.services.ctaButtonText);
        formDataToSend.append('services[ctaButtonLink]', homeInfo.services.ctaButtonLink);
        homeInfo.services.cards.forEach((card, index) => {
          formDataToSend.append(`services[cards][${index}][title]`, card.title);
          formDataToSend.append(`services[cards][${index}][description]`, card.description);
          formDataToSend.append(`services[cards][${index}][href]`, card.href);
          formDataToSend.append(`services[cards][${index}][icon]`, card.icon);
          formDataToSend.append(`services[cards][${index}][colorGradient]`, card.colorGradient);
          card.features.forEach((feature, featureIndex) => {
            formDataToSend.append(`services[cards][${index}][features][${featureIndex}]`, feature);
          });
        });

        await homeInfoService.update(formDataToSend);
      } else {
        // Use JSON if no file uploads
        await homeInfoService.update(homeInfo);
      }

      toast.success('Home info updated successfully!');
      setHeroImageFile(null);
      setBenefitImageFiles([null, null, null]);
      fetchHomeInfo(); // Refresh to get updated image URLs
    } catch (err: any) {
      console.error('Error updating home info:', err);
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || 'Failed to update home info. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const iconOptions = [
    { value: 'Receipt', label: 'Receipt' },
    { value: 'Building2', label: 'Building' },
    { value: 'Calculator', label: 'Calculator' },
    { value: 'Award', label: 'Award' },
  ];

  const colorGradientOptions = [
    { value: 'from-accent to-primary', label: 'Accent to Primary' },
    { value: 'from-primary to-accent', label: 'Primary to Accent' },
    { value: 'from-success to-primary', label: 'Success to Primary' },
    { value: 'from-warning to-accent', label: 'Warning to Accent' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Home Page Content</h1>
        <p className="text-gray-400">Manage the content displayed on your homepage</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <button
            type="button"
            onClick={() => toggleSection('banner')}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Banner Section
            </h2>
            {expandedSections.banner ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.banner && (
            <div className="px-6 pb-6 space-y-6">
              <Input
                label="Main Heading"
                value={homeInfo.banner.heading}
                onChange={(e) => handleBannerChange('heading', e.target.value)}
                required
                className="bg-gray-900 border-gray-700 text-white"
              />

              <TextArea
                label="Description"
                value={homeInfo.banner.description}
                onChange={(e) => handleBannerChange('description', e.target.value)}
                rows={3}
                required
                className="bg-gray-900 border-gray-700 text-white"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Button 1 Text"
                  value={homeInfo.banner.button1Text}
                  onChange={(e) => handleBannerChange('button1Text', e.target.value)}
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  label="Button 2 Text"
                  value={homeInfo.banner.button2Text}
                  onChange={(e) => handleBannerChange('button2Text', e.target.value)}
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Checklist Items (3 items required)
                </label>
                {homeInfo.banner.checklistItems.map((item, index) => (
                  <div key={index} className="mb-3">
                    <Input
                      value={item}
                      onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                      placeholder={`Checklist item ${index + 1}`}
                      required
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hero Image</label>
                <div className="space-y-3">
                  {homeInfo.banner.heroImage && !heroImageFile && (
                    <div className="relative">
                      <img
                        src={homeInfo.banner.heroImage}
                        alt={homeInfo.banner.heroImageAlt || 'Hero'}
                        className="w-full h-48 object-cover rounded-lg border border-gray-700"
                      />
                    </div>
                  )}
                  {heroImageFile && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(heroImageFile)}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-700"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        <span>{heroImageFile ? 'Change Image' : 'Upload Image'}</span>
                      </div>
                    </label>
                    {heroImageFile && (
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        onClick={() => setHeroImageFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    label="Image Alt Text"
                    value={homeInfo.banner.heroImageAlt || ''}
                    onChange={(e) => handleBannerChange('heroImageAlt', e.target.value)}
                    placeholder="Hero image description"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <button
            type="button"
            onClick={() => toggleSection('benefits')}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Why Choose ClearTax? Section
            </h2>
            {expandedSections.benefits ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.benefits && (
            <div className="px-6 pb-6 space-y-6">
              <Input
                label="Section Heading"
                value={homeInfo.benefits.heading}
                onChange={(e) =>
                  setHomeInfo((prev) => ({
                    ...prev,
                    benefits: { ...prev.benefits, heading: e.target.value },
                  }))
                }
                required
                className="bg-gray-900 border-gray-700 text-white"
              />

              <TextArea
                label="Section Subheading"
                value={homeInfo.benefits.subheading}
                onChange={(e) =>
                  setHomeInfo((prev) => ({
                    ...prev,
                    benefits: { ...prev.benefits, subheading: e.target.value },
                  }))
                }
                rows={2}
                required
                className="bg-gray-900 border-gray-700 text-white"
              />

              {homeInfo.benefits.items.map((item, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Benefit Item {index + 1}</h3>
                  <div className="space-y-4">
                    <Input
                      label="Title"
                      value={item.title}
                      onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />

                    <TextArea
                      label="Description"
                      value={item.description}
                      onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                      rows={3}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />

                    <Select
                      label="Image Position"
                      value={item.imagePosition}
                      onChange={(e) => handleBenefitChange(index, 'imagePosition', e.target.value as 'left' | 'right')}
                      options={[
                        { value: 'left', label: 'Left' },
                        { value: 'right', label: 'Right' },
                      ]}
                      className="bg-gray-800 border-gray-600 text-white"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                      <div className="space-y-3">
                        {item.image && !benefitImageFiles[index] && (
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.imageAlt || `Benefit ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-600"
                            />
                          </div>
                        )}
                        {benefitImageFiles[index] && (
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(benefitImageFiles[index]!)}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border border-gray-600"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const newFiles = [...benefitImageFiles];
                                newFiles[index] = e.target.files?.[0] || null;
                                setBenefitImageFiles(newFiles);
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                              <ImageIcon className="w-4 h-4" />
                              <span>{benefitImageFiles[index] ? 'Change Image' : 'Upload Image'}</span>
                            </div>
                          </label>
                          {benefitImageFiles[index] && (
                            <Button
                              type="button"
                              variant="tertiary"
                              size="sm"
                              onClick={() => {
                                const newFiles = [...benefitImageFiles];
                                newFiles[index] = null;
                                setBenefitImageFiles(newFiles);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Image Alt Text"
                      value={item.imageAlt || ''}
                      onChange={(e) => handleBenefitChange(index, 'imageAlt', e.target.value)}
                      placeholder="Image description"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Services Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <button
            type="button"
            onClick={() => toggleSection('services')}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Professional Services Section
            </h2>
            {expandedSections.services ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.services && (
            <div className="px-6 pb-6 space-y-6">
              <Input
                label="Section Heading"
                value={homeInfo.services.heading}
                onChange={(e) =>
                  setHomeInfo((prev) => ({
                    ...prev,
                    services: { ...prev.services, heading: e.target.value },
                  }))
                }
                required
                className="bg-gray-900 border-gray-700 text-white"
              />

              <TextArea
                label="Section Subheading"
                value={homeInfo.services.subheading}
                onChange={(e) =>
                  setHomeInfo((prev) => ({
                    ...prev,
                    services: { ...prev.services, subheading: e.target.value },
                  }))
                }
                rows={2}
                required
                className="bg-gray-900 border-gray-700 text-white"
              />

              {homeInfo.services.cards.map((card, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Service Card {index + 1}</h3>
                  <div className="space-y-4">
                    <Input
                      label="Title"
                      value={card.title}
                      onChange={(e) => handleServiceCardChange(index, 'title', e.target.value)}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />

                    <TextArea
                      label="Description"
                      value={card.description}
                      onChange={(e) => handleServiceCardChange(index, 'description', e.target.value)}
                      rows={2}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Link (href)"
                        value={card.href}
                        onChange={(e) => handleServiceCardChange(index, 'href', e.target.value)}
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />

                      <Select
                        label="Icon"
                        value={card.icon}
                        onChange={(e) => handleServiceCardChange(index, 'icon', e.target.value)}
                        options={iconOptions}
                        className="bg-gray-800 border-gray-600 text-white"
                      />

                      <Select
                        label="Color Gradient"
                        value={card.colorGradient}
                        onChange={(e) => handleServiceCardChange(index, 'colorGradient', e.target.value)}
                        options={colorGradientOptions}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Features
                        <Button
                          type="button"
                          variant="tertiary"
                          size="sm"
                          onClick={() => addServiceFeature(index)}
                          className="ml-2"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Feature
                        </Button>
                      </label>
                      {card.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 mb-2">
                          <Input
                            value={feature}
                            onChange={(e) => handleServiceFeatureChange(index, featureIndex, e.target.value)}
                            placeholder={`Feature ${featureIndex + 1}`}
                            className="flex-1 bg-gray-800 border-gray-600 text-white"
                          />
                          <Button
                            type="button"
                            variant="tertiary"
                            size="sm"
                            onClick={() => removeServiceFeature(index, featureIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="CTA Button Text"
                  value={homeInfo.services.ctaButtonText}
                  onChange={(e) =>
                    setHomeInfo((prev) => ({
                      ...prev,
                      services: { ...prev.services, ctaButtonText: e.target.value },
                    }))
                  }
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Input
                  label="CTA Button Link"
                  value={homeInfo.services.ctaButtonLink}
                  onChange={(e) =>
                    setHomeInfo((prev) => ({
                      ...prev,
                      services: { ...prev.services, ctaButtonLink: e.target.value },
                    }))
                  }
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={saving}>
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
