import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProblemBySlug, MOCK_PROBLEMS } from '@/lib/mock-problems-data';
import ProblemSolverClient from '@/components/problems/ProblemSolverClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    return {
      title: 'Problem Not Found | CodePlatform',
    };
  }

  return {
    title: `${problem.code}: ${problem.title} | CodePlatform`,
    description: `Solve ${problem.title} (${problem.difficulty}) with online Monaco code editor and real-time execution sandbox.`,
  };
}

export default async function ProblemSolverPage({ params }: PageProps) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  return <ProblemSolverClient problem={problem} />;
}
