import type { Metadata } from 'next';
import CollegesDirectoryClient, { CollegeEntity } from '@/components/superadmin/colleges/CollegesDirectoryClient';
import { apiService } from '@/lib/api-service';
import { isCollegeOrganization } from '@/utils/organization';

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
      const collegeItems = liveData.items.filter((item: any) => isCollegeOrganization(item));
      colleges = collegeItems.map((item: any) => {
        const faculty = Array.isArray(item.memberships)
          ? item.memberships.filter((m: any) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN').length
          : (item.facultyCount ?? 0);
        const students = Array.isArray(item.memberships)
          ? item.memberships.filter((m: any) => m.role === 'STUDENT').length
          : (item._count?.memberships ?? 0);

        return {
          id: item.id,
          name: item.name,
          code: item.code,
          domain: item.email && item.email.includes('@') ? item.email.split('@')[1] : `${item.code.toLowerCase()}.edu`,
          region: item.address || item.region || 'Asia-Pacific',
          tier: item.tier || 'Standard Academic',
          studentsCount: students,
          maxQuota: item.quota || item.maxQuota || 100,
          coursesCount: item._count?.courses || 0,
          cohortsCount: item._count?.batches || 0,
          facultyCount: faculty,
          status: item.status === 'ACTIVE' ? 'Active' : 'Suspended',
          logoColor: '#3B82F6',
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch live colleges from API:', err);
  }

  return <CollegesDirectoryClient initialColleges={colleges} />;
}
