import { BlogPost as ApiBlogPost } from '@/app/lib/api/types';
import BlogCard from './BlogCard';
import Section from '../fv/Section';
import SectionHead from '../fv/SectionHead';
import { colorAt } from '@/app/lib/fv/colors';

interface RelatedPostsProps {
  posts: ApiBlogPost[];
}

// Plain grid — StaggerContainer rendered differently on server and client under
// prefers-reduced-motion (hydration error, cards stuck at opacity 0).
export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <Section soft aria-labelledby="related-articles">
      <SectionHead id="related-articles" title="Related Articles" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <BlogCard key={post._id || post.slug} post={post} color={colorAt(i)} />
        ))}
      </div>
    </Section>
  );
}
