import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProgrammingLanguage, SubmissionVerdict } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PlagiarismPairMatch {
  submissionAId: string;
  submissionBId: string;
  userAName: string;
  userBName: string;
  userAEmail: string;
  userBEmail: string;
  problemId: string;
  problemTitle: string;
  language: ProgrammingLanguage;
  similarityPercentage: number;
  matchedKgrams: number;
  totalKgramsA: number;
  totalKgramsB: number;
}

export interface PlagiarismReportResponse {
  contestId: string;
  totalSubmissionsAnalyzed: number;
  suspiciousPairsCount: number;
  thresholdPercentage: number;
  matches: PlagiarismPairMatch[];
  analyzedAt: Date;
}

@Injectable()
export class PlagiarismService {
  private readonly logger = new Logger(PlagiarismService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Normalize source code into abstract structural tokens
   */
  public tokenize(sourceCode: string): string[] {
    if (!sourceCode) return [];

    // Remove single line and multi-line comments
    const noComments = sourceCode
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
      .replace(/#.*$/gm, '')
      .replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/gm, '');

    // Split into lexemes
    const rawTokens = noComments.match(/[a-zA-Z_]\w*|\d+|[+\-*/%=<>!&|^~]+|[{}()[\];,.]/g) || [];

    const keywords = new Set([
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
      'return', 'function', 'def', 'class', 'struct', 'int', 'float', 'double',
      'char', 'void', 'bool', 'boolean', 'let', 'const', 'var', 'import', 'include',
      'vector', 'string', 'auto', 'public', 'private', 'static', 'new', 'delete',
    ]);

    return rawTokens.map((tok) => {
      if (keywords.has(tok.toLowerCase())) {
        return tok.toUpperCase();
      }
      if (/^\d+$/.test(tok)) {
        return '$NUM';
      }
      if (/^[a-zA-Z_]\w*$/.test(tok)) {
        return '$ID';
      }
      return tok;
    });
  }

  /**
   * Generates k-gram fingerprints from tokens
   */
  public generateKgrams(tokens: string[], k = 10): number[] {
    if (tokens.length < k) {
      // Fallback for short snippets
      return tokens.length > 0 ? [this.hashString(tokens.join(''))] : [];
    }

    const kgrams: number[] = [];
    for (let i = 0; i <= tokens.length - k; i++) {
      const slice = tokens.slice(i, i + k).join(' ');
      kgrams.push(this.hashString(slice));
    }
    return kgrams;
  }

  /**
   * Winnowing algorithm: selects minimum hash in each sliding window of size w
   */
  public winnow(hashes: number[], windowSize = 4): Set<number> {
    const fingerprints = new Set<number>();
    if (hashes.length === 0) return fingerprints;
    if (hashes.length <= windowSize) {
      hashes.forEach((h) => fingerprints.add(h));
      return fingerprints;
    }

    for (let i = 0; i <= hashes.length - windowSize; i++) {
      const window = hashes.slice(i, i + windowSize);
      let minHash = window[0];
      for (const h of window) {
        if (h < minHash) {
          minHash = h;
        }
      }
      fingerprints.add(minHash);
    }

    return fingerprints;
  }

  /**
   * Get winnowed fingerprint set for source code
   */
  public getFingerprints(code: string, k = 10, windowSize = 4): Set<number> {
    const tokens = this.tokenize(code);
    const kgrams = this.generateKgrams(tokens, k);
    return this.winnow(kgrams, windowSize);
  }

  /**
   * Compute similarity percentage from pre-computed fingerprint sets
   */
  public calculateSimilarityFromFingerprints(
    fpA: Set<number>,
    fpB: Set<number>,
  ): { similarity: number; matches: number; totalA: number; totalB: number } {
    if (fpA.size === 0 || fpB.size === 0) {
      return { similarity: 0, matches: 0, totalA: fpA.size, totalB: fpB.size };
    }

    let shared = 0;
    for (const h of fpA) {
      if (fpB.has(h)) {
        shared++;
      }
    }

    const similarity = Number(((2 * shared) / (fpA.size + fpB.size) * 100).toFixed(2));
    return {
      similarity,
      matches: shared,
      totalA: fpA.size,
      totalB: fpB.size,
    };
  }

  /**
   * Compute similarity percentage between two source codes
   */
  public calculateSimilarity(
    codeA: string,
    codeB: string,
    k = 10,
    windowSize = 4,
  ): { similarity: number; matches: number; totalA: number; totalB: number } {
    const fpA = this.getFingerprints(codeA, k, windowSize);
    const fpB = this.getFingerprints(codeB, k, windowSize);
    return this.calculateSimilarityFromFingerprints(fpA, fpB);
  }

  /**
   * Run full post-contest MOSS / Winnowing plagiarism check across all accepted submissions
   */
  async runContestPlagiarismCheck(
    contestId: string,
    thresholdPercentage = 80,
  ): Promise<PlagiarismReportResponse> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        submissions: {
          where: { verdict: SubmissionVerdict.ACCEPTED },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            problem: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException(`Contest ${contestId} not found`);
    }

    // Pre-generate and cache fingerprints for each submission
    const fingerprintMap = new Map<string, Set<number>>();
    for (const sub of contest.submissions) {
      fingerprintMap.set(sub.id, this.getFingerprints(sub.sourceCode));
    }

    // Group submissions by problemId
    const submissionsByProblem = new Map<string, typeof contest.submissions>();
    for (const sub of contest.submissions) {
      const list = submissionsByProblem.get(sub.problemId) || [];
      list.push(sub);
      submissionsByProblem.set(sub.problemId, list);
    }

    const matches: PlagiarismPairMatch[] = [];

    for (const [problemId, subs] of submissionsByProblem.entries()) {
      // Compare each unique pair of submissions from different users in the same language
      for (let i = 0; i < subs.length; i++) {
        for (let j = i + 1; j < subs.length; j++) {
          const subA = subs[i];
          const subB = subs[j];

          // Skip comparisons of same user's multiple submissions or differing languages
          if (subA.userId === subB.userId) continue;
          if (subA.language !== subB.language) continue;

          const fpA = fingerprintMap.get(subA.id) || new Set();
          const fpB = fingerprintMap.get(subB.id) || new Set();
          const result = this.calculateSimilarityFromFingerprints(fpA, fpB);

          if (result.similarity >= thresholdPercentage) {
            matches.push({
              submissionAId: subA.id,
              submissionBId: subB.id,
              userAName: subA.user.name,
              userBName: subB.user.name,
              userAEmail: subA.user.email,
              userBEmail: subB.user.email,
              problemId,
              problemTitle: subA.problem.title,
              language: subA.language,
              similarityPercentage: result.similarity,
              matchedKgrams: result.matches,
              totalKgramsA: result.totalA,
              totalKgramsB: result.totalB,
            });
          }
        }
      }
    }

    // Sort by highest similarity first
    matches.sort((a, b) => b.similarityPercentage - a.similarityPercentage);

    return {
      contestId,
      totalSubmissionsAnalyzed: contest.submissions.length,
      suspiciousPairsCount: matches.length,
      thresholdPercentage,
      matches,
      analyzedAt: new Date(),
    };
  }

  private hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
