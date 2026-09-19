import { SubmissionVerdict } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
export interface EvaluationResult {
    verdict: SubmissionVerdict;
    runtime: number;
    memory: number;
    passedTestCases: number;
    totalTestCases: number;
    errorMessage?: string;
}
export declare class JudgeService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    evaluateSubmission(submissionId: string): Promise<void>;
    private runTestCases;
    private normalizeOutput;
    private executeInSandbox;
}
