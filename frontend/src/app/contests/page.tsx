import { Metadata } from 'next';
import ContestsArenaClient from '@/components/contests/ContestsArenaClient';

export const metadata: Metadata = {
  title: 'Competitive Contests Arena | CodePlatform',
  description: 'Participate in live and upcoming rated programming contests, collegiate invitationals, and speed runs in list table format.',
};

export default function ContestsPage() {
  return <ContestsArenaClient />;
}
