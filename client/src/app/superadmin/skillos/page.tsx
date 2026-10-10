import type { Metadata } from 'next';
import SuperadminSkillosClient from '@/components/superadmin/skillos/SuperadminSkillosClient';

export const metadata: Metadata = {
  title: 'SkillOS Assessments & Proctoring | TechLearns Super Admin',
  description: 'Manage institutional proctored exams, live test rooms, anti-cheat policies, and candidate evaluations.',
};

export const dynamic = 'force-dynamic';

export default function SuperadminSkillosPage() {
  return <SuperadminSkillosClient />;
}
