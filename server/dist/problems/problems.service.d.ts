import { ProblemDifficulty, ProblemStatus } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProblemInput } from './dto/create-problem.input.js';
import { CreateTestCaseInput } from './dto/create-test-case.input.js';
import { UpdateProblemInput } from './dto/update-problem.input.js';
export declare class ProblemsService {
    private prisma;
    constructor(prisma: PrismaService);
    private slugify;
    create(input: CreateProblemInput, creatorId: string, user?: CurrentUserPayload): Promise<{
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
    findPaginated(args: PaginationArgs, difficulty?: ProblemDifficulty, status?: ProblemStatus, institutionId?: string, user?: CurrentUserPayload): Promise<{
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
    findByIdOrSlug(idOrSlug: string, user?: CurrentUserPayload): Promise<{
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
    update(id: string, input: UpdateProblemInput, user?: CurrentUserPayload): Promise<{
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
    delete(id: string, user?: CurrentUserPayload): Promise<boolean>;
    addTestCase(problemId: string, input: CreateTestCaseInput, user?: CurrentUserPayload): Promise<{
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
    getTestCases(problemId: string, user?: CurrentUserPayload): Promise<{
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
    private assertProblemAuthorOrAdmin;
    private assertInstitutionAssignment;
}
