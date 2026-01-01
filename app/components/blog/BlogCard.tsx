'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BlogPost } from '@/app/lib/api/types';
import Badge from '../ui/Badge';
import { Clock, Calendar, UserCircle } from 'lucide-react';
import { format } from 'date-fns';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-lg transition-all h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-accent/20 to-primary/20 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center"
          >
            <span className="text-6xl">📊</span>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-3">
            <Badge variant="info">{post.category}</Badge>
          </div>

          <h3 className="font-heading font-semibold text-xl text-primary mb-3 line-clamp-2">
            {post.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
            {post.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <UserCircle className="w-8 h-8 mr-2 text-accent" />
              <span className="font-medium">{post.author.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

