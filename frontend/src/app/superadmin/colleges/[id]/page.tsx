import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CollegeDetailClient, {
  BatchItem,
  StudentRosterItem,
  CourseAssignmentItem,
  FacultyCoordinatorItem,
} from '@/components/superadmin/colleges/CollegeDetailClient';
import { CollegeEntity } from '@/components/superadmin/colleges/CollegesDirectoryClient';

import { apiService } from '@/lib/api-service';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let collegeName = 'College Workspace';
  let collegeCode = 'CAMPUS';
  try {
    const liveData = await apiService.getColleges({ limit: 50 });
    const match = liveData?.items?.find((c: any) => c.id === id);
    if (match) {
      collegeName = match.name;
      collegeCode = match.code;
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${collegeName} (${collegeCode}) | CodePlatform Academic Workspace`,
    description: `Multi-tenant academic workspace for ${collegeName}. Manage cohorts, faculty, and student rosters.`,
  };
}

/**
 * Individual College Academic Portal (React Server Component)
 */
export default async function CollegeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const liveCollege = await apiService.getCollegeById(id);

  if (!liveCollege || !liveCollege.id) {
    notFound();
  }

  const faculty = Array.isArray(liveCollege.memberships)
    ? liveCollege.memberships.filter((m: any) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN').length
    : (liveCollege.facultyCount ?? 0);
  const students = Array.isArray(liveCollege.memberships)
    ? liveCollege.memberships.filter((m: any) => m.role === 'STUDENT').length
    : (liveCollege._count?.memberships ?? 0);

  const college: CollegeEntity = {
    id: liveCollege.id,
    name: liveCollege.name,
    code: liveCollege.code,
    domain: liveCollege.email && liveCollege.email.includes('@') ? liveCollege.email.split('@')[1] : `${liveCollege.code?.toLowerCase()}.edu`,
    region: liveCollege.address || liveCollege.region || 'Asia-Pacific',
    tier: liveCollege.tier || 'Standard Academic',
    studentsCount: students,
    maxQuota: liveCollege.quota || liveCollege.maxQuota || 100,
    coursesCount: liveCollege._count?.courses || 0,
    cohortsCount: liveCollege._count?.batches || 0,
    facultyCount: faculty,
    status: liveCollege.status === 'ACTIVE' ? 'Active' : 'Suspended',
    logoColor: '#3B82F6',
  };

  return (
    <CollegeDetailClient
      college={college}
      initialBatches={[]}
      initialStudents={[]}
      initialCourses={[]}
      initialFaculty={[]}
    />
  );
}
