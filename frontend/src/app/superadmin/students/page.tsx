import type { Metadata } from 'next';
import StudentsDirectoryClient, { StudentDirectoryEntity } from '@/components/superadmin/students/StudentsDirectoryClient';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Students & Competitive Coders | CodePlatform',
  description: 'Global developer leaderboard, collegiate cohorts, K-12 STEM coders & student profiles.',
};

/**
 * Students Directory Page (React Server Component)
 * Dynamically queries live student accounts from PostgreSQL via NestJS GraphQL API
 */
export default async function StudentsPage() {
  let students: StudentDirectoryEntity[] = [];

  try {
    const liveData = await apiService.getUsers({ limit: 50 });
    if (liveData?.items && liveData.items.length > 0) {
      students = liveData.items
        .filter((u: any) => u.globalRole === 'STUDENT' || !u.globalRole)
        .map((u: any, idx: number) => {
          const solved = u.problemsSolved ?? (u._count?.submissions || 0);
          const rating = u.contestRating ?? 1200;
          const tier =
            rating > 2100
              ? 'Master'
              : rating > 1900
              ? 'Candidate Master'
              : rating > 1600
              ? 'Expert'
              : rating > 1400
              ? 'Specialist'
              : solved > 0
              ? 'Pupil'
              : 'Newbie';

          return {
            id: u.id,
            name: u.name || 'Student Coder',
            handle: u.email ? u.email.split('@')[0] : `coder_${idx + 1}`,
            email: u.email,
            studentId: u.studentId || `STU-2026-${String(idx + 1).padStart(3, '0')}`,
            institutionType: (u.memberships?.[0]?.college ? 'College' : 'Independent') as 'College' | 'School' | 'Independent',
            institutionName: u.memberships?.[0]?.college?.name || 'Academic Campus',
            cohort: u.cohort || 'Batch 2026 - CS Alpha',
            problemsSolved: solved,
            solvedEasy: u.solvedEasy ?? Math.floor(solved * 0.5),
            solvedMedium: u.solvedMedium ?? Math.floor(solved * 0.35),
            solvedHard: u.solvedHard ?? Math.floor(solved * 0.15),
            contestRating: rating,
            ratingTier: tier as any,
            globalRank: u.globalRank ?? (solved > 0 ? idx + 1 : 0),
            accuracy: u.accuracy ?? (solved > 0 ? '75%' : '0%'),
            streakDays: u.streakDays ?? 0,
            status: u.status === 'ACTIVE' ? ('Active' as const) : ('Inactive' as const),
            avatarColor: ['#2563EB', '#3B82F6', '#10B981', '#7C3AED', '#DC2626'][idx % 5],
          };
        });
    }
  } catch (err) {
    console.error('Failed to fetch live students from API:', err);
  }

  return <StudentsDirectoryClient initialStudents={students} />;
}
