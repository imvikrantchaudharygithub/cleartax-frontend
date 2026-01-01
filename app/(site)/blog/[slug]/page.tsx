'use client';

import { use, useEffect, useRef, useState } from 'react';
import { notFound } from 'next/navigation';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import Breadcrumb from '@/app/components/common/Breadcrumb';
import Badge from '@/app/components/ui/Badge';
import RelatedPosts from '@/app/components/blog/RelatedPosts';
import { blogService } from '@/app/lib/api';
import { BlogPost } from '@/app/lib/api/types';
import { Clock, Calendar, Share2, Facebook, Twitter, Linkedin, UserCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const [blogData, related] = await Promise.all([
          blogService.getBySlug(slug),
          blogService.getRelated(slug, 3)
        ]);
        
        if (!blogData) {
          notFound();
        }
        
        setPost(blogData);
        setRelatedPosts(related);
      } catch (error) {
        console.error('Error fetching blog:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (post && titleRef.current) {
      const letters = titleRef.current.textContent?.split('') || [];
      titleRef.current.innerHTML = letters
        .map((letter) => `<span class="inline-block">${letter === ' ' ? '&nbsp;' : letter}</span>`)
        .join('');

      gsap.fromTo(
        titleRef.current.querySelectorAll('span'),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.05,
          stagger: 0.02,
          ease: 'power2.out',
        }
      );
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image with Parallax */}
      <div className="relative h-96 bg-gradient-to-br from-accent/30 to-primary/30 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-9xl">📰</span>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <article className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: post.title },
              ]}
            />
          </div>

          {/* Category Badge */}
          <div className="mb-4">
            <Badge variant="info">{post.category}</Badge>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="font-heading font-bold text-4xl md:text-5xl text-primary mb-6"
          >
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 pb-6 mb-8 border-b border-gray-200">
            <div className="flex items-center">
              <UserCircle className="w-12 h-12 mr-3 text-accent" />
              <div>
                <p className="font-semibold text-primary">{post.author.name}</p>
                <p className="text-sm text-gray-500">Author</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              {format(new Date(post.date), 'MMMM dd, yyyy')}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              {post.readTime}
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <style jsx>{`
            .blog-content {
              max-width: 100%;
              color: #374151;
              line-height: 1.75;
            }
            .blog-content h2 {
              font-size: 2rem;
              font-weight: 700;
              color: #1F4E78;
              margin-top: 2.5rem;
              margin-bottom: 1.5rem;
              font-family: var(--font-poppins);
            }
            .blog-content h3 {
              font-size: 1.5rem;
              font-weight: 600;
              color: #1F4E78;
              margin-top: 2rem;
              margin-bottom: 1rem;
              font-family: var(--font-poppins);
            }
            .blog-content p {
              margin-top: 1rem;
              margin-bottom: 1rem;
              font-size: 1.125rem;
            }
            .blog-content ul, .blog-content ol {
              margin-top: 1rem;
              margin-bottom: 1rem;
              padding-left: 1.5rem;
            }
            .blog-content li {
              margin-top: 0.5rem;
              margin-bottom: 0.5rem;
              font-size: 1.125rem;
            }
            .blog-content ul li {
              list-style-type: disc;
            }
            .blog-content ol li {
              list-style-type: decimal;
            }
            .blog-content strong {
              font-weight: 600;
              color: #1F4E78;
            }
            .blog-content a {
              color: #00A3E0;
              text-decoration: underline;
            }
            .blog-content a:hover {
              color: #0082B3;
            }
            .blog-content code {
              background-color: #F3F4F6;
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
              color: #E74C3C;
            }
            .blog-content blockquote {
              border-left: 4px solid #00A3E0;
              padding-left: 1rem;
              margin: 1.5rem 0;
              font-style: italic;
              color: #6B7280;
            }
          `}</style>

          {/* Share Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-primary mb-4">Share this article</h3>
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: 'Facebook', color: 'bg-[#1877f2]' },
                { icon: Twitter, label: 'Twitter', color: 'bg-[#1da1f2]' },
                { icon: Linkedin, label: 'LinkedIn', color: 'bg-[#0077b5]' },
                { icon: Share2, label: 'Share', color: 'bg-gray-600' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <motion.button
                    key={social.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${social.color} text-white p-3 rounded-lg hover:opacity-90 transition-opacity`}
                    aria-label={`Share on ${social.label}`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-16">
          <RelatedPosts posts={relatedPosts} />
        </div>
      </div>
    </div>
  );
}

