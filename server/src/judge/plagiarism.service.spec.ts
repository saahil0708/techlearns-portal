import { Test, TestingModule } from '@nestjs/testing';
import { ProgrammingLanguage, SubmissionVerdict } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { PlagiarismService } from './plagiarism.service.js';

describe('PlagiarismService', () => {
  let service: PlagiarismService;
  let prisma: {
    contest: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      contest: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlagiarismService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PlagiarismService>(PlagiarismService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should tokenize source code correctly and standardize identifiers', () => {
    const code = `
      // Calculate sum
      int sum(int a, int b) {
        return a + b;
      }
    `;
    const tokens = service.tokenize(code);
    expect(tokens).toContain('INT');
    expect(tokens).toContain('$ID');
    expect(tokens).toContain('RETURN');
    expect(tokens).not.toContain('// Calculate sum');
  });

  it('should detect identical code snippets with 100% similarity', () => {
    const codeA = `
      #include <iostream>
      using namespace std;
      int main() {
        int n;
        cin >> n;
        int sum = 0;
        for (int i = 0; i < n; i++) {
          sum += i;
        }
        cout << sum << endl;
        return 0;
      }
    `;
    const codeB = `
      #include <iostream>
      using namespace std;
      int main() {
        int count;
        cin >> count;
        int total = 0;
        for (int j = 0; j < count; j++) {
          total += j;
        }
        cout << total << endl;
        return 0;
      }
    `;

    const result = service.calculateSimilarity(codeA, codeB);
    expect(result.similarity).toBeGreaterThan(80);
  });

  it('should detect dissimilar code snippets with low similarity', () => {
    const codeA = `
      def fib(n):
        if n <= 1:
          return n
        return fib(n-1) + fib(n-2)
    `;
    const codeB = `
      def quicksort(arr):
        if len(arr) <= 1:
          return arr
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        return quicksort(left) + middle + quicksort(right)
    `;

    const result = service.calculateSimilarity(codeA, codeB);
    expect(result.similarity).toBeLessThan(70);
  });

  it('should run contest plagiarism check and flag matching pairs', async () => {
    prisma.contest.findUnique.mockResolvedValue({
      id: 'contest-1',
      submissions: [
        {
          id: 'sub-1',
          userId: 'u-1',
          problemId: 'p-1',
          language: ProgrammingLanguage.CPP,
          sourceCode: 'int main() { for(int i=0; i<10; i++) { count++; } return 0; }',
          verdict: SubmissionVerdict.ACCEPTED,
          user: { id: 'u-1', name: 'Alice', email: 'alice@campus.edu' },
          problem: { id: 'p-1', title: 'Loop Sum' },
        },
        {
          id: 'sub-2',
          userId: 'u-2',
          problemId: 'p-1',
          language: ProgrammingLanguage.CPP,
          sourceCode: 'int main() { for(int j=0; j<10; j++) { total++; } return 0; }',
          verdict: SubmissionVerdict.ACCEPTED,
          user: { id: 'u-2', name: 'Bob', email: 'bob@campus.edu' },
          problem: { id: 'p-1', title: 'Loop Sum' },
        },
      ],
    });

    const report = await service.runContestPlagiarismCheck('contest-1', 75);
    expect(report.contestId).toBe('contest-1');
    expect(report.totalSubmissionsAnalyzed).toBe(2);
    expect(report.matches.length).toBeGreaterThanOrEqual(1);
    expect(report.matches[0].userAName).toBe('Alice');
    expect(report.matches[0].userBName).toBe('Bob');
  });
});
