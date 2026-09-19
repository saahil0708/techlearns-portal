import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProblemBySlug } from '@/lib/mock-problems-data';
import { apiService } from '@/lib/api-service';
import { ProblemDifficulty, ProblemEntity } from '@/types/problem';
import ProblemSolverClient from '@/components/problems/ProblemSolverClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function extractSampleTestCases(liveProblem: any) {
  if (Array.isArray(liveProblem.testCases) && liveProblem.testCases.length > 0) {
    const nonHidden = liveProblem.testCases.filter((tc: any) => !tc.isHidden);
    const chosen = nonHidden.length > 0 ? nonHidden : liveProblem.testCases.slice(0, 3);
    return chosen.map((tc: any) => ({
      input: tc.input,
      output: tc.expectedOutput,
      explanation: tc.explanation,
    }));
  }

  const samples: Array<{ input: string; output: string; explanation?: string }> = [];
  const statement = liveProblem.statement || '';
  const exampleRegex = /(?:Input|input):\s*`?([^\n`]+)`?\s*\n\s*-\s*\**(?:Output|output):\**\s*`?([^\n`]+)`?/gi;
  let match;
  while ((match = exampleRegex.exec(statement)) !== null) {
    samples.push({
      input: match[1].trim(),
      output: match[2].trim(),
    });
  }

  if (samples.length === 0 && liveProblem.inputFormat) {
    samples.push({
      input: liveProblem.inputFormat.trim(),
      output: (liveProblem.outputFormat || '').trim(),
    });
  }

  return samples;
}

async function resolveProblem(slug: string): Promise<ProblemEntity | null> {
  try {
    const liveProblem = await apiService.getProblemByIdOrSlug(slug);
    if (liveProblem && liveProblem.id) {
      const rawDiff = String(liveProblem.difficulty || '').toUpperCase();
      const diff: ProblemDifficulty = rawDiff === 'EASY' ? 'Easy' : rawDiff === 'HARD' ? 'Hard' : 'Medium';
      const subCount = liveProblem._count?.submissions || 0;
      return {
        id: liveProblem.id,
        code: liveProblem.code || `PROB-${liveProblem.id.slice(0, 4).toUpperCase()}`,
        slug: liveProblem.slug || slug,
        title: liveProblem.title,
        category: liveProblem.category || 'Dynamic Programming',
        difficulty: diff,
        acceptanceRate: liveProblem.acceptanceRate || 54.2,
        totalSubmissions: subCount,
        acceptedSubmissions: liveProblem.acceptedSubmissions || Math.round(subCount * 0.54),
        testCasesCount: liveProblem.testCases?.length || liveProblem._count?.testCases || 10,
        authorName: liveProblem.authorName || 'Platform Team',
        tags: Array.isArray(liveProblem.tags) ? liveProblem.tags : ['Algorithms'],
        status: liveProblem.status === 'PUBLISHED' ? 'Published' : 'Draft',
        points: liveProblem.points || (diff === 'Easy' ? 100 : diff === 'Medium' ? 200 : 350),
        timeLimitMs: liveProblem.timeLimit || 2000,
        memoryLimitMb: liveProblem.memoryLimit || 256,
        likes: liveProblem.likes || 120,
        dislikes: liveProblem.dislikes || 4,
        premium: false,
        companies: ['Google', 'Meta', 'Amazon'],
        statementMarkdown: liveProblem.statement || '',
        sampleTestCases: extractSampleTestCases(liveProblem),
      };
    }
  } catch {
    // fallback to mock
  }
  return getProblemBySlug(slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = await resolveProblem(slug);

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
  const problem = await resolveProblem(slug);

  if (!problem) {
    notFound();
  }

  return <ProblemSolverClient problem={problem} />;
}

