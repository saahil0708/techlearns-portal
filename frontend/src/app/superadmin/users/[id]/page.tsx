import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UserDetailClient from '@/components/superadmin/users/UserDetailClient';
import { UserDirectoryEntity } from '@/components/superadmin/users/UsersDirectoryClient';
import { apiService } from '@/lib/api-service';

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  let userName = 'User Profile';
  let userHandle = 'user';
  try {
    const liveData = await apiService.getUsers({ limit: 50 });
    const match = liveData?.items?.find((u: any) => u.id === id);
    if (match) {
      userName = match.name || match.email;
      userHandle = match.email ? match.email.split('@')[0] : 'user';
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${userName} (@${userHandle}) | User & Security Settings`,
    description: `Account details, RBAC permissions, and active sessions for ${userName}.`,
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;

  const liveUser = await apiService.getUserById(id);

  if (!liveUser || !liveUser.id) {
    notFound();
  }

  const user: UserDirectoryEntity = {
    id: liveUser.id,
    name: liveUser.name || 'Platform User',
    handle: liveUser.email ? liveUser.email.split('@')[0] : 'user',
    email: liveUser.email,
    role: liveUser.globalRole || 'STUDENT',
    institutionType: liveUser.memberships?.[0]?.college?.type === 'SCHOOL' ? 'School' : 'College',
    institutionName: liveUser.memberships?.[0]?.college?.name || 'Global Platform',
    twoFactorEnabled: Boolean(liveUser.twoFactorEnabled),
    lastLoginAt: liveUser.lastLoginAt ? new Date(liveUser.lastLoginAt).toLocaleString() : 'Never',
    lastLoginIp: liveUser.lastLoginIp || 'Not recorded',
    createdAt: liveUser.createdAt ? new Date(liveUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Unknown',
    status: liveUser.status === 'ACTIVE' ? 'Active' : liveUser.status === 'INVITED' ? 'Invited' : 'Suspended',
    avatarColor: '#7C3AED',
  };

  return (
    <UserDetailClient
      user={user}
      initialSecurityLogs={[]}
      initialMemberships={[]}
      initialSessions={[]}
      initialPreferences={[]}
    />
  );
}

