import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import BlogsClient from '@/components/students/blogs/BlogsClient';

export const metadata: Metadata = {
  title: 'Student Developer Blogs | Techlearns SkillOS',
  description: 'Technical articles, system architecture breakdowns, contest post-mortems, and engineering blogs.',
};

export default function StudentBlogsPage() {
  return (
    <StudentAppLayout>
      <BlogsClient />
    </StudentAppLayout>
  );
}
