import type { Metadata } from 'next';
import ContestsDirectoryClient from '@/components/superadmin/contests/ContestsDirectoryClient';
import { ContestEntity } from '@/types/contest';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Competitive Contests & Hackathons | CodePlatform Super Admin',
  description: 'Manage inter-collegiate coding competitions, timed assessments, live leaderboards, and auto-judged tournaments.',
};

/**
 * Contests Directory Page (React Server Component)
 * Dynamically queries live contests from PostgreSQL via NestJS GraphQL API
 */
export default async function ContestsPage() {
  let contests: ContestEntity[] = [];

  try {
    const liveData = await apiService.getContests({ limit: 50 });
    if (liveData?.items && liveData.items.length > 0) {
      contests = liveData.items.map((item: any, idx: number) => ({
        id: item.id,
        code: `CNT-${String(idx + 1).padStart(3, '0')}`,
        slug: item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `contest-${idx + 1}`,
        title: item.title,
        description: item.description || 'Competitive programming tournament.',
        scope: 'Global',
        scoringFormat: 'ICPC (Penalty Time)',
        status: item.status || 'UPCOMING',
        startTime: item.startTime || new Date().toISOString(),
        endTime: item.endTime || new Date(Date.now() + 7200000).toISOString(),
        durationMinutes: 120,
        problemsCount: item._count?.problems || 0,
        registeredParticipants: item._count?.registrations || 0,
        submissionsCount: item._count?.submissions || 0,
        organizer: 'CodePlatform Global',
        bannerColor: '#2563EB',
        tags: ['Competitive', 'Algorithms'],
        rated: true,
      }));
    }
  } catch (err) {
    console.error('Failed to fetch live contests from API:', err);
  }

  return <ContestsDirectoryClient initialContests={contests} />;
}
