import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import BlogReaderClient from '@/components/students/blogs/BlogReaderClient';
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
      // Fetch related blogs in same category or latest
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
      title: 'Article Not Found | Techlearns SkillOS',
      description: 'The requested technical article could not be found.',
    };
  }

  return {
    title: `${blog.title} | Techlearns Developer Blogs`,
    description: blog.subtitle || `Read ${blog.title} by ${blog.author.name} on Techlearns.`,
    openGraph: {
      title: blog.title,
      description: blog.subtitle,
      images: blog.coverImage ? [blog.coverImage] : undefined,
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [blog.author.name],
      tags: blog.tags,
    },
  };
}

export default async function StudentBlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { blog, related } = await getBlogData(id);

  if (!blog) {
    notFound();
  }

  return (
    <StudentAppLayout>
      <BlogReaderClient initialBlog={blog} relatedBlogs={related} />
    </StudentAppLayout>
  );
}
