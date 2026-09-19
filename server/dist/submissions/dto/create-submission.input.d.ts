import { ProgrammingLanguage } from '@prisma/client';
export declare class CreateSubmissionInput {
    problemId: string;
    contestId?: string;
    language: ProgrammingLanguage;
    sourceCode: string;
}
