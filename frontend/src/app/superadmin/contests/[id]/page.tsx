import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContestDetailClient from '@/components/superadmin/contests/ContestDetailClient';
import { ContestEntity } from '@/types/contest';
import { apiService } from '@/lib/api-service';

// Seed fallback contests record
const SEED_CONTESTS: Record<string, ContestEntity> = {
  'cnt-1': {
    id: 'cnt-1',
    code: 'WGP-142',
    slug: 'weekly-grand-prix-142',
    title: 'Weekly Competitive Grand Prix #142',
    description: 'Premier weekly individual algorithm championship with dynamic penalty score calculation and post-match rating adjustments.',
    startTime: 'Today, 06:00 PM',
    endTime: 'Today, 08:30 PM',
    durationMinutes: 150,
    status: 'LIVE',
    scope: 'Global',
    scoringFormat: 'ICPC (Penalty Time)',
    registeredParticipants: 4820,
    submissionsCount: 12840,
    problemsCount: 4,
    organizer: 'CodePlatform Global League',
    bannerColor: '#2563EB',
    tags: ['Algorithms', 'ICPC', 'Div 1'],
    rated: true,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let title = 'Contest Championship Workspace';
  let code = 'CONTEST';

  try {
    const liveContest = await apiService.getContestById(id);
    if (liveContest?.title) {
      title = liveContest.title;
      code = liveContest.code || 'CNT';
    }
  } catch (e) {
    if (SEED_CONTESTS[id]) {
      title = SEED_CONTESTS[id].title;
      code = SEED_CONTESTS[id].code;
    }
  }

  return {
    title: `${title} (${code}) | CodePlatform Contest Portal`,
    description: `Real-time leaderboard standings, problem set, and submissions for ${title}.`,
  };
}

export default async function ContestDetailPage({ params }: PageProps) {
  const { id } = await params;
  let contest: ContestEntity | undefined = undefined;

  try {
    const liveContest = await apiService.getContestById(id);
    if (liveContest?.id) {
      contest = {
        id: liveContest.id,
        code: `CNT-${liveContest.id.slice(0, 3).toUpperCase()}`,
        slug: liveContest.slug || `contest-${liveContest.id}`,
        title: liveContest.title,
        description: liveContest.description || '',
        startTime: liveContest.startTime ? new Date(liveContest.startTime).toLocaleTimeString() : 'TBD',
        endTime: liveContest.endTime ? new Date(liveContest.endTime).toLocaleTimeString() : 'TBD',
        durationMinutes: 120,
        status: liveContest.status === 'ACTIVE' ? 'LIVE' : liveContest.status === 'COMPLETED' ? 'PAST' : 'UPCOMING',
        scope: 'Global',
        scoringFormat: 'ICPC (Penalty Time)',
        registeredParticipants: liveContest._count?.participants || 240,
        submissionsCount: 1200,
        problemsCount: liveContest._count?.problems || liveContest.problems?.length || 4,
        organizer: 'Platform Academic League',
        bannerColor: '#2563EB',
        tags: ['Algorithms', 'Contest'],
        rated: true,
      };
    }
  } catch (err) {
    console.warn('Live contest fetch fallback:', err);
  }

  if (!contest) {
    contest = SEED_CONTESTS[id] || {
      id,
      code: `CNT-${id.slice(0, 3).toUpperCase()}`,
      slug: `contest-${id}`,
      title: 'Competitive Grand Prix Invitational',
      description: 'Championship algorithm tournament with live test execution and real-time score ranking.',
      startTime: 'Mar 15, 2026 06:00 PM',
      endTime: 'Mar 15, 2026 08:30 PM',
      durationMinutes: 150,
      status: 'UPCOMING',
      scope: 'Global',
      scoringFormat: 'ICPC (Penalty Time)',
      registeredParticipants: 1850,
      submissionsCount: 4200,
      problemsCount: 4,
      organizer: 'CodePlatform Competitive Board',
      bannerColor: '#2563EB',
      tags: ['Competitive', 'Grand Prix'],
      rated: true,
    };
  }

  return <ContestDetailClient contest={contest} />;
}
