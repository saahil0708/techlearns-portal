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
    const liveData = await apiService.getUsers({ limit: 100 });
    if (liveData?.items && liveData.items.length > 0) {
      users = liveData.items
        .filter((item: any) => item.globalRole && item.globalRole !== 'STUDENT')
        .map((item: any) => {
          const primaryMembership = Array.isArray(item.memberships)
            ? item.memberships.find((m: any) => m?.college?.name)
            : null;
          const collegeName = primaryMembership?.college?.name;
          const userInstitution = item.institution?.trim();

          const institutionType: 'College' | 'School' | 'Independent' = collegeName
            ? 'College'
            : item.institutionType === 'School'
            ? 'School'
            : userInstitution
            ? item.institutionType || 'Independent'
            : 'Independent';

          const institutionName = collegeName || userInstitution || 'Independent';

          const lastLoginDate = item.lastLoginAt
            ? new Date(item.lastLoginAt).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })
            : item.auditLogs?.[0]?.createdAt
            ? new Date(item.auditLogs[0].createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })
            : 'Never';

          const lastLoginIp = item.lastLoginIp || item.auditLogs?.[0]?.ipAddress || '–';

          return {
            id: item.id,
            name: item.name,
            handle: item.email ? item.email.split('@')[0] : 'user',
            email: item.email,
            role: item.globalRole || 'FACULTY',
            institutionType,
            institutionName,
            twoFactorEnabled: Boolean(item.twoFactorEnabled),
            lastLoginAt: lastLoginDate,
            lastLoginIp,
            createdAt: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })
              : 'Recently',
            status: item.status === 'ACTIVE' ? 'Active' : 'Suspended',
            avatarColor: '#7C3AED',
          };
        });
    }
  } catch (err) {
    console.error('Failed to fetch live users from API:', err);
  }

  return <UsersDirectoryClient initialUsers={users} />;
}
