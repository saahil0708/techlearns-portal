import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { CreateTestCaseInput } from './create-test-case.input.js';
export declare class CreateProblemInput {
    title: string;
    slug?: string;
    statement: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    difficulty: ProblemDifficulty;
    timeLimit: number;
    memoryLimit: number;
    institutionId?: string;
    collegeId?: string;
    status?: ProblemStatus;
    testCases?: CreateTestCaseInput[];
}
