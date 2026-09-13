import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SchoolDetailClient from '@/components/superadmin/schools/SchoolDetailClient';
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
  } catch (e) {
    // fallback
  }

  return {
    title: `${schoolName} (${schoolCode}) | CodePlatform Schools`,
    description: `Manage ${schoolName} secondary education cohorts, student roster, coding labs, and CS mentors.`,
  };
}

export default async function SchoolDetailPage({ params }: Props) {
  const { id } = await params;

  const liveCollege = await apiService.getCollegeById(id);

  if (!liveCollege || !liveCollege.id) {
    notFound();
  }

  const teachers = Array.isArray(liveCollege.memberships)
    ? liveCollege.memberships.filter((m: any) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN').length
    : (liveCollege.facultyCount ?? 0);
  const students = Array.isArray(liveCollege.memberships)
    ? liveCollege.memberships.filter((m: any) => m.role === 'STUDENT').length
    : (liveCollege._count?.memberships ?? 0);

  const school: SchoolEntity = {
    id: liveCollege.id,
    name: liveCollege.name,
    code: liveCollege.code || 'SCH',
    domain: liveCollege.email && liveCollege.email.includes('@') ? liveCollege.email.split('@')[1] : `${liveCollege.code?.toLowerCase() || 'school'}.edu`,
    district: liveCollege.address || 'Regional STEM District',
    curriculum: liveCollege.tier || 'STEM Honors / AP',
    grades: 'Grades 9–12',
    studentsCount: students,
    maxQuota: liveCollege.quota || 100,
    labsCount: liveCollege._count?.courses || 0,
    gradeCohortsCount: liveCollege._count?.batches || 0,
    teachersCount: teachers,
    status: liveCollege.status === 'ACTIVE' ? 'Active' : 'Suspended',
    logoColor: '#2563EB',
  };

  return (
    <SchoolDetailClient
      school={school}
      initialCohorts={[]}
      initialStudents={[]}
      initialLabs={[]}
      initialTeachers={[]}
    />
  );
}

