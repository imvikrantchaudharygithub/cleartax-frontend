'use client';

import { BlogPost as ApiBlogPost } from '@/app/lib/api/types';
import BlogCard from './BlogCard';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';

interface RelatedPostsProps {
  posts: ApiBlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="font-heading font-bold text-3xl text-primary mb-8">
        Related Articles
      </h2>
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <StaggerItem key={post._id || post.slug}>
            <BlogCard post={post as any} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}

