'use client';

import { Edit, Trash2, Calendar, Clock, User } from 'lucide-react';
import { BlogPost } from '@/app/lib/api/types';
import { format } from 'date-fns';

interface BlogCardProps {
  blog: BlogPost;
  onEdit: (blog: BlogPost) => void;
  onDelete: (blogId: string) => void;
}

export default function BlogCard({ blog, onEdit, onDelete }: BlogCardProps) {
  const formattedDate = blog.date ? format(new Date(blog.date), 'MMM dd, yyyy') : 'N/A';

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {blog.featured && (
              <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded">
                Featured
              </span>
            )}
            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs font-medium rounded">
              {blog.category}
            </span>
          </div>
          <h3 className="font-semibold text-white mb-2 line-clamp-2">{blog.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{blog.excerpt}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{blog.author.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{blog.readTime}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Slug: <span className="text-gray-400">{blog.slug}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(blog)}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(blog._id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

