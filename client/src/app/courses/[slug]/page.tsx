import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { resolveCourseData } from '@/lib/courses-data';
import CourseLearningWorkspace from '@/components/courses/CourseLearningWorkspace';
import CourseDetailClient from '@/components/superadmin/courses/CourseDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lesson?: string;
    mode?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await resolveCourseData(slug);

  if (!course) {
    return {
      title: 'Course Not Found | TechLearns',
    };
  }

  return {
    title: `${course.title} (${course.code}) | TechLearns Learning Portal`,
    description: course.description || `Interactive curriculum for ${course.title} with lesson materials, practice coding sandbox, and real-time progress.`,
  };
}

export default async function CourseLearningPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const course = await resolveCourseData(slug);

  if (!course) {
    notFound();
  }

  // If a specific lesson or learning workspace mode is requested, load the interactive workspace
  if (resolvedSearchParams?.lesson || resolvedSearchParams?.mode === 'workspace' || resolvedSearchParams?.mode === 'learn') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">Loading Course Workspace...</div>}>
        <CourseLearningWorkspace course={course} />
      </Suspense>
    );
  }

  // Otherwise, display the rich student course curriculum overview page
  return <CourseDetailClient course={course} role="student" />;
}
