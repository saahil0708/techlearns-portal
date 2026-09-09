import type { Metadata } from 'next';
import UsersDirectoryClient, { UserDirectoryEntity } from '@/components/superadmin/users/UsersDirectoryClient';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Users & Identity Management | CodePlatform',
  description: 'Role-based access control (RBAC), multi-tenant administration, security audits & authentication directory.',
};

/**
 * Users Directory Page (React Server Component)
 * Dynamically queries live users from PostgreSQL via NestJS GraphQL API
 */
export default async function UsersDirectoryPage() {
  let users: UserDirectoryEntity[] = [];

  try {
    const liveData = await apiService.getUsers({ limit: 50 });
    if (liveData?.items && liveData.items.length > 0) {
      users = liveData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        handle: item.email ? item.email.split('@')[0] : 'user',
        email: item.email,
        role: item.globalRole || 'STUDENT',
        institutionType: 'College',
        institutionName: 'Campus',
        twoFactorEnabled: false,
        lastLoginAt: 'Recently',
        lastLoginIp: '127.0.0.1',
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recently',
        status: item.status === 'ACTIVE' ? 'Active' : 'Suspended',
        avatarColor: '#7C3AED',
      }));
    }
  } catch (err) {
    console.error('Failed to fetch live users from API:', err);
  }

  return <UsersDirectoryClient initialUsers={users} />;
}
