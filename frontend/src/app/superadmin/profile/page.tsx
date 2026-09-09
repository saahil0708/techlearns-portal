import type { Metadata } from 'next';
import ProfileClient from '@/components/superadmin/profile/ProfileClient';

export const metadata: Metadata = {
  title: 'Admin Profile | CodePlatform',
  description: 'Super administrator identity, security credentials and account settings.',
};

/**
 * Super Admin Profile Page
 * Dynamically populated from authenticated Redux session & NestJS backend
 */
export default function ProfilePage() {
  return <ProfileClient />;
}
