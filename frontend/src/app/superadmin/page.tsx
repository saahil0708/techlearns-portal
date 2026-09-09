import type { Metadata } from 'next';
import DashboardClientView from '@/components/superadmin/dashboard/DashboardClientView';
import { SubmissionItem } from '@/components/superadmin/shared/LiveSubmissionsFeed';
import { DirectoryEntry } from '@/components/superadmin/shared/PlatformDirectoryTable';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Platform Control Center | CodePlatform Super Admin',
  description: 'Enterprise online learning and competitive programming platform management portal.',
};

/**
 * Super Admin Dashboard (React Server Component)
 * Dynamically queries live platform metrics, submissions, and directories from PostgreSQL via NestJS
 */
export default async function SuperAdminDashboardPage() {
  let liveSubmissions: SubmissionItem[] = [];
  let institutions: DirectoryEntry[] = [];
  let individualStudents: DirectoryEntry[] = [];

  try {
    const [submissionsData, collegesData, usersData] = await Promise.all([
      apiService.getLiveSubmissions(10).catch(() => null),
      apiService.getColleges({ limit: 10 }).catch(() => null),
      apiService.getUsers({ limit: 10 }).catch(() => null),
    ]);

    if (submissionsData && submissionsData.length > 0) {
      liveSubmissions = submissionsData.map((sub: any) => ({
        id: sub.id,
        user: sub.user?.name || sub.user?.email || 'Anonymous',
        institution: 'Academic Campus',
        instType: 'College',
        problem: sub.problem?.title || 'Coding Problem',
        difficulty: 'Medium',
        language: sub.language || 'TypeScript',
        verdict: sub.verdict || sub.status || 'ACCEPTED',
        runtime: sub.runtime ? `${sub.runtime}ms` : '18ms',
        memory: sub.memory ? `${sub.memory}MB` : '16.4MB',
        timeAgo: 'Just now',
      }));
    }

    if (collegesData?.items && collegesData.items.length > 0) {
      institutions = collegesData.items.map((col: any) => ({
        name: col.name,
        type: 'College',
        code: col.code,
        count: `${col._count?.memberships || 0} students`,
        detail: `${col._count?.courses || 0} courses • ${col._count?.batches || 0} cohorts`,
        region: 'Global',
        status: col.status === 'ACTIVE' ? 'Active' : 'Suspended',
      }));
    }

    if (usersData?.items && usersData.items.length > 0) {
      individualStudents = usersData.items
        .filter((u: any) => u.globalRole === 'STUDENT')
        .slice(0, 5)
        .map((u: any) => ({
          name: u.name,
          handle: `@${u.email ? u.email.split('@')[0] : 'student'}`,
          type: 'Individual',
          count: 'Active',
          detail: 'Student Account',
          region: 'Global Learner',
          status: 'Active',
        }));
    }
  } catch (err) {
    console.error('Failed to load dashboard metrics from API:', err);
  }

  return (
    <DashboardClientView
      initialSubmissions={liveSubmissions}
      initialInstitutions={institutions}
      initialIndividualStudents={individualStudents}
    />
  );
}