import { Suspense } from 'react';
import type { Metadata } from 'next';
import StudentProfileClient from '@/components/students/profile/StudentProfileClient';

export const metadata: Metadata = {
  title: 'My Submissions & Verdicts | CodePlatform',
  description: 'View submission history, test case verdicts, execution runtime, and source code logs.',
};

/**
 * Dedicated Student Submissions / History Page (React Server Component)
 */
export default function StudentSubmissionsPage() {
  return (
    <Suspense fallback={null}>
      <StudentProfileClient isOwner={true} defaultTab="submissions" />
    </Suspense>
  );
}

