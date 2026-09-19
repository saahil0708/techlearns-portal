import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CreateProblemInput } from './dto/create-problem.input.js';
import { CreateTestCaseInput } from './dto/create-test-case.input.js';
import { UpdateProblemInput } from './dto/update-problem.input.js';
import { ProblemsService } from './problems.service.js';
export declare class ProblemsResolver {
    private problemsService;
    constructor(problemsService: ProblemsService);
    getProblems(paginationArgs: PaginationArgs, difficulty?: ProblemDifficulty, status?: ProblemStatus, institutionId?: string, collegeId?: string, currentUser?: CurrentUserPayload): Promise<{
        items: ({
            _count: {
                submissions: number;
                testCases: number;
            };
            testCases: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                problemId: string;
                order: number;
                input: string;
                expectedOutput: string;
                isHidden: boolean;
                explanation: string | null;
            }[];
        } & {
            id: string;
            title: string;
            institutionId: string | null;
            status: import("@prisma/client").$Enums.ProblemStatus;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            statement: string;
            inputFormat: string;
            outputFormat: string;
            constraints: string;
            difficulty: import("@prisma/client").$Enums.ProblemDifficulty;
            timeLimit: number;
            memoryLimit: number;
            createdById: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProblem(idOrSlug: string, currentUser?: CurrentUserPayload): Promise<{
        testCases: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            problemId: string;
            order: number;
            input: string;
            expectedOutput: string;
            isHidden: boolean;
            explanation: string | null;
        }[];
        _count: {
            submissions: number;
            testCases: number;
        };
        id: string;
        title: string;
        institutionId: string | null;
        status: import("@prisma/client").$Enums.ProblemStatus;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        statement: string;
        inputFormat: string;
        outputFormat: string;
        constraints: string;
        difficulty: import("@prisma/client").$Enums.ProblemDifficulty;
        timeLimit: number;
        memoryLimit: number;
        createdById: string;
    }>;
    getProblemTestCases(problemId: string, currentUser?: CurrentUserPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        problemId: string;
        order: number;
        input: string;
        expectedOutput: string;
        isHidden: boolean;
        explanation: string | null;
    }[]>;
    createProblem(input: CreateProblemInput, currentUser: CurrentUserPayload): Promise<{
        _count: {
            submissions: number;
            testCases: number;
        };
        testCases: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            problemId: string;
            order: number;
            input: string;
            expectedOutput: string;
            isHidden: boolean;
            explanation: string | null;
        }[];
    } & {
        id: string;
        title: string;
        institutionId: string | null;
        status: import("@prisma/client").$Enums.ProblemStatus;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        statement: string;
        inputFormat: string;
        outputFormat: string;
        constraints: string;
        difficulty: import("@prisma/client").$Enums.ProblemDifficulty;
        timeLimit: number;
        memoryLimit: number;
        createdById: string;
    }>;
    updateProblem(id: string, input: UpdateProblemInput, currentUser: CurrentUserPayload): Promise<{
        _count: {
            submissions: number;
            testCases: number;
        };
        testCases: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            problemId: string;
            order: number;
            input: string;
            expectedOutput: string;
            isHidden: boolean;
            explanation: string | null;
        }[];
    } & {
        id: string;
        title: string;
        institutionId: string | null;
        status: import("@prisma/client").$Enums.ProblemStatus;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        statement: string;
        inputFormat: string;
        outputFormat: string;
        constraints: string;
        difficulty: import("@prisma/client").$Enums.ProblemDifficulty;
        timeLimit: number;
        memoryLimit: number;
        createdById: string;
    }>;
    deleteProblem(id: string, currentUser: CurrentUserPayload): Promise<boolean>;
    addProblemTestCase(problemId: string, input: CreateTestCaseInput, currentUser: CurrentUserPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        problemId: string;
        order: number;
        input: string;
        expectedOutput: string;
        isHidden: boolean;
        explanation: string | null;
    }>;
}
