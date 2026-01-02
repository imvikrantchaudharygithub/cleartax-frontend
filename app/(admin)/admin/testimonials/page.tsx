'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Plus, Loader2, X, Edit2, Star, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { testimonialService } from '@/app/lib/api';
import { Testimonial, CreateTestimonialDto } from '@/app/lib/api/types';
import { API_CONFIG } from '@/app/lib/api/config';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import TextArea from '@/app/components/ui/TextArea';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTestimonialDto>({
    id: '',
    companyName: '',
    companyLogo: '',
    testimonial: '',
    personName: '',
    personRole: '',
    personAvatar: '',
    rating: 5,
    featured: false,
    order: 0,
  });
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [personAvatarFile, setPersonAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testimonialService.getAll();
      setTestimonials(data);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials. Please try again.');
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const filteredTestimonials = useMemo(() => {
    if (!searchQuery.trim()) {
      return testimonials;
    }
    const query = searchQuery.toLowerCase();
    return testimonials.filter(
      (testimonial) =>
        testimonial.companyName?.toLowerCase().includes(query) ||
        testimonial.personName?.toLowerCase().includes(query) ||
        testimonial.testimonial?.toLowerCase().includes(query) ||
        testimonial.personRole?.toLowerCase().includes(query)
    );
  }, [testimonials, searchQuery]);

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      await testimonialService.delete(testimonialId);
      setTestimonials(testimonials.filter((t) => t._id !== testimonialId));
      toast.success('Testimonial deleted successfully!');
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      toast.error('Failed to delete testimonial. Please try again.');
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      id: testimonial.id,
      companyName: testimonial.companyName,
      companyLogo: testimonial.companyLogo || '',
      testimonial: testimonial.testimonial,
      personName: testimonial.personName,
      personRole: testimonial.personRole,
      personAvatar: testimonial.personAvatar || '',
      rating: testimonial.rating,
      featured: testimonial.featured || false,
      order: testimonial.order || 0,
    });
    setCompanyLogoFile(null);
    setPersonAvatarFile(null);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTestimonial(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.id ||
      !formData.companyName ||
      !formData.testimonial ||
      !formData.personName ||
      !formData.personRole ||
      !formData.rating
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    try {
      setIsSubmitting(true);

      const hasFileUpload = companyLogoFile || personAvatarFile;
      const hasUrl = formData.companyLogo || formData.personAvatar;

      if (hasFileUpload) {
        // Use FormData for file uploads
        // Note: FormData sends all values as strings, but backend expects proper types
        // The backend should parse these strings, but if validation fails, we'll send as JSON with file URLs
        const formDataToSend = new FormData();
        formDataToSend.append('id', formData.id);
        formDataToSend.append('companyName', formData.companyName);
        formDataToSend.append('testimonial', formData.testimonial);
        formDataToSend.append('personName', formData.personName);
        formDataToSend.append('personRole', formData.personRole);
        // Send rating as string - backend should parse to number
        formDataToSend.append('rating', formData.rating.toString());
        // Send featured as string - backend should parse to boolean
        formDataToSend.append('featured', formData.featured ? 'true' : 'false');
        // Send order as string - backend should parse to number
        formDataToSend.append('order', (formData.order || 0).toString());

        if (formData.companyLogo && !companyLogoFile) {
          formDataToSend.append('companyLogo', formData.companyLogo);
        }
        if (formData.personAvatar && !personAvatarFile) {
          formDataToSend.append('personAvatar', formData.personAvatar);
        }

        if (companyLogoFile) {
          formDataToSend.append('companyLogo', companyLogoFile);
        }
        if (personAvatarFile) {
          formDataToSend.append('personAvatar', personAvatarFile);
        }

        if (editingTestimonial) {
          await testimonialService.update(editingTestimonial._id, formDataToSend);
          toast.success('Testimonial updated successfully!');
        } else {
          await testimonialService.create(formDataToSend);
          toast.success('Testimonial created successfully!');
        }
      } else if (hasUrl || !hasFileUpload) {
        // Use JSON when only URLs are provided or no files
        if (editingTestimonial) {
          await testimonialService.update(editingTestimonial._id, formData);
          toast.success('Testimonial updated successfully!');
        } else {
          await testimonialService.create(formData);
          toast.success('Testimonial created successfully!');
        }
      } else {
        toast.error('Please provide either image URLs or upload files');
        return;
      }

      setIsModalOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (err: any) {
      console.error('Error saving testimonial:', err);
      toast.error(err.message || 'Failed to save testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      companyName: '',
      companyLogo: '',
      testimonial: '',
      personName: '',
      personRole: '',
      personAvatar: '',
      rating: 5,
      featured: false,
      order: 0,
    });
    setCompanyLogoFile(null);
    setPersonAvatarFile(null);
  };

  const handleCompanyLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCompanyLogoFile(e.target.files[0]);
      setFormData({ ...formData, companyLogo: '' }); // Clear URL if file is selected
    }
  };

  const handlePersonAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPersonAvatarFile(e.target.files[0]);
      setFormData({ ...formData, personAvatar: '' }); // Clear URL if file is selected
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Testimonials Management</h1>
          <p className="text-gray-400">Manage customer testimonials and reviews</p>
        </div>
        <Button
          onClick={handleAddNew}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by company name, person name, or testimonial text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.length > 0 ? (
          filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.companyLogo && (
                    <img
                      src={testimonial.companyLogo}
                      alt={testimonial.companyName}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {testimonial.companyName}
                    </h3>
                    {testimonial.featured && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded mt-1 inline-block">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial._id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-300 line-clamp-4 mb-3">{testimonial.testimonial}</p>
                {renderStars(testimonial.rating)}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                {testimonial.personAvatar && (
                  <img
                    src={testimonial.personAvatar}
                    alt={testimonial.personName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                {!testimonial.personAvatar && (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{testimonial.personName}</p>
                  <p className="text-xs text-gray-400">{testimonial.personRole}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  ID: <span className="font-mono">{testimonial.id}</span>
                </p>
                {testimonial.order !== undefined && (
                  <p className="text-xs text-gray-500">Order: {testimonial.order}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">No testimonials found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Testimonial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                  setEditingTestimonial(null);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    ID (unique, lowercase) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                    }
                    placeholder="e.g., verma-associates"
                    required
                    disabled={!!editingTestimonial}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Rating (1-5) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Company name"
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Testimonial Text <span className="text-red-400">*</span>
                </label>
                <TextArea
                  value={formData.testimonial}
                  onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                  placeholder="Testimonial text/quote"
                  rows={4}
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Person Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    placeholder="Person's name"
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Person Role <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.personRole}
                    onChange={(e) => setFormData({ ...formData, personRole: e.target.value })}
                    placeholder="e.g., CEO, Tax Consultant"
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Company Logo URL (or upload file below)
                  </label>
                  <Input
                    type="url"
                    value={formData.companyLogo}
                    onChange={(e) => {
                      setFormData({ ...formData, companyLogo: e.target.value });
                      setCompanyLogoFile(null);
                    }}
                    placeholder="https://example.com/logo.jpg"
                    disabled={!!companyLogoFile}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Person Avatar URL (or upload file below)
                  </label>
                  <Input
                    type="url"
                    value={formData.personAvatar}
                    onChange={(e) => {
                      setFormData({ ...formData, personAvatar: e.target.value });
                      setPersonAvatarFile(null);
                    }}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={!!personAvatarFile}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Or Upload Company Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCompanyLogoFileChange}
                    disabled={!!formData.companyLogo}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
                  />
                  {companyLogoFile && (
                    <p className="mt-2 text-sm text-gray-400">Selected: {companyLogoFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Or Upload Person Avatar
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePersonAvatarFileChange}
                    disabled={!!formData.personAvatar}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
                  />
                  {personAvatarFile && (
                    <p className="mt-2 text-sm text-gray-400">Selected: {personAvatarFile.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-300">Featured Testimonial</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Order (for sorting)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                    setEditingTestimonial(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingTestimonial ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

