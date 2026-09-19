import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InstitutionDetailClient from '@/components/superadmin/institutions/InstitutionDetailClient';
import { InstitutionEntity } from '@/components/superadmin/institutions/InstitutionsDirectoryClient';
import { apiService } from '@/lib/api-service';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let institutionName = 'Institution Workspace';
  let institutionCode = 'CAMPUS';
  try {
    const liveData = await apiService.getInstitutions({ limit: 50 });
    const match = liveData?.items?.find((c: any) => c.id === id);
    if (match) {
      institutionName = match.name;
      institutionCode = match.code;
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${institutionName} (${institutionCode}) | CodePlatform Academic Workspace`,
    description: `Multi-tenant academic workspace for ${institutionName}. Manage cohorts, faculty, and student rosters.`,
  };
}

/**
 * Individual Institution Academic Portal (React Server Component)
 */
export default async function InstitutionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const liveInstitution = await apiService.getInstitutionById(id);

  if (!liveInstitution || !liveInstitution.id) {
    notFound();
  }

  const faculty = Array.isArray(liveInstitution.memberships)
    ? liveInstitution.memberships.filter((m: any) => m.role === 'FACULTY' || m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN').length
    : (liveInstitution.facultyCount ?? 0);
  const students = Array.isArray(liveInstitution.memberships)
    ? liveInstitution.memberships.filter((m: any) => m.role === 'STUDENT').length
    : (liveInstitution._count?.memberships ?? 0);

  const institution: InstitutionEntity = {
    id: liveInstitution.id,
    name: liveInstitution.name,
    code: liveInstitution.code,
    domain: liveInstitution.email && liveInstitution.email.includes('@') ? liveInstitution.email.split('@')[1] : `${liveInstitution.code?.toLowerCase()}.edu`,
    region: liveInstitution.address || liveInstitution.region || 'Asia-Pacific',
    tier: liveInstitution.tier || 'Standard Academic',
    studentsCount: students,
    maxQuota: liveInstitution.quota || liveInstitution.maxQuota || 100,
    coursesCount: liveInstitution._count?.courses || 0,
    cohortsCount: liveInstitution._count?.batches || 0,
    facultyCount: faculty,
    status: liveInstitution.status === 'ACTIVE' ? 'Active' : 'Suspended',
    logoColor: '#3B82F6',
  };

  return (
    <InstitutionDetailClient
      institution={institution}
      initialBatches={[]}
      initialStudents={[]}
      initialCourses={[]}
      initialFaculty={[]}
    />
  );
}
