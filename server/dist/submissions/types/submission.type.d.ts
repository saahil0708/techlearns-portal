import { ProgrammingLanguage, SubmissionStatus, SubmissionVerdict } from '@prisma/client';
import { ProblemType } from '../../problems/types/problem.type.js';
import { UserType } from '../../users/types/user.type.js';
export declare class SubmissionType {
    id: string;
    userId: string;
    problemId: string;
    contestId?: string;
    language: ProgrammingLanguage;
    sourceCode?: string;
    status: SubmissionStatus;
    verdict?: SubmissionVerdict;
    runtime?: number;
    memory?: number;
    errorMessage?: string;
    passedTestCases: number;
    totalTestCases: number;
    user?: UserType;
    problem?: ProblemType;
    createdAt: Date;
    updatedAt: Date;
}
