import type { Metadata } from 'next';
import InstitutionsDirectoryClient, { InstitutionEntity } from '@/components/superadmin/institutions/InstitutionsDirectoryClient';
import { apiService } from '@/lib/api-service';
import { isCollegeOrganization } from '@/utils/organization';

export const metadata: Metadata = {
  title: 'Institutions & University Tenants | CodePlatform Super Admin',
  description: 'Multi-tenant academic organizations, cohort roster isolation & seat quotas management portal.',
};

export const dynamic = 'force-dynamic';

/**
 * Institutions Directory Page (React Server Component)
 * Dynamically queries live institutions from PostgreSQL via NestJS GraphQL API
 */
export default async function InstitutionsPage() {
  let institutions: InstitutionEntity[] = [];

  try {
    const liveData = await apiService.getInstitutions({ limit: 50 });
    if (liveData?.items && liveData.items.length > 0) {
      const institutionItems = liveData.items.filter((item: any) => isCollegeOrganization(item));
      institutions = institutionItems.map((item: any) => {
        const faculty = Array.isArray(item.memberships)
          ? item.memberships.filter((m: any) => m.role === 'FACULTY' || m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN').length
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
          tier: item.tier ?? 'Standard Academic',
          studentsCount: students,
          maxQuota: item.quota ?? item.maxQuota ?? 100,
          coursesCount: item._count?.courses || 0,
          cohortsCount: item._count?.batches || 0,
          facultyCount: faculty,
          status: item.status === 'ACTIVE' ? 'Active' : 'Suspended',
          logoColor: '#3B82F6',
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch live institutions from API:', err);
  }

  return <InstitutionsDirectoryClient initialInstitutions={institutions} />;
}
