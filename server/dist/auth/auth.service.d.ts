import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { TokenService, type TokenPair } from './services/token.service.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';
export declare class AuthService {
    private usersService;
    private tokenService;
    private totpService;
    private webAuthnService;
    constructor(usersService: UsersService, tokenService: TokenService, totpService: TotpService, webAuthnService: WebAuthnService);
    register(dto: RegisterDto, deviceInfo?: string, ipAddress?: string): Promise<{
        user: import("../users/users.service.js").SanitizedUser | null;
        tokens: TokenPair;
    }>;
    acceptInvitation(token: string, password: string, deviceInfo?: string, ipAddress?: string): Promise<{
        user: import("../users/users.service.js").SanitizedUser;
        tokens: TokenPair;
        requiresLogin: boolean;
        message?: undefined;
    } | {
        user: import("../users/users.service.js").SanitizedUser;
        tokens: undefined;
        requiresLogin: boolean;
        message: string;
    }>;
    login(dto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<{
        requires2FA: boolean;
        challengeToken: string;
        userId: string;
        message: string;
        user?: undefined;
        tokens?: undefined;
    } | {
        user: import("../users/users.service.js").SanitizedUser | null;
        tokens: TokenPair;
        requires2FA?: undefined;
        challengeToken?: undefined;
        userId?: undefined;
        message?: undefined;
    }>;
    verify2faLogin(target: {
        challengeToken?: string;
        userId?: string;
    }, code: string, deviceInfo?: string, ipAddress?: string): Promise<{
        user: import("../users/users.service.js").SanitizedUser;
        tokens: TokenPair;
    }>;
    verifyPasskeyLogin(response: any, challengeKey: string, deviceInfo?: string, ipAddress?: string): Promise<{
        user: import("../users/users.service.js").SanitizedUser;
        tokens: TokenPair;
    }>;
    refreshTokens(refreshToken: string, deviceInfo?: string, ipAddress?: string): Promise<TokenPair>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
    logoutAll(userId: string): Promise<{
        success: boolean;
    }>;
    getProfile(userId: string): Promise<{
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
    changePassword(userId: string, currentPass: string, newPass: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
