import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { TestCaseType } from './test-case.type.js';
export declare class ProblemCountsType {
    submissions: number;
    testCases: number;
}
export declare class ProblemType {
    id: string;
    title: string;
    slug: string;
    statement: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    difficulty: ProblemDifficulty;
    timeLimit: number;
    memoryLimit: number;
    institutionId?: string;
    collegeId?: string;
    createdById: string;
    status: ProblemStatus;
    testCases?: TestCaseType[];
    _count?: ProblemCountsType;
    createdAt: Date;
    updatedAt: Date;
}
