import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SchoolDetailClient, {
  CodingLabItem,
  GradeCohortItem,
  SchoolStudentItem,
  SchoolTeacherItem,
} from '@/components/superadmin/schools/SchoolDetailClient';
import { SchoolEntity } from '@/components/superadmin/schools/SchoolsDirectoryClient';
import { apiService } from '@/lib/api-service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let schoolName = 'School Organization';
  let schoolCode = 'SCH';
  try {
    const liveData = await apiService.getColleges({ limit: 50 });
    const match = liveData?.items?.find((s: any) => s.id === id);
    if (match) {
      schoolName = match.name;
      schoolCode = match.code;
    }
  } catch {
    // fallback
  }

  return {
    title: `${schoolName} (${schoolCode}) | CodePlatform Schools`,
    description: `Manage ${schoolName} secondary education cohorts, student roster, coding labs, and CS mentors.`,
  };
}

export default async function SchoolDetailPage({ params }: Props) {
  const { id } = await params;

  const [liveCollege, batchesRes, coursesRes, membersRes] = await Promise.all([
    apiService.getCollegeById(id).catch(() => null),
    apiService.getBatchesByCollege(id).catch(() => []),
    apiService.getCourses({ collegeId: id, limit: 50 }).catch(() => null),
    apiService.getCollegeMembers(id).catch(() => []),
  ]);

  if (!liveCollege || !liveCollege.id) {
    notFound();
  }

  const rawMembers: any[] = Array.isArray(membersRes) && membersRes.length > 0
    ? membersRes
    : (Array.isArray(liveCollege.memberships) ? liveCollege.memberships : []);

  const teacherMembers = rawMembers.filter(
    (m: any) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN',
  );
  const studentMembers = rawMembers.filter(
    (m: any) => m.role === 'STUDENT' || !m.role,
  );

  const school: SchoolEntity = {
    id: liveCollege.id,
    name: liveCollege.name,
    code: liveCollege.code || 'SCH',
    domain:
      liveCollege.email && liveCollege.email.includes('@')
        ? liveCollege.email.split('@')[1]
        : `${liveCollege.code?.toLowerCase() || 'school'}.edu`,
    district: liveCollege.address || 'Regional STEM District',
    curriculum: liveCollege.tier || 'STEM Honors / AP',
    grades: 'Grades 9–12',
    studentsCount: studentMembers.length || (liveCollege._count?.memberships ?? 0),
    maxQuota: liveCollege.quota || 100,
    labsCount:
      coursesRes?.meta?.total !== undefined
        ? coursesRes.meta.total
        : coursesRes?.items?.length !== undefined
        ? coursesRes.items.length
        : liveCollege._count?.courses ?? 0,
    gradeCohortsCount: Array.isArray(batchesRes) ? batchesRes.length : (liveCollege._count?.batches ?? 0),
    teachersCount: teacherMembers.length || (liveCollege.facultyCount ?? 0),
    status: liveCollege.status === 'ACTIVE' ? 'Active' : 'Suspended',
    logoColor: '#2563EB',
  };

  const initialCohorts: GradeCohortItem[] = Array.isArray(batchesRes)
    ? batchesRes.map((b: any, idx: number) => ({
        id: b.id,
        name: b.name,
        code: b.code || `SEC-${String(idx + 1).padStart(2, '0')}`,
        gradeLevel: b.gradeLevel || 'Unassigned',
        studentsCount: b._count?.students ?? 0,
        maxCapacity: b.maxCapacity || 30,
        teacherLead: b.teacherLead || b.teacher?.name || 'Unassigned',
        labsAssigned: b._count?.courses ?? b.labsAssigned ?? 0,
        status: b.status === 'COMPLETED' ? 'Completed' : b.status === 'UPCOMING' ? 'Upcoming' : 'Active',
        avgAccuracy: b.avgAccuracy || '—',
      }))
    : [];

  const initialLabs: CodingLabItem[] = coursesRes?.items
    ? coursesRes.items.map((c: any, idx: number) => ({
        id: c.id,
        title: c.title,
        code: `LAB-${String(idx + 1).padStart(3, '0')}`,
        level: c.level || 'Intermediate',
        modulesCount: c.modules?.length ?? c._count?.modules ?? 0,
        enrolledStudents: c._count?.enrollments ?? 0,
        completionRate: c.completionRate || '—',
        instructor: c.createdBy?.name || c.instructor?.name || 'Unassigned',
      }))
    : [];

  const initialTeachers: SchoolTeacherItem[] = teacherMembers.map((m: any) => ({
    id: m.userId || m.user?.id || m.id,
    name: m.user?.name || 'CS Teacher',
    email: m.user?.email || '',
    department: m.user?.department || 'Computer Science & STEM',
    role: m.role === 'COLLEGE_ADMIN' ? 'CS Department Lead' : 'AP CS Instructor',
    cohortsAssigned: Array.isArray(m.user?.cohorts)
      ? m.user.cohorts.map((c: any) => c.name || c)
      : [],
    activeLabs: m.user?.createdCourses?.length ?? 0,
  }));

  const initialStudents: SchoolStudentItem[] = studentMembers.map((m: any, idx: number) => {
    const assignedCohort =
      m.user?.batchEnrollments?.[0]?.batch?.name ||
      m.user?.batchEnrollments?.[0]?.batchName ||
      'Unassigned';
    return {
      id: m.userId || m.user?.id || m.id,
      name: m.user?.name || 'Student Scholar',
      studentId: m.user?.rollNo || '—',
      email: m.user?.email || '',
      cohort: assignedCohort,
      gradeLevel: m.user?.gradeLevel || '—',
      problemsSolved:
        m.user?.submissions?.filter((s: any) => s.verdict === 'ACCEPTED').length ??
        m.user?.problemsSolved ??
        0,
      accuracy: m.user?.accuracy || '—',
      streakDays: m.user?.streakDays ?? 0,
      rank: m.user?.rank ?? idx + 1,
      status: m.user?.status === 'INACTIVE' ? 'Inactive' : 'Active',
    };
  });

  return (
    <SchoolDetailClient
      school={school}
      initialCohorts={initialCohorts}
      initialStudents={initialStudents}
      initialLabs={initialLabs}
      initialTeachers={initialTeachers}
    />
  );
}
