import { BlogPost } from '@/app/data/blog';

const STORAGE_KEY = 'cleartax_admin_blogs';

export function saveBlog(blog: BlogPost): void {
  const existing = getBlogs();
  const index = existing.findIndex((b) => b.id === blog.id);
  
  if (index >= 0) {
    existing[index] = blog;
  } else {
    existing.push(blog);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getBlogs(): BlogPost[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function deleteBlog(blogId: string): void {
  const existing = getBlogs();
  const filtered = existing.filter((b) => b.id !== blogId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getBlogById(blogId: string): BlogPost | undefined {
  return getBlogs().find((b) => b.id === blogId);
}

