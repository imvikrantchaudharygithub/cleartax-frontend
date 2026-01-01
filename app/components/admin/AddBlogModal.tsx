'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { BlogPost, CreateBlogDto } from '@/app/lib/api/types';
import { blogService } from '@/app/lib/api';

const categories = [
  'Income Tax',
  'GST',
  'Tax Planning',
  'Tax Saving',
  'TDS',
  'Financial Planning',
  'Compliance',
  'Business',
];

const validationSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  category: Yup.string().required('Category is required'),
  excerpt: Yup.string().min(20, 'Excerpt must be at least 20 characters').required('Excerpt is required'),
  content: Yup.string().min(100, 'Content must be at least 100 characters').required('Content is required'),
  authorName: Yup.string().min(2, 'Author name is required').required('Author name is required'),
  date: Yup.string().required('Date is required'),
  readTime: Yup.string().required('Read time is required'),
  image: Yup.string().url('Must be a valid URL').nullable(),
  featured: Yup.boolean(),
});

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBlog?: BlogPost | null;
}

export default function AddBlogModal({ isOpen, onClose, editingBlog }: AddBlogModalProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  if (!isOpen) return null;

  const initialValues = editingBlog ? {
    slug: editingBlog.slug,
    title: editingBlog.title,
    category: editingBlog.category,
    excerpt: editingBlog.excerpt,
    content: editingBlog.content,
    authorName: editingBlog.author.name,
    authorAvatar: editingBlog.author.avatar,
    date: editingBlog.date.split('T')[0],
    readTime: editingBlog.readTime,
    image: editingBlog.image || '',
    featured: editingBlog.featured || false,
  } : {
    slug: '',
    title: '',
    category: '',
    excerpt: '',
    content: '',
    authorName: '',
    authorAvatar: '👤',
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    image: '',
    featured: false,
  };

  const handleSubmit = async (values: any) => {
    try {
      // Generate slug from title
      const slug = values.slug || values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const blogData: CreateBlogDto = {
        slug,
        title: values.title,
        category: values.category,
        excerpt: values.excerpt,
        content: values.content,
        author: {
          name: values.authorName,
          avatar: values.authorAvatar || '👤',
        },
        date: values.date,
        readTime: values.readTime,
        image: values.image || undefined,
        featured: values.featured || false,
      };

      if (editingBlog) {
        await blogService.update(editingBlog._id, blogData);
      } else {
        await blogService.create(blogData);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving blog:', error);
      // Toast notification is handled by apiPost in axios.ts
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              {isPreviewMode ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto">
              {isPreviewMode ? (
                <div className="p-6">
                  <div className="bg-white rounded-lg p-8 text-gray-900">
                    <h1 className="text-3xl font-bold mb-4">{values.title || 'Blog Title'}</h1>
                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                      <span>By {values.authorName || 'Author'}</span>
                      <span>•</span>
                      <span>{values.date || 'Date'}</span>
                      <span>•</span>
                      <span>{values.readTime || 'Read time'}</span>
                    </div>
                    <div className="mb-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {values.category || 'Category'}
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 mb-6">{values.excerpt || 'Excerpt...'}</p>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: values.content || '<p>Content preview...</p>' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title *
                      </label>
                      <Field
                        name="title"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter blog title"
                      />
                      <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-400" />
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category *
                      </label>
                      <Field
                        as="select"
                        name="category"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="category" component="p" className="mt-1 text-sm text-red-400" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date *
                      </label>
                      <Field
                        type="date"
                        name="date"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <ErrorMessage name="date" component="p" className="mt-1 text-sm text-red-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Excerpt *
                    </label>
                    <Field
                      as="textarea"
                      name="excerpt"
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Brief description of the blog post"
                    />
                    <ErrorMessage name="excerpt" component="p" className="mt-1 text-sm text-red-400" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content (HTML) *
                    </label>
                    <Field
                      as="textarea"
                      name="content"
                      rows={12}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                      placeholder="Enter HTML content..."
                    />
                    <ErrorMessage name="content" component="p" className="mt-1 text-sm text-red-400" />
                    <p className="mt-1 text-xs text-gray-500">You can use HTML tags for formatting</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Author Name *
                      </label>
                      <Field
                        name="authorName"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Author name"
                      />
                      <ErrorMessage name="authorName" component="p" className="mt-1 text-sm text-red-400" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Author Avatar (Emoji)
                      </label>
                      <Field
                        name="authorAvatar"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="👤"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Read Time *
                      </label>
                      <Field
                        name="readTime"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="5 min read"
                      />
                      <ErrorMessage name="readTime" component="p" className="mt-1 text-sm text-red-400" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image URL (Optional)
                      </label>
                      <Field
                        name="image"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="/images/blog-image.jpg"
                      />
                      <ErrorMessage name="image" component="p" className="mt-1 text-sm text-red-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Field
                      type="checkbox"
                      name="featured"
                      className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-primary focus:ring-primary"
                    />
                    <label className="text-sm font-medium text-gray-300">
                      Mark as Featured Post
                    </label>
                  </div>
                </div>
              )}

              {/* Footer */}
              {!isPreviewMode && (
                <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-700 bg-gray-900">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingBlog ? 'Update Blog' : 'Create Blog'}
                  </button>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

