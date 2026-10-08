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

  const [batchesData] = await Promise.allSettled([
    apiService.getBatchesByInstitution(id),
  ]);

  let initialBatches: any[] = [];
  if (batchesData.status === 'fulfilled' && Array.isArray(batchesData.value)) {
    initialBatches = batchesData.value.map((b: any) => {
      const assignedFaculty = Array.isArray(b.faculty) ? b.faculty : [];
      const leadName = assignedFaculty.length > 0
        ? (assignedFaculty.length === 1 ? (assignedFaculty[0].user?.name || assignedFaculty[0].name) : `${assignedFaculty.length} Mentors`)
        : 'Unassigned';
      return {
        id: b.id,
        name: b.name,
        code: b.code || b.name.substring(0, 8).toUpperCase(),
        studentsCount: b._count?.students ?? b._count?.enrollments ?? b.studentsCount ?? 0,
        maxCapacity: b.maxCapacity || 60,
        facultyLead: leadName,
        faculty: assignedFaculty,
        facultyIds: assignedFaculty.map((f: any) => f.userId || f.user?.id || f.id).filter(Boolean),
        coursesAssigned: b._count?.courses ?? 0,
        year: b.year || '2026',
        status: b.status === 'ACTIVE' ? 'Active' : b.status === 'COMPLETED' ? 'Completed' : 'Upcoming',
        avgAccuracy: '0%',
      };
    });
  }

  const initialStudents: any[] = [];
  const initialFaculty: any[] = [];

  if (Array.isArray(liveInstitution.memberships)) {
    liveInstitution.memberships.forEach((m: any, idx: number) => {
      const u = m.user || {};
      if (m.role === 'STUDENT' || u.globalRole === 'STUDENT') {
        initialStudents.push({
          id: u.id || m.userId,
          name: u.name || 'Student Coder',
          email: u.email || '',
          rollNo: u.rollNo || u.studentId || `STU-${String(idx + 1).padStart(3, '0')}`,
          batch: 'General',
          problemsSolved: u._count?.submissions ?? 0,
          totalSubmissions: u._count?.submissions ?? 0,
          accuracy: '0%',
          activeStreak: 0,
          lastActive: 'Recently',
          status: 'Active',
        });
      } else if (m.role === 'FACULTY' || m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN' || u.globalRole === 'FACULTY') {
        initialFaculty.push({
          id: u.id || m.userId,
          name: u.name || 'Faculty Mentor',
          email: u.email || '',
          department: 'Computer Science & Engineering',
          role: m.role === 'INSTITUTION_ADMIN' ? 'HOD' : 'Professor',
          activeBatches: initialBatches.length,
          problemsCreated: 0,
          joinedDate: new Date(m.createdAt || Date.now()).toLocaleDateString(),
          status: 'Active',
        });
      }
    });
  }

  return (
    <InstitutionDetailClient
      institution={institution}
      initialBatches={initialBatches}
      initialStudents={initialStudents}
      initialCourses={[]}
      initialFaculty={initialFaculty}
    />
  );
}
