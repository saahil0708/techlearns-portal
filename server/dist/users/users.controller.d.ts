import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { BulkInviteDto } from './dto/bulk-invite.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(dto: CreateUserDto, currentUser: CurrentUserPayload): Promise<import("./users.service.js").SanitizedUser>;
    bulkInvite(dto: BulkInviteDto, currentUser: CurrentUserPayload): Promise<import("./types/bulk-invite-result.type.js").BulkInviteResult>;
    getUsers(query: ListUsersQueryDto, currentUser: CurrentUserPayload): Promise<{
        items: import("./users.service.js").SanitizedUser[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getMe(currentUser: CurrentUserPayload): Promise<{
        id: string;
        email: string;
        name: string;
        globalRole: import("@prisma/client").$Enums.Role;
        memberships: {
            id: string;
            role: import("@prisma/client").$Enums.Role;
            institutionId: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        }[];
        rollNo: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        contestRating: number;
        createdAt: Date;
        updatedAt: Date;
        avatarUrl: string | null;
        bannerUrl: string | null;
        bio: string | null;
        phone: string | null;
        institution: string | null;
        department: string | null;
        specialization: string | null;
        officeHours: string | null;
        location: string | null;
        birthDate: string | null;
        githubUrl: string | null;
        linkedinUrl: string | null;
        websiteUrl: string | null;
        resumeUrl: string | null;
        resumeFileName: string | null;
        ratingTier: string;
        lessonProgress: {
            id: string;
            userId: string;
            completedAt: Date | null;
            lessonId: string;
            completed: boolean;
        }[];
        passwordHash: string;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        twoFactorRecoveryCodes: string[];
        batchEnrollments: {
            id: string;
            batchId: string;
            rollNo: string | null;
            userId: string;
            enrolledAt: Date;
        }[];
        createdCourses: {
            description: string | null;
            id: string;
            title: string;
            institutionId: string | null;
            status: import("@prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
        }[];
        enrollments: {
            id: string;
            status: import("@prisma/client").$Enums.EnrollmentStatus;
            userId: string;
            enrolledAt: Date;
            courseId: string;
            completedAt: Date | null;
        }[];
        createdProblems: {
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
        }[];
        submissions: {
            id: string;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            problemId: string;
            contestId: string | null;
            language: import("@prisma/client").$Enums.ProgrammingLanguage;
            sourceCode: string;
            verdict: import("@prisma/client").$Enums.SubmissionVerdict | null;
            runtime: number | null;
            memory: number | null;
            errorMessage: string | null;
            passedTestCases: number;
            totalTestCases: number;
        }[];
        createdContests: {
            description: string | null;
            id: string;
            title: string;
            institutionId: string | null;
            status: import("@prisma/client").$Enums.ContestStatus;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
            startTime: Date;
            endTime: Date;
        }[];
        contestRegistrations: {
            id: string;
            userId: string;
            contestId: string;
            registeredAt: Date;
        }[];
        leaderboardEntries: {
            id: string;
            updatedAt: Date;
            userId: string;
            contestId: string;
            score: number;
            penalty: number;
            rank: number;
        }[];
        passkeys: {
            id: string;
            name: string | null;
            createdAt: Date;
            userId: string;
            credentialId: string;
            publicKey: Uint8Array;
            counter: bigint;
            transports: string[];
            deviceType: string | null;
            backedUp: boolean;
            lastUsedAt: Date | null;
        }[];
        refreshTokens: {
            id: string;
            createdAt: Date;
            userId: string;
            ipAddress: string | null;
            tokenHash: string;
            family: string;
            isRevoked: boolean;
            expiresAt: Date;
            deviceInfo: string | null;
        }[];
        twoFactorChallenges: {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date;
            jti: string;
        }[];
        auditLogs: {
            id: string;
            status: string;
            createdAt: Date;
            userId: string;
            action: string;
            detail: string | null;
            ipAddress: string | null;
        }[];
        _count: {
            memberships: number;
            batchEnrollments: number;
            createdCourses: number;
            enrollments: number;
            lessonProgress: number;
            createdProblems: number;
            submissions: number;
            createdContests: number;
            contestRegistrations: number;
            leaderboardEntries: number;
            passkeys: number;
            refreshTokens: number;
            twoFactorChallenges: number;
            auditLogs: number;
        };
    }>;
    getUser(id: string, currentUser: CurrentUserPayload): Promise<import("./users.service.js").SanitizedUser | null>;
    updateUser(id: string, dto: UpdateUserDto, currentUser: CurrentUserPayload): Promise<import("./users.service.js").SanitizedUser>;
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
