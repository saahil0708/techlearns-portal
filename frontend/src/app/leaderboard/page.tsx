import { Metadata } from 'next';
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient';

export const metadata: Metadata = {
  title: 'Global & Institute Leaderboard | CodePlatform',
  description: 'Live competitive ratings, institute standings, and global coder rank boards in standard list table format.',
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
