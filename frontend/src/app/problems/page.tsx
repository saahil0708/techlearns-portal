import { Metadata } from 'next';
import ProblemArchiveClient from '@/components/problems/ProblemArchiveClient';

export const metadata: Metadata = {
  title: 'Problem Archive & Solves | CodePlatform',
  description: 'Explore and solve algorithmic challenges across Dynamic Programming, Graph Theory, Trees, and Data Structures in standard list table format.',
};

export default function ProblemsPage() {
  return <ProblemArchiveClient />;
}
