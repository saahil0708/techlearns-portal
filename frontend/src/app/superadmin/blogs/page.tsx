import type { Metadata } from 'next';
import BlogsDirectoryClient from '@/components/superadmin/blogs/BlogsDirectoryClient';
import { INITIAL_BLOG_POSTS } from '@/types/blog';

export const metadata: Metadata = {
  title: 'Developer Blogs & Engineering Editorial | CodePlatform Admin',
  description: 'Manage technical articles, architecture deep-dives, contest editorials, and collegiate publications.',
};

export const dynamic = 'force-dynamic';

export default function SuperAdminBlogsPage() {
  return <BlogsDirectoryClient initialBlogs={INITIAL_BLOG_POSTS} />;
}
