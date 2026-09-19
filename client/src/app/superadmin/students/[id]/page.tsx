import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StudentDetailClient from '@/components/superadmin/students/StudentDetailClient';
import { StudentDirectoryEntity } from '@/components/superadmin/students/StudentsDirectoryClient';
import { apiService } from '@/lib/api-service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let studentName = 'Student Coder';
  let studentHandle = 'student';
  try {
    const liveData = await apiService.getUsers({ limit: 50 });
    const match = liveData?.items?.find((u: any) => u.id === id);
    if (match) {
      studentName = match.name || match.email;
      studentHandle = match.email ? match.email.split('@')[0] : 'student';
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${studentName} (@${studentHandle}) | Student Profile & Coding Portfolio`,
    description: `Performance metrics, contest rating progression, and solved challenges for ${studentName}.`,
  };
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;

  const liveUser = await apiService.getUserById(id);

  const hasStudentRole =
    liveUser?.globalRole === 'STUDENT' ||
    liveUser?.memberships?.some((m: any) => m.role === 'STUDENT');

  if (!liveUser || !liveUser.id || !hasStudentRole) {
    notFound();
  }

  const primaryMembership = Array.isArray(liveUser.memberships)
    ? liveUser.memberships.find((m: any) => m?.institution?.name || m?.college?.name)
    : null;
  const resolvedInstitution =
    primaryMembership?.institution?.name ||
    primaryMembership?.college?.name ||
    liveUser.institution?.trim() ||
    null;

  const institutionType: 'Institute' | 'Independent' = resolvedInstitution ? 'Institute' : 'Independent';
  const institutionName = resolvedInstitution || 'Self-Enrolled';

  const student: StudentDirectoryEntity = {
    id: liveUser.id,
    name: liveUser.name || 'Student Developer',
    handle: liveUser.email ? liveUser.email.split('@')[0] : 'coder',
    email: liveUser.email,
    studentId: `STU-${liveUser.id.slice(0, 4).toUpperCase()}`,
    institutionType,
    institutionName,
    cohort: liveUser.batchEnrollments?.[0]?.batch?.name || 'Default Cohort',
    problemsSolved: liveUser._count?.submissions || 0,
    solvedEasy: 0,
    solvedMedium: 0,
    solvedHard: 0,
    contestRating: liveUser.contestRating || 1200,
    ratingTier: liveUser.ratingTier || 'Newbie',
    globalRank: 0,
    accuracy: '0.0%',
    streakDays: 0,
    status: liveUser.status === 'ACTIVE' ? 'Active' : 'Inactive',
    avatarColor: '#2563EB',
  };

  return (
    <StudentDetailClient
      student={student}
      initialSubmissions={[]}
      initialCourses={[]}
      initialContests={[]}
      initialTopics={[]}
      initialBadges={[]}
    />
  );
}

