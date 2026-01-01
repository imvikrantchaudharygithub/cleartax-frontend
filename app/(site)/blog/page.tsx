'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import StaggerContainer, { StaggerItem } from '@/app/components/animations/StaggerContainer';
import BlogCard from '@/app/components/blog/BlogCard';
import { blogService } from '@/app/lib/api';
import { BlogPost } from '@/app/lib/api/types';
import Badge from '@/app/components/ui/Badge';
import { Clock, BookOpen, UserCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const [featured, recent] = await Promise.all([
          blogService.getFeatured(),
          blogService.getRecent(6)
        ]);
        setFeaturedPost(featured);
        setRecentPosts(recent);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary mb-4">
            Tax & Compliance Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert insights, guides, and updates on tax, GST, and compliance matters
          </p>
        </div>

        {/* Featured Article */}
        {featuredPost && (
            <Link href={`/blog/${featuredPost.slug}`}>
              <motion.article
                whileHover={{ y: -8, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}
                className="bg-white rounded-2xl shadow-card overflow-hidden mb-16"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Image */}
                  <div className="relative h-80 md:h-auto bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="text-9xl"
                    >
                      ⭐
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col justify-center">
                    <Badge variant="info" className="mb-4 w-fit">
                      Featured
                    </Badge>
                    <h2 className="font-heading font-bold text-3xl text-primary mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserCircle className="w-12 h-12 mr-3 text-accent" />
                        <div>
                          <p className="font-semibold text-primary">{featuredPost.author.name}</p>
                          <p className="text-sm text-gray-500">{featuredPost.readTime}</p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="text-accent font-medium"
                      >
                        Read Article →
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.article>
            </Link>
        )}

        {/* Recent Articles Grid */}
        <div className="mb-12">
          <h2 className="font-heading font-bold text-3xl text-primary mb-8">
            Latest Articles
          </h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <StaggerItem key={post._id || post.slug}>
                <BlogCard post={post} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </div>
  );
}

