import type { Metadata } from 'next';
import DashboardClientView from '@/components/superadmin/dashboard/DashboardClientView';
import { SubmissionItem } from '@/components/superadmin/shared/LiveSubmissionsFeed';
import { DirectoryEntry } from '@/components/superadmin/shared/PlatformDirectoryTable';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Platform Control Center | CodePlatform Super Admin',
  description: 'Enterprise online learning and competitive programming platform management portal.',
};

export const dynamic = 'force-dynamic';

/**
 * Super Admin Dashboard (React Server Component)
 * Dynamically queries live platform metrics, submissions, and directories from PostgreSQL via NestJS
 */
export default async function SuperAdminDashboardPage() {
  let liveSubmissions: SubmissionItem[] = [];
  let institutions: DirectoryEntry[] = [];

  try {
    const [submissionsData, collegesData] = await Promise.all([
      apiService.getLiveSubmissions(10).catch(() => null),
      apiService.getColleges({ limit: 50 }).catch(() => null),
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
      institutions = collegesData.items.map((col: any) => {
        const studentCount = Array.isArray(col.memberships)
          ? col.memberships.filter((m: any) => m.role === 'STUDENT').length
          : (col._count?.memberships || 0);

        return {
          name: col.name,
          type: 'Institute',
          code: col.code,
          count: `${studentCount} ${studentCount === 1 ? 'student' : 'students'}`,
          detail: `${col._count?.courses || 0} courses • ${col._count?.batches || 0} cohorts`,
          region: col.region || col.location || col.address || 'Asia-Pacific',
          status: col.status === 'ACTIVE' ? 'Active' : 'Suspended',
        };
      });
    }
  } catch (err) {
    console.error('Failed to load dashboard metrics from API:', err);
  }

  return (
    <DashboardClientView
      initialSubmissions={liveSubmissions}
      initialInstitutions={institutions}
    />
  );
}