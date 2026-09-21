import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getContestByIdOrSlug } from '@/lib/mock-contests-data';
import { apiService } from '@/lib/api-service';
import { ContestEntity } from '@/types/contest';
import ContestArenaWorkspace from '@/components/contests/ContestArenaWorkspace';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function resolveContest(idOrSlug: string): Promise<ContestEntity | null> {
  try {
    const liveContest = await apiService.getContestById(idOrSlug);
    if (liveContest && liveContest.id) {
      const rawStatus = String(liveContest.status || '').toUpperCase();
      const status: 'LIVE' | 'UPCOMING' | 'PAST' =
        rawStatus === 'RUNNING' || rawStatus === 'ONGOING'
          ? 'LIVE'
          : rawStatus === 'ENDED' || rawStatus === 'COMPLETED'
          ? 'PAST'
          : 'UPCOMING';

      const durationMins = liveContest.startTime && liveContest.endTime
        ? Math.round((new Date(liveContest.endTime).getTime() - new Date(liveContest.startTime).getTime()) / 60000)
        : 120;

      return {
        id: liveContest.id,
        code: liveContest.code || `CNT-${liveContest.id.slice(0, 4).toUpperCase()}`,
        slug: liveContest.slug || idOrSlug,
        title: liveContest.title,
        description: liveContest.description || 'Weekly competitive programming round featuring standard ICPC scoring formats.',
        status,
        scope: liveContest.scope || 'Global',
        scoringFormat: liveContest.scoringFormat || 'ICPC (Penalty Time)',
        startTime: liveContest.startTime || new Date().toISOString(),
        endTime: liveContest.endTime || new Date(Date.now() + 7200000).toISOString(),
        durationMinutes: durationMins,
        problemsCount: liveContest._count?.problems || liveContest.problems?.length || 4,
        registeredParticipants: liveContest._count?.registrations || 240,
        submissionsCount: liveContest._count?.submissions || 0,
        organizer: liveContest.organizer || 'Competitive Programming Council',
        bannerColor: '#2563EB',
        tags: Array.isArray(liveContest.tags) ? liveContest.tags : ['Rated', 'Standard'],
        rated: liveContest.rated !== undefined ? Boolean(liveContest.rated) : true,
      };
    }
  } catch {
    // Fallback to mock
  }

  return getContestByIdOrSlug(idOrSlug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const contest = await resolveContest(id);

  if (!contest) {
    return {
      title: 'Contest Not Found | CodePlatform',
    };
  }

  return {
    title: `${contest.title} | CodePlatform Arena`,
    description: `Participate in ${contest.title} with real-time ICPC scoreboard, problem solver, and judge verdicts.`,
  };
}

export default async function ContestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contest = await resolveContest(id);

  if (!contest) {
    notFound();
  }

  return <ContestArenaWorkspace contest={contest} />;
}
