import type { CSSProperties } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/app/lib/api/types';
import Badge from '../ui/Badge';
import IconTile from '../fv/IconTile';
import { Clock, UserCircle, BarChart3 } from 'lucide-react';
import { fvColorVars, type FvColor } from '@/app/lib/fv/colors';

interface BlogCardProps {
  post: BlogPost;
  /** Category colour of the cover panel (callers pass colorAt(index)). */
  color?: FvColor;
}

// Plain markup (no framer): CSS-only hover lift, switched off under reduced motion.
export default function BlogCard({ post, color = 'blue' }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d focus-visible:ring-offset-2"
    >
      <article className="fv-card flex h-full flex-col overflow-hidden transition duration-200 group-hover:border-[#CFE2F2] group-hover:shadow-fv-raised motion-safe:group-hover:-translate-y-0.5 motion-reduce:transition-none">
        {/* Cover */}
        <div
          style={fvColorVars(color) as CSSProperties}
          className="grid h-36 place-items-center border-b border-fv-line bg-[var(--cp)] md:h-44"
        >
          <IconTile icon={BarChart3} color={color} size="xl" />
        </div>

        {/* Content */}
        <div className="flex flex-grow flex-col p-6">
          <div className="mb-3">
            <Badge variant="info">{post.category}</Badge>
          </div>

          <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-fv-navy">
            {post.title}
          </h3>

          <p className="mb-5 line-clamp-3 flex-grow text-sm leading-relaxed text-fv-slate">
            {post.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between gap-3 border-t border-fv-line pt-4 text-sm text-fv-slate">
            <div className="flex min-w-0 items-center gap-2">
              <UserCircle className="h-7 w-7 flex-none text-fv-blue-d" strokeWidth={1.6} aria-hidden="true" />
              <span className="truncate font-semibold text-fv-navy">{post.author.name}</span>
            </div>
            <span className="flex flex-none items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {post.readTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
