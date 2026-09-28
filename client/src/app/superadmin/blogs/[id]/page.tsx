import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SuperAdminBlogReaderClient from '@/components/superadmin/blogs/SuperAdminBlogReaderClient';
import { apiService } from '@/lib/api-service';
import { INITIAL_BLOG_POSTS, BlogPost } from '@/types/blog';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getBlogData(id: string): Promise<{ blog: BlogPost | null; related: BlogPost[] }> {
  // 1. Try fetching from server via apiService
  try {
    const liveBlog = await apiService.getBlogByIdOrSlug(id);
    if (liveBlog && liveBlog.id) {
      try {
        const allBlogs = await apiService.getBlogs({ category: liveBlog.category, limit: 4 });
        const related = allBlogs.filter((b) => b.id !== liveBlog.id);
        return { blog: liveBlog, related };
      } catch {
        const related = INITIAL_BLOG_POSTS.filter((b) => b.id !== liveBlog.id).slice(0, 3);
        return { blog: liveBlog, related };
      }
    }
  } catch {
    // Fallback to demo/mock data
  }

  // 2. Fallback to INITIAL_BLOG_POSTS
  const fallbackBlog = INITIAL_BLOG_POSTS.find(
    (b) => b.id === id || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id
  );

  if (fallbackBlog) {
    const related = INITIAL_BLOG_POSTS.filter((b) => b.id !== fallbackBlog.id).slice(0, 3);
    return { blog: fallbackBlog, related };
  }

  return { blog: null, related: [] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { blog } = await getBlogData(id);

  if (!blog) {
    return {
      title: 'Article Not Found | CodePlatform Superadmin',
      description: 'The requested technical article could not be found.',
    };
  }

  return {
    title: `${blog.title} (Edit & Read) | CodePlatform Superadmin`,
    description: blog.subtitle || `Manage ${blog.title} by ${blog.author.name} on CodePlatform.`,
  };
}

export default async function SuperAdminBlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { blog, related } = await getBlogData(id);

  if (!blog) {
    notFound();
  }

  return <SuperAdminBlogReaderClient initialBlog={blog} relatedBlogs={related} />;
}
