import type { Metadata } from 'next';
import FacultyProfileClient from '@/components/faculty/profile/FacultyProfileClient';

export const metadata: Metadata = {
  title: 'Faculty Portal & Academic Workspace | CodePlatform',
  description: 'Manage assigned student cohorts, curriculum, challenge assignments, and track class progress.',
};

/**
 * Faculty Workspace & Dashboard Portal (React Server Component)
 */
export default function FacultyRootPage() {
  return <FacultyProfileClient />;
}
