import type { Request, Response } from 'express';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenDto, RevokeTokenDto } from './dto/refresh-token.dto.js';
import { Disable2faDto, Enable2faDto, Verify2faDto } from './dto/totp.dto.js';
import { PasskeyLoginChallengeDto, PasskeyLoginVerifyDto, PasskeyRegistrationVerifyDto } from './dto/passkey.dto.js';
import { TotpService } from './services/totp.service.js';
import { WebAuthnService } from './services/webauthn.service.js';
export declare class AuthController {
    private authService;
    private totpService;
    private webAuthnService;
    constructor(authService: AuthService, totpService: TotpService, webAuthnService: WebAuthnService);
    private setAuthCookies;
    private clearAuthCookies;
    register(dto: RegisterDto, req: Request, res: Response): Promise<{
        user: import("../users/users.service.js").SanitizedUser | null;
        tokens: import("./services/token.service.js").TokenPair;
    }>;
    acceptInvitation(dto: AcceptInvitationDto, req: Request, res: Response): Promise<{
        user: import("../users/users.service.js").SanitizedUser;
        tokens: import("./services/token.service.js").TokenPair;
        requiresLogin: boolean;
        message?: undefined;
    } | {
        user: import("../users/users.service.js").SanitizedUser;
        tokens: undefined;
        requiresLogin: boolean;
        message: string;
    }>;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        requires2FA: boolean;
        challengeToken: string;
        userId: string;
        message: string;
        user?: undefined;
        tokens?: undefined;
    } | {
        user: import("../users/users.service.js").SanitizedUser | null;
        tokens: import("./services/token.service.js").TokenPair;
        requires2FA?: undefined;
        challengeToken?: undefined;
        userId?: undefined;
        message?: undefined;
    }>;
    refreshTokens(dto: RefreshTokenDto, req: Request, res: Response): Promise<import("./services/token.service.js").TokenPair>;
    logout(dto: RevokeTokenDto, req: Request, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    logoutAll(user: CurrentUserPayload, res: Response): Promise<{
        success: boolean;
    }>;
    generate2faSecret(user: CurrentUserPayload): Promise<import("./services/totp.service.js").TotpSetupResponse>;
    enable2fa(user: CurrentUserPayload, dto: Enable2faDto): Promise<boolean>;
    verify2faLogin(dto: Verify2faDto, req: Request, res: Response): Promise<{
        user: import("../users/users.service.js").SanitizedUser;
        tokens: import("./services/token.service.js").TokenPair;
    }>;
    disable2fa(user: CurrentUserPayload, dto: Disable2faDto): Promise<boolean>;
    generatePasskeyRegistrationChallenge(user: CurrentUserPayload): Promise<import("@simplewebauthn/server").PublicKeyCredentialCreationOptionsJSON>;
    verifyPasskeyRegistration(user: CurrentUserPayload, dto: PasskeyRegistrationVerifyDto): Promise<{
        verified: boolean;
        passkeyId: string;
    }>;
    generatePasskeyLoginChallenge(dto: PasskeyLoginChallengeDto): Promise<{
        challengeKey: string;
        challenge: import("@simplewebauthn/server").Base64URLString;
        timeout?: number;
        rpId?: string;
        allowCredentials?: import("@simplewebauthn/server").PublicKeyCredentialDescriptorJSON[];
        userVerification?: import("@simplewebauthn/server").UserVerificationRequirement;
        hints?: import("@simplewebauthn/server").PublicKeyCredentialHint[];
        extensions?: import("@simplewebauthn/server").AuthenticationExtensionsClientInputs;
    }>;
    verifyPasskeyLogin(dto: PasskeyLoginVerifyDto, req: Request, res: Response): Promise<{
        user: import("../users/users.service.js").SanitizedUser;
        tokens: import("./services/token.service.js").TokenPair;
    }>;
    listPasskeys(user: CurrentUserPayload): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        credentialId: string;
        deviceType: string | null;
        backedUp: boolean;
        lastUsedAt: Date | null;
    }[]>;
    deletePasskey(user: CurrentUserPayload, id: string): Promise<{
        success: boolean;
    }>;
    getProfile(user: CurrentUserPayload): Promise<{
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
    changePassword(user: CurrentUserPayload, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
