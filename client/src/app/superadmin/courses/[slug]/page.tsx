import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CourseDetailClient from '@/components/superadmin/courses/CourseDetailClient';
import { resolveCourseData } from '@/lib/courses-data';

interface CoursePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await resolveCourseData(resolvedParams.slug);

  if (!course) {
    return {
      title: 'Course Not Found | TechLearns',
    };
  }

  return {
    title: `${course.title} (${course.code}) | TechLearns Courses`,
    description: course.description,
  };
}

export default async function SingleCoursePage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const course = await resolveCourseData(resolvedParams.slug);

  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} role="superadmin" />;
}
