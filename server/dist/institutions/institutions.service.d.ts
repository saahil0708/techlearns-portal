import { InstitutionStatus, Role } from '@prisma/client';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateInstitutionDto } from './dto/create-institution.dto.js';
import { UpdateInstitutionDto } from './dto/update-institution.dto.js';
export declare class InstitutionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateInstitutionDto): Promise<{
        memberships: {
            role: import("@prisma/client").$Enums.Role;
        }[];
        _count: {
            memberships: number;
            batches: number;
            courses: number;
            problems: number;
        };
    } & {
        id: string;
        email: string | null;
        name: string;
        status: import("@prisma/client").$Enums.InstitutionStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        code: string;
        address: string | null;
        tier: string | null;
        quota: number;
    }>;
    findAll(): Promise<({
        memberships: {
            role: import("@prisma/client").$Enums.Role;
        }[];
        _count: {
            memberships: number;
            batches: number;
            courses: number;
            problems: number;
        };
    } & {
        id: string;
        email: string | null;
        name: string;
        status: import("@prisma/client").$Enums.InstitutionStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        code: string;
        address: string | null;
        tier: string | null;
        quota: number;
    })[]>;
    findPaginated(args: PaginationArgs, status?: InstitutionStatus): Promise<{
        items: ({
            memberships: {
                role: import("@prisma/client").$Enums.Role;
            }[];
            _count: {
                memberships: number;
                batches: number;
                courses: number;
                problems: number;
            };
        } & {
            id: string;
            email: string | null;
            name: string;
            status: import("@prisma/client").$Enums.InstitutionStatus;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            code: string;
            address: string | null;
            tier: string | null;
            quota: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        pendingInvitations: ({
            delivery: {
                status: string;
            } | null;
        } & {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            institutionId: string | null;
            batchId: string | null;
            rollNo: string | null;
            createdAt: Date;
            tokenHash: string;
            expiresAt: Date;
            acceptedAt: Date | null;
            revokedAt: Date | null;
        })[];
        memberships: ({
            user: {
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
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.Role;
            institutionId: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        })[];
        _count: {
            memberships: number;
            batches: number;
            courses: number;
            problems: number;
            contests: number;
        };
        batches: ({
            _count: {
                students: number;
            };
        } & {
            id: string;
            name: string;
            institutionId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            maxCapacity: number;
            startDate: Date | null;
            endDate: Date | null;
        })[];
        id: string;
        email: string | null;
        name: string;
        status: import("@prisma/client").$Enums.InstitutionStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        code: string;
        address: string | null;
        tier: string | null;
        quota: number;
    }>;
    update(id: string, dto: UpdateInstitutionDto): Promise<{
        _count: {
            memberships: number;
            batches: number;
            courses: number;
            problems: number;
        };
    } & {
        id: string;
        email: string | null;
        name: string;
        status: import("@prisma/client").$Enums.InstitutionStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        code: string;
        address: string | null;
        tier: string | null;
        quota: number;
    }>;
    delete(id: string, purgeUsers?: boolean): Promise<boolean>;
    addMember(institutionId: string, dto: AddMemberDto, allowedTargetRole?: Role): Promise<{
        user: {
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
        };
    } & {
        id: string;
        role: import("@prisma/client").$Enums.Role;
        institutionId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    removeMember(institutionId: string, userId: string, allowedRole?: Role): Promise<boolean>;
    getMembers(institutionId: string): Promise<({
        user: {
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
        };
    } & {
        id: string;
        role: import("@prisma/client").$Enums.Role;
        institutionId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    getMember(institutionId: string, userId: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.Role;
        institutionId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null>;
}
