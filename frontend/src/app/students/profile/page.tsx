import type { Metadata } from 'next';
import StudentProfileClient from '@/components/students/profile/StudentProfileClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Student Profile & Competitive Record | CodePlatform',
  description: 'Personal algorithmic statistics, contest rating history, enrolled courses, and submissions record.',
};

/**
 * Authenticated Student Personal Profile Page (React Server Component)
 */
export default function StudentPersonalProfilePage() {
  return <StudentProfileClient isOwner={true} />;
}
