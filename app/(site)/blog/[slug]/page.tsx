'use client';

import { use, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { notFound } from 'next/navigation';
import { gsap } from 'gsap';
import Breadcrumb from '@/app/components/common/Breadcrumb';
import Badge from '@/app/components/ui/Badge';
import RelatedPosts from '@/app/components/blog/RelatedPosts';
import IconTile from '@/app/components/fv/IconTile';
import { LIGHT_HERO_BG } from '@/app/components/fv/LightHero';
import { blogService } from '@/app/lib/api';
import { BlogPost } from '@/app/lib/api/types';
import { Clock, Calendar, Share2, Facebook, Twitter, Linkedin, UserCircle, Loader2, Newspaper } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Posts pasted as a full HTML document carry a <head> with their own <style> (body margin, global
 * h1–h3 / p / a / table rules). Injected into the page it restyles the whole site (header,
 * footer) and shifts the page 40px sideways. Render the article markup only — no <head>, <style>
 * or <link> — and theme it with ARTICLE_PROSE below. The post text itself is untouched.
 */
function articleHtml(html: string) {
  return html
    .replace(/<head\b[\s\S]*?<\/head>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<link\b[^>]*>/gi, '');
}

/** Readable article prose: ~70ch measure, fv-slate body, navy headings, themed links/code/quotes/tables. */
const ARTICLE_PROSE = [
  'max-w-[70ch] break-words text-[17px] leading-[1.75] text-fv-slate',
  '[&>*:first-child]:mt-0',
  '[&_h1]:mb-4 [&_h1]:mt-10 [&_h1]:text-[22px] md:[&_h1]:text-[26px] [&_h1]:font-extrabold [&_h1]:leading-tight [&_h1]:tracking-[-0.02em] [&_h1]:text-fv-navy',
  '[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-[21px] md:[&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-fv-navy',
  '[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-lg md:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-fv-navy',
  '[&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-fv-navy',
  '[&_p]:my-4',
  '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-2 [&_li]:pl-1 [&_li::marker]:text-fv-blue-d',
  '[&_strong]:font-semibold [&_strong]:text-fv-navy [&_b]:font-semibold [&_b]:text-fv-navy',
  '[&_a]:font-medium [&_a]:text-fv-blue-d [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-fv-blue-dd',
  '[&_code]:rounded [&_code]:border [&_code]:border-fv-line [&_code]:bg-fv-wash [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.875em] [&_code]:text-fv-navy',
  '[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-fv-line [&_pre]:bg-fv-wash [&_pre]:p-4 [&_pre_code]:border-0 [&_pre_code]:p-0',
  '[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-fv-blue [&_blockquote]:bg-fv-wash [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:italic',
  '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[15px]',
  '[&_td]:border [&_td]:border-fv-line [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-left [&_td]:align-top',
  '[&_th]:border [&_th]:border-fv-line [&_th]:bg-fv-wash [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-fv-navy',
  '[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_hr]:my-8 [&_hr]:border-fv-line',
].join(' ');

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

  // Title entrance: the whole <h1> fades/slides in as one element. Layout effect so the start
  // state is applied before paint (no flash, no reflow — the text stays plain text); skipped under
  // reduced motion; ctx.revert() kills the tween and clears gsap's inline styles on unmount.
  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!post || !title) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(title, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    }, titleRef);
    return () => ctx.revert();
  }, [post, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fv-blue" aria-hidden="true" />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero band — light, decorative (posts have no cover image) */}
      <div className={`relative flex h-48 items-start justify-center overflow-hidden border-b border-fv-line pt-10 md:h-72 md:pt-16 ${LIGHT_HERO_BG}`}>
        <IconTile icon={Newspaper} color="blue" size="xl" solid />
      </div>

      {/* Article Content */}
      <div className="fv-wrap relative z-10 -mt-16 max-w-[960px] pb-14 md:-mt-24 md:pb-[88px]">
        <article className="fv-card p-6 sm:p-8 md:p-12">
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
            aria-label={post.title}
            className="mb-6 break-words text-[30px] font-extrabold leading-[1.12] tracking-[-0.03em] text-fv-navy md:text-[44px]"
          >
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-fv-line pb-6 text-fv-slate">
            <div className="flex items-center gap-3">
              <UserCircle className="h-11 w-11 flex-none text-fv-blue-d" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="font-semibold text-fv-navy">{post.author.name}</p>
                <p className="text-sm">Author</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-fv-blue-d" aria-hidden="true" />
              {format(new Date(post.date), 'MMMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-fv-blue-d" aria-hidden="true" />
              {post.readTime}
            </div>
          </div>

          {/* Content */}
          <div
            className={ARTICLE_PROSE}
            dangerouslySetInnerHTML={{ __html: articleHtml(post.content) }}
          />

          {/* Share Buttons */}
          <div className="mt-12 border-t border-fv-line pt-8">
            <h3 className="mb-4 text-base font-bold text-fv-navy">Share this article</h3>
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Share2, label: 'Share' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <button
                    type="button"
                    key={social.label}
                    className="grid h-11 w-11 place-items-center rounded-lg border border-fv-line bg-white text-fv-navy transition-colors hover:border-[#CFE2F2] hover:bg-fv-blue-50 hover:text-fv-blue-d"
                    aria-label={`Share on ${social.label}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </article>
      </div>

      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />
    </div>
  );
}
