import type { Metadata } from 'next';
import StudentProfileClient from '@/components/students/profile/StudentProfileClient';

export const metadata: Metadata = {
  title: 'Account Settings & Security | CodePlatform',
  description: 'Manage account security, change password, two-factor authentication, and notification preferences.',
};

/**
 * Dedicated Student Account Settings Page (React Server Component)
 */
export default function StudentSettingsPage() {
  return <StudentProfileClient isOwner={true} defaultTab="settings" />;
}
