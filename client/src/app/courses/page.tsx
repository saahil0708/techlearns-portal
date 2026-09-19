import { Metadata } from 'next';
import CourseCatalogClient from '@/components/courses/CourseCatalogClient';

export const metadata: Metadata = {
  title: 'Enrolled Courses & Curriculum | CodePlatform',
  description: 'Track enrolled courses, curriculum syllabus modules, and lesson progress in standard list table format.',
};

export default function CoursesPage() {
  return <CourseCatalogClient />;
}
