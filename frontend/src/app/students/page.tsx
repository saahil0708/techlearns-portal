import { Suspense } from 'react';
import type { Metadata } from 'next';
import StudentProfileClient from '@/components/students/profile/StudentProfileClient';

export const metadata: Metadata = {
  title: 'Student Profile & Competitive Record | CodePlatform',
  description: 'Manage personal student profile, contest ratings, enrolled courses, and submissions.',
};

/**
 * Root /students Page (React Server Component)
 */
export default function StudentsRootPage() {
  return (
    <Suspense fallback={null}>
      <StudentProfileClient isOwner={true} />
    </Suspense>
  );
}

