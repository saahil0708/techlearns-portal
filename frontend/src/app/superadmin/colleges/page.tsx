import type { Metadata } from 'next';
import CollegesDirectoryClient, { CollegeEntity } from '@/components/superadmin/colleges/CollegesDirectoryClient';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Colleges & University Tenants | CodePlatform Super Admin',
  description: 'Multi-tenant academic organizations, cohort roster isolation & seat quotas management portal.',
};

export const dynamic = 'force-dynamic';

/**
 * Colleges Directory Page (React Server Component)
 * Dynamically queries live colleges from PostgreSQL via NestJS GraphQL API
 */
export default async function CollegesPage() {
  let colleges: CollegeEntity[] = [];

  try {
    const liveData = await apiService.getColleges({ limit: 50 });
    if (liveData?.items && liveData.items.length > 0) {
      colleges = liveData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        domain: item.email && item.email.includes('@') ? item.email.split('@')[1] : `${item.code.toLowerCase()}.edu`,
        region: 'Global',
        tier: 'Enterprise Tier',
        studentsCount: item._count?.memberships || 0,
        maxQuota: 5000,
        coursesCount: item._count?.courses || 0,
        cohortsCount: item._count?.batches || 0,
        facultyCount: 5,
        status: item.status === 'ACTIVE' ? 'Active' : 'Suspended',
        logoColor: '#3B82F6',
      }));
    }
  } catch (err) {
    console.error('Failed to fetch live colleges from API:', err);
  }

  return <CollegesDirectoryClient initialColleges={colleges} />;
}
