'use client';

import { useState, useEffect } from 'react';
import BlogCard from '@/app/components/blog/BlogCard';
import { blogService } from '@/app/lib/api';
import { BlogPost } from '@/app/lib/api/types';
import Badge from '@/app/components/ui/Badge';
import { ArrowRight, BookOpen, UserCircle, Loader2, Star } from 'lucide-react';
import PageHero from '@/app/components/common/PageHero';
import IconTile from '@/app/components/fv/IconTile';
import { LIGHT_HERO_BG } from '@/app/components/fv/LightHero';
import Section from '@/app/components/fv/Section';
import SectionHead from '@/app/components/fv/SectionHead';
import { colorAt } from '@/app/lib/fv/colors';
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
      <div className="min-h-screen bg-white py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fv-blue" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        icon={BookOpen}
        title="Tax & Compliance Blog"
        subtitle="Expert insights, guides, and updates on tax, GST, and compliance matters"
      />

      {/* Featured Article */}
      {featuredPost && (
        <Section>
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d focus-visible:ring-offset-2"
          >
            <article className="fv-card overflow-hidden transition duration-200 group-hover:border-[#CFE2F2] group-hover:shadow-fv-raised motion-safe:group-hover:-translate-y-0.5 motion-reduce:transition-none">
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className={`relative flex h-56 items-center justify-center border-b border-fv-line md:h-auto md:min-h-[320px] md:border-b-0 md:border-r ${LIGHT_HERO_BG}`}>
                  <IconTile icon={Star} color="blue" size="xl" solid />
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 md:p-10">
                  <Badge variant="info" className="mb-4 w-fit">
                    Featured
                  </Badge>
                  <h2 className="mb-3 text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-fv-navy md:text-[32px]">
                    {featuredPost.title}
                  </h2>
                  <p className="mb-6 text-base leading-relaxed text-fv-slate md:text-lg">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-fv-line pt-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserCircle className="h-11 w-11 flex-none text-fv-blue-d" strokeWidth={1.5} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-semibold text-fv-navy">{featuredPost.author.name}</p>
                        <p className="text-sm text-fv-slate">{featuredPost.readTime}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-fv-blue-d group-hover:text-fv-blue-dd">
                      Read Article
                      <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </Section>
      )}

      {/* Recent Articles Grid — plain markup: StaggerContainer rendered differently on server and
          client under prefers-reduced-motion (hydration error, cards stuck at opacity 0). */}
      <Section soft aria-labelledby="latest-articles">
        <SectionHead id="latest-articles" title="Latest Articles" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post, i) => (
            <BlogCard key={post._id || post.slug} post={post} color={colorAt(i)} />
          ))}
        </div>
      </Section>
    </div>
  );
}
