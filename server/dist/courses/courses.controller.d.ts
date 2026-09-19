import { CourseStatus } from '@prisma/client';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';
export declare class CoursesController {
    private coursesService;
    constructor(coursesService: CoursesService);
    create(user: CurrentUserPayload, dto: CreateCourseDto): Promise<{
        createdBy: {
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
        description: string | null;
        id: string;
        title: string;
        institutionId: string | null;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    findAll(user: CurrentUserPayload, institutionId?: string, collegeId?: string, status?: CourseStatus): Promise<({
        _count: {
            enrollments: number;
            modules: number;
        };
        createdBy: {
            id: string;
            name: string;
        };
    } & {
        description: string | null;
        id: string;
        title: string;
        institutionId: string | null;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    })[]>;
    getEnrolled(user: CurrentUserPayload): Promise<({
        course: {
            _count: {
                modules: number;
            };
            createdBy: {
                id: string;
                name: string;
            };
        } & {
            description: string | null;
            id: string;
            title: string;
            institutionId: string | null;
            status: import("@prisma/client").$Enums.CourseStatus;
            createdAt: Date;
            updatedAt: Date;
            createdById: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        userId: string;
        enrolledAt: Date;
        courseId: string;
        completedAt: Date | null;
    })[]>;
    findOne(id: string, user: CurrentUserPayload): Promise<{
        institution: {
            id: string;
            name: string;
            code: string;
        } | null;
        _count: {
            enrollments: number;
        };
        createdBy: {
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
        modules: ({
            lessons: {
                id: string;
                title: string;
                createdAt: Date;
                order: number;
            }[];
        } & {
            description: string | null;
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            order: number;
        })[];
    } & {
        description: string | null;
        id: string;
        title: string;
        institutionId: string | null;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    update(id: string, dto: UpdateCourseDto, user: CurrentUserPayload): Promise<{
        description: string | null;
        id: string;
        title: string;
        institutionId: string | null;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    delete(id: string, user: CurrentUserPayload): Promise<{
        description: string | null;
        id: string;
        title: string;
        institutionId: string | null;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    createModule(courseId: string, dto: CreateModuleDto, user: CurrentUserPayload): Promise<{
        lessons: {
            content: string;
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            moduleId: string;
        }[];
    } & {
        description: string | null;
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        order: number;
    }>;
    updateModule(moduleId: string, dto: UpdateModuleDto, user: CurrentUserPayload): Promise<{
        description: string | null;
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        order: number;
    }>;
    deleteModule(moduleId: string, user: CurrentUserPayload): Promise<{
        description: string | null;
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        order: number;
    }>;
    createLesson(moduleId: string, dto: CreateLessonDto, user: CurrentUserPayload): Promise<{
        content: string;
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        moduleId: string;
    }>;
    getLesson(lessonId: string, user: CurrentUserPayload): Promise<{
        completed: boolean;
        module: {
            course: {
                id: string;
                title: string;
                institutionId: string | null;
                status: import("@prisma/client").$Enums.CourseStatus;
                createdById: string;
            };
        } & {
            description: string | null;
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            order: number;
        };
        content: string;
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        moduleId: string;
    }>;
    updateLesson(lessonId: string, dto: UpdateLessonDto, user: CurrentUserPayload): Promise<{
        content: string;
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        moduleId: string;
    }>;
    deleteLesson(lessonId: string, user: CurrentUserPayload): Promise<{
        content: string;
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        moduleId: string;
    }>;
    enroll(courseId: string, user: CurrentUserPayload): Promise<{
        course: {
            description: string | null;
            id: string;
            title: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.EnrollmentStatus;
        userId: string;
        enrolledAt: Date;
        courseId: string;
        completedAt: Date | null;
    }>;
    updateProgress(lessonId: string, dto: UpdateProgressDto, user: CurrentUserPayload): Promise<{
        id: string;
        userId: string;
        completedAt: Date | null;
        lessonId: string;
        completed: boolean;
    }>;
    getCourseProgress(courseId: string, user: CurrentUserPayload): Promise<{
        totalLessons: number;
        completedLessons: number;
        progressPercent: number;
    }>;
}
