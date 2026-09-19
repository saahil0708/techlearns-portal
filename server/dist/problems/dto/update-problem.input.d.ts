import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
export declare class UpdateProblemInput {
    title?: string;
    statement?: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    difficulty?: ProblemDifficulty;
    timeLimit?: number;
    memoryLimit?: number;
    status?: ProblemStatus;
}
