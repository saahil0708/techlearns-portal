import type { Metadata } from 'next';
import ProblemsDirectoryClient from '@/components/superadmin/problems/ProblemsDirectoryClient';
import { ProblemEntity } from '@/types/problem';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Problem Bank & Testcase Management | TechLearns Admin',
  description: 'Manage institutional coding problems, test cases, judge runtime constraints, submission logs, and contest question mappings.',
};

export const dynamic = 'force-dynamic';

/**
 * Problems Directory Page (React Server Component)
 * Dynamically queries live problems from PostgreSQL via NestJS GraphQL API
 */
export default async function ProblemsPage() {
  let problems: ProblemEntity[] = [];

  try {
    const liveData = await apiService.getProblems({ limit: 50 });
    if (liveData?.items && liveData.items.length > 0) {
      problems = liveData.items.map((item: any, idx: number) => {
        const titleLower = String(item.title || '').toLowerCase();
        const rawTags: string[] = Array.isArray(item.tags) ? item.tags : [];
        let category: any = item.category || 'Arrays & Two Pointers';
        let tags = rawTags.length > 0 ? rawTags : ['Algorithms', 'Data Structures'];

        if (!item.category) {
          if (titleLower.includes('even') || titleLower.includes('odd') || titleLower.includes('math') || titleLower.includes('prime')) {
            category = 'Math & Number Theory';
            tags = rawTags.length > 0 ? rawTags : ['Math', 'Number Theory', 'Conditionals'];
          } else if (titleLower.includes('coin') || titleLower.includes('knapsack') || titleLower.includes('subsequence')) {
            category = 'Dynamic Programming';
            tags = rawTags.length > 0 ? rawTags : ['Dynamic Programming', 'Optimization'];
          } else if (titleLower.includes('tree') || titleLower.includes('bst')) {
            category = 'Trees & Binary Search Trees';
            tags = rawTags.length > 0 ? rawTags : ['Trees', 'Binary Search Tree'];
          } else if (titleLower.includes('graph') || titleLower.includes('bfs') || titleLower.includes('dfs')) {
            category = 'Graph Theory & BFS/DFS';
            tags = rawTags.length > 0 ? rawTags : ['Graph Theory', 'BFS/DFS'];
          } else if (titleLower.includes('string') || titleLower.includes('palindrome') || titleLower.includes('anagram')) {
            category = 'Strings & Tries';
            tags = rawTags.length > 0 ? rawTags : ['Strings', 'Parsing'];
          }
        }

        const diff = item.difficulty === 'HARD' ? 'Hard' : item.difficulty === 'MEDIUM' ? 'Medium' : 'Easy';
        const totalSubmissions = item.totalSubmissions ?? item._count?.submissions ?? 0;
        const acceptedSubmissions = item.acceptedSubmissions ?? item.acceptedCount ?? 0;
        const acceptanceRate = item.acceptanceRate !== undefined && item.acceptanceRate !== null
          ? item.acceptanceRate
          : (totalSubmissions > 0 ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0);
        const points = item.points || (diff === 'Easy' ? 100 : diff === 'Hard' ? 350 : 200);

        return {
          id: item.id,
          code: item.code || `PROB-${String(idx + 1).padStart(3, '0')}`,
          slug: item.slug,
          title: item.title,
          category,
          difficulty: diff,
          acceptanceRate,
          totalSubmissions,
          acceptedSubmissions,
          testCasesCount: item._count?.testCases || item.testCasesCount || 0,
          authorName: item.authorName || 'Faculty',
          tags,
          status: item.status === 'PUBLISHED' ? 'Published' : 'Draft',
          points,
          timeLimitMs: item.timeLimit || 1000,
          memoryLimitMb: item.memoryLimit || 256,
          likes: 0,
          dislikes: 0,
          premium: false,
          companies: [],
          statementMarkdown: item.statement || '',
          sampleTestCases: [],
        };
      });
    }
  } catch (err) {
    console.error('Failed to fetch live problems from API:', err);
  }

  return <ProblemsDirectoryClient initialProblems={problems} />;
}
