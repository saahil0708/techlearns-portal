import type { Metadata } from 'next';
import BlogsDirectoryClient from '@/components/superadmin/blogs/BlogsDirectoryClient';
import { INITIAL_BLOG_POSTS, BlogPost } from '@/types/blog';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Developer Blogs & Engineering Editorial | TechLearns Admin',
  description: 'Manage technical articles, architecture deep-dives, contest editorials, and collegiate publications.',
};

export const dynamic = 'force-dynamic';

export default async function SuperAdminBlogsPage() {
  let initialBlogs: BlogPost[] = INITIAL_BLOG_POSTS;
  try {
    const live = await apiService.getBlogs();
    if (Array.isArray(live) && live.length > 0) {
      initialBlogs = live;
    }
  } catch (err) {
    console.warn('Superadmin blogs SSR fetch fallback:', err);
  }

  return <BlogsDirectoryClient initialBlogs={initialBlogs} />;
}
