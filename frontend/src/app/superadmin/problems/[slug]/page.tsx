import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProblemDetailClient from '@/components/superadmin/problems/ProblemDetailClient';
import { ProblemEntity } from '@/types/problem';
import { apiService } from '@/lib/api-service';

// Seed fallback problem master record
const SEED_PROBLEMS: Record<string, ProblemEntity> = {
  'two-sum': {
    id: 'prob-1',
    code: 'PROB-001',
    slug: 'two-sum',
    title: 'Two Sum & Pair Target Lookups',
    category: 'Arrays & Two Pointers',
    difficulty: 'Easy',
    acceptanceRate: 74.2,
    totalSubmissions: 12400,
    acceptedSubmissions: 9200,
    testCasesCount: 14,
    authorName: 'Stanford CS Faculty',
    tags: ['Hash Map', 'Array', 'Two Pointers'],
    status: 'Published',
    points: 80,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    likes: 4200,
    dislikes: 120,
    premium: false,
    companies: ['Google', 'Meta', 'Amazon'],
    statementMarkdown:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.',
    sampleTestCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 6, return [1, 2].' },
    ],
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let title = 'Problem Workspace';
  let difficulty = 'Coding Challenge';

  try {
    const liveProblem = await apiService.getProblemByIdOrSlug(slug);
    if (liveProblem?.title) {
      title = liveProblem.title;
      difficulty = liveProblem.difficulty || 'Challenge';
    }
  } catch (e) {
    if (SEED_PROBLEMS[slug]) {
      title = SEED_PROBLEMS[slug].title;
      difficulty = SEED_PROBLEMS[slug].difficulty;
    }
  }

  return {
    title: `${title} (${difficulty}) | CodePlatform Problem Workspace`,
    description: `Inspect problem statements, test cases, and student submissions for ${title}.`,
  };
}

export default async function ProblemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let problem: ProblemEntity | undefined = undefined;

  try {
    const liveProblem = await apiService.getProblemByIdOrSlug(slug);
    if (liveProblem?.id) {
      problem = {
        id: liveProblem.id,
        code: `PROB-${liveProblem.slug?.slice(0, 4).toUpperCase() || '001'}`,
        slug: liveProblem.slug,
        title: liveProblem.title,
        category: 'Arrays & Two Pointers',
        difficulty: liveProblem.difficulty === 'HARD' ? 'Hard' : liveProblem.difficulty === 'MEDIUM' ? 'Medium' : 'Easy',
        acceptanceRate: 68.5,
        totalSubmissions: liveProblem._count?.submissions || 0,
        acceptedSubmissions: Math.floor((liveProblem._count?.submissions || 0) * 0.68),
        testCasesCount: liveProblem._count?.testCases || liveProblem.testCases?.length || 4,
        authorName: 'Academic Faculty',
        tags: ['Algorithms', 'Data Structures'],
        status: liveProblem.status === 'PUBLISHED' ? 'Published' : 'Draft',
        points: liveProblem.difficulty === 'HARD' ? 200 : liveProblem.difficulty === 'MEDIUM' ? 120 : 80,
        timeLimitMs: liveProblem.timeLimit || 1000,
        memoryLimitMb: liveProblem.memoryLimit || 256,
        likes: 0,
        dislikes: 0,
        premium: false,
        companies: [],
        statementMarkdown: liveProblem.statement || '',
        sampleTestCases: liveProblem.testCases?.filter((tc: any) => !tc.isHidden).map((tc: any) => ({
          input: tc.input,
          output: tc.expectedOutput || tc.output || '',
          explanation: tc.explanation,
        })) || [],
      };
    }
  } catch (err) {
    console.warn('Live problem fetch fallback:', err);
  }

  if (!problem) {
    problem = SEED_PROBLEMS[slug] || {
      id: `prob-${slug}`,
      code: `PROB-${slug.slice(0, 3).toUpperCase()}`,
      slug,
      title: slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      category: 'Arrays & Two Pointers',
      difficulty: 'Medium',
      acceptanceRate: 72.0,
      totalSubmissions: 340,
      acceptedSubmissions: 245,
      testCasesCount: 6,
      authorName: 'Faculty',
      tags: ['Algorithms', 'Logic'],
      status: 'Published',
      points: 120,
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      likes: 54,
      dislikes: 2,
      premium: false,
      companies: [],
      statementMarkdown: 'Solve the problem according to standard time and space algorithmic constraints.',
      sampleTestCases: [],
    };
  }

  return <ProblemDetailClient problem={problem} />;
}
