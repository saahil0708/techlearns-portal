import type { Metadata } from 'next';
import ProblemsDirectoryClient from '@/components/superadmin/problems/ProblemsDirectoryClient';
import { ProblemEntity } from '@/types/problem';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Problem Bank & Testcase Management | CodePlatform Admin',
  description: 'Manage institutional coding problems, test cases, judge runtime constraints, submission logs, and contest question mappings.',
};

/**
 * Problems Directory Page (React Server Component)
 * Dynamically queries live problems from PostgreSQL via NestJS GraphQL API
 */
export default async function ProblemsPage() {
  let problems: ProblemEntity[] = [];

  try {
    const liveData = await apiService.getProblems({ limit: 50 });
    if (liveData?.items && liveData.items.length > 0) {
      problems = liveData.items.map((item: any, idx: number) => ({
        id: item.id,
        code: `PROB-${String(idx + 1).padStart(3, '0')}`,
        slug: item.slug,
        title: item.title,
        category: 'Arrays & Two Pointers',
        difficulty: item.difficulty === 'HARD' ? 'Hard' : item.difficulty === 'MEDIUM' ? 'Medium' : 'Easy',
        acceptanceRate: 65.0,
        totalSubmissions: item._count?.submissions || 0,
        acceptedSubmissions: Math.floor((item._count?.submissions || 0) * 0.65),
        testCasesCount: item._count?.testCases || 0,
        authorName: 'Faculty',
        tags: ['Algorithms', 'Data Structures'],
        status: item.status === 'PUBLISHED' ? 'Published' : 'Draft',
        points: item.difficulty === 'HARD' ? 200 : item.difficulty === 'MEDIUM' ? 120 : 70,
        timeLimitMs: item.timeLimit || 1000,
        memoryLimitMb: item.memoryLimit || 256,
        likes: 0,
        dislikes: 0,
        premium: false,
        companies: [],
        statementMarkdown: item.statement || '',
        sampleTestCases: [],
      }));
    }
  } catch (err) {
    console.error('Failed to fetch live problems from API:', err);
  }

  return <ProblemsDirectoryClient initialProblems={problems} />;
}
