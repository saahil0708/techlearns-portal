import type { Metadata } from 'next';
import FacultyProfileClient from '@/components/faculty/profile/FacultyProfileClient';

export const metadata: Metadata = {
  title: 'Faculty Profile & Academic Workspace | CodePlatform',
  description: 'Institutional faculty profile, assigned student cohorts, teaching syllabus, and mentoring activity.',
};

/**
 * College Faculty Profile & Workspace (React Server Component)
 */
export default function FacultyProfilePage() {
  return <FacultyProfileClient />;
}
