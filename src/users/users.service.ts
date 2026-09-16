import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role, User, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { BulkInviteUsersInput } from './dto/bulk-invite.input.js';
import { CreateUserInput } from './dto/create-user.input.js';
import { UpdateUserInput } from './dto/update-user.input.js';
import { BulkInviteResult } from './types/bulk-invite-result.type.js';

export type SanitizedUser = Omit<User, 'passwordHash'>;

export const userSanitizedSelect: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
  globalRole: true,
  status: true,
  avatarUrl: true,
  bannerUrl: true,
  bio: true,
  phone: true,
  institution: true,
  department: true,
  specialization: true,
  officeHours: true,
  location: true,
  birthDate: true,
  githubUrl: true,
  linkedinUrl: true,
  websiteUrl: true,
  resumeUrl: true,
  resumeFileName: true,
  rollNo: true,
  contestRating: true,
  ratingTier: true,
  createdAt: true,
  updatedAt: true,
  memberships: {
    select: {
      id: true,
      institutionId: true,
      role: true,
      institution: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
  batchEnrollments: {
    select: {
      id: true,
      batchId: true,
      rollNo: true,
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  auditLogs: {
    select: {
      id: true,
      action: true,
      ipAddress: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  },
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly encryptionKeys: Buffer[];

  constructor(
    private prisma: PrismaService,
    @Optional() private configService?: ConfigService,
    @Optional() private mailService?: MailService,
  ) {
    const currentKey = this.configService?.get<string>('auth.totp.encryptionKey') || process.env.TOTP_ENCRYPTION_KEY;
    const previousKeys = this.configService?.get<string[]>('auth.totp.previousEncryptionKeys') ||
      process.env.TOTP_PREVIOUS_ENCRYPTION_KEYS?.split(',').map((key) => key.trim()).filter(Boolean) || [];

    const configuredKeys = [currentKey, ...previousKeys].filter((key): key is string => Boolean(key));
    const rawKeys = configuredKeys.length > 0 ? configuredKeys : [];
    if (rawKeys.length === 0 && process.env.NODE_ENV !== 'development') {
      throw new Error('Encryption key is required for TOTP; set auth.totp.encryptionKey or JWT secret');
    }
    this.encryptionKeys = rawKeys.map((key) =>
      Buffer.from(createHmac('sha256', key).update('codeplatform:invitation:v1').digest()),
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: true,
      },
    });
  }

  async findById(id: string): Promise<SanitizedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSanitizedSelect,
    });

    return (user as unknown as SanitizedUser) || null;
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSanitizedSelect,
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match');
    }

    if (newPass.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPass, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    await this.logAdminActivity(
      userId,
      'Password Changed',
      'Account security password updated successfully',
    );

    return { success: true, message: 'Password changed successfully' };
  }

  async getStudentProfile(handleOrId: string) {
    const baseUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: handleOrId },
          { email: handleOrId.toLowerCase() },
          { rollNo: handleOrId },
        ],
      },
      select: { id: true },
    });

    if (!baseUser) {
      throw new NotFoundException(`Student profile '${handleOrId}' not found`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: baseUser.id },
      include: {
        submissions: {
          include: {
            problem: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        enrollments: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
        contestRegistrations: {
          include: {
            contest: {
              include: {
                leaderboardEntries: {
                  where: { userId: baseUser.id },
                },
                _count: {
                  select: {
                    leaderboardEntries: true,
                  },
                },
              },
            },
          },
        },
        lessonProgress: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Student profile '${handleOrId}' not found`);
    }

    // Compute problem stats
    const totalSubmissionsCount = user.submissions.length;
    const acceptedSubmissions = user.submissions.filter((s) => s.verdict === 'ACCEPTED');
    const uniqueSolvedProblemIds = new Set(acceptedSubmissions.map((s) => s.problemId));
    const solvedTotal = uniqueSolvedProblemIds.size;

    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;

    const seenEasy = new Set<string>();
    const seenMed = new Set<string>();
    const seenHard = new Set<string>();

    for (const sub of acceptedSubmissions) {
      if (sub.problem.difficulty === 'EASY' && !seenEasy.has(sub.problemId)) {
        seenEasy.add(sub.problemId);
        solvedEasy++;
      } else if (sub.problem.difficulty === 'MEDIUM' && !seenMed.has(sub.problemId)) {
        seenMed.add(sub.problemId);
        solvedMedium++;
      } else if (sub.problem.difficulty === 'HARD' && !seenHard.has(sub.problemId)) {
        seenHard.add(sub.problemId);
        solvedHard++;
      }
    }

    const accuracyRate =
      totalSubmissionsCount > 0
        ? `${((acceptedSubmissions.length / totalSubmissionsCount) * 100).toFixed(1)}%`
        : '0.0%';

    // Map formatted submissions
    const mappedSubmissions = user.submissions.slice(0, 20).map((sub) => {
      const dateStr = new Date(sub.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        id: sub.id,
        problemTitle: sub.problem.title,
        problemSlug: sub.problem.slug,
        problemCode: `PROB-${sub.problem.id.slice(0, 4).toUpperCase()}`,
        difficulty:
          sub.problem.difficulty === 'EASY'
            ? 'Easy'
            : sub.problem.difficulty === 'HARD'
              ? 'Hard'
              : 'Medium',
        language: sub.language,
        verdict:
          sub.verdict === 'ACCEPTED'
            ? 'Accepted'
            : sub.verdict === 'WRONG_ANSWER'
              ? 'Wrong Answer'
              : sub.verdict === 'TIME_LIMIT_EXCEEDED'
                ? 'Time Limit Exceeded'
                : sub.verdict === 'MEMORY_LIMIT_EXCEEDED'
                  ? 'Memory Limit Exceeded'
                  : 'Runtime Error',
        runtimeMs: sub.runtime || 0,
        memoryKb: sub.memory || 0,
        submittedAt: dateStr,
        codeSnippet: (sub.sourceCode || '// Code submission snippet unavailable') as string | undefined,
      };
    });

    // Map formatted courses
    const mappedCourses = user.enrollments.map((enr) => {
      let totalLessons = 0;
      for (const mod of enr.course.modules) {
        totalLessons += mod.lessons.length;
      }
      const completedLessonIds = new Set(
        user!.lessonProgress.filter((lp) => lp.completed).map((lp) => lp.lessonId),
      );
      const completedLessons = user!.lessonProgress.filter(
        (lp) =>
          lp.completed &&
          enr.course.modules.some((m) => m.lessons.some((l) => l.id === lp.lessonId)),
      ).length;

      const progressPct =
        totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0;

      const modulesCompleted = enr.course.modules.filter(
        (m) => m.lessons.length > 0 && m.lessons.every((l) => completedLessonIds.has(l.id)),
      ).length;

      return {
        id: enr.course.id,
        title: enr.course.title,
        slug: enr.course.id,
        instructor: 'CodePlatform Faculty',
        modulesCompleted,
        totalModules: enr.course.modules.length,
        progressPct,
        status: progressPct >= 100 ? 'Completed' : 'In Progress',
      };
    });

    // Map contests
    const mappedContests = user.contestRegistrations.map((cr) => {
      const entry = cr.contest.leaderboardEntries.find((e) => e.userId === user.id) || cr.contest.leaderboardEntries[0];
      const rank = entry?.rank || 0;
      const score = entry?.score || 0;
      const penalty = entry?.penalty ? `${Math.floor(entry.penalty / 60)}m` : '0m';
      const totalParticipants = (cr.contest as any)._count?.leaderboardEntries ?? 0;
      const dateStr = new Date(cr.contest.startTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      return {
        id: cr.contest.id,
        contestName: cr.contest.title,
        contestDate: dateStr,
        rank,
        totalParticipants,
        score,
        penaltyTime: penalty,
        ratingDelta: 0,
        newRating: user!.contestRating || 1500,
      };
    });

    const joinedDateStr = new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    return {
      id: user.id,
      name: user.name,
      handle: user.rollNo || user.email.split('@')[0],
      email: user.email as string | undefined,
      role: user.globalRole,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      bio: user.bio,
      institution: user.institution,
      department: user.department,
      location: user.location,
      phone: user.phone,
      joinedDate: joinedDateStr,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      websiteUrl: user.websiteUrl,
      resumeUrl: user.resumeUrl,
      resumeFileName: user.resumeFileName,
      contestRating: user.contestRating || 1500,
      ratingTier: user.ratingTier || 'Novice',
      globalRank: 1,
      solvedTotal,
      solvedEasy,
      solvedMedium,
      solvedHard,
      totalSubmissions: totalSubmissionsCount,
      accuracyRate,
      currentStreakDays: 0,
      maxStreakDays: 0,
      topics: [],
      submissions: mappedSubmissions,
      contests: mappedContests,
      courses: mappedCourses,
    };
  }

  async getSuperAdminMetrics(user?: { globalRole: Role; memberships?: { institutionId?: string; collegeId?: string }[] }) {
    const isPlatformAdmin =
      user?.globalRole === Role.SUPER_ADMIN || user?.globalRole === Role.PLATFORM_ADMIN;
    const institutionIds = user?.memberships?.map((membership) => membership.institutionId || membership.collegeId).filter(Boolean) as string[] || [];
    const scopedInstitution = isPlatformAdmin ? undefined : { in: institutionIds };
    const scopedMembership = isPlatformAdmin
      ? undefined
      : { some: { institutionId: { in: institutionIds } } };
    const [
      institutionsCount,
      studentsCount,
      facultyCount,
      adminsCount,
      totalUsersCount,
      problemsCount,
      contestsCount,
      submissionsCount,
    ] = await Promise.all([
      this.prisma.institution.count({ where: scopedInstitution ? { id: scopedInstitution } : undefined }),
      this.prisma.user.count({ where: { globalRole: Role.STUDENT, memberships: scopedMembership } }),
      this.prisma.user.count({ where: { globalRole: Role.FACULTY, memberships: scopedMembership } }),
      this.prisma.user.count({
        where: {
          globalRole: { in: [Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN] },
          memberships: scopedMembership,
        },
      }),
      this.prisma.user.count({ where: { memberships: scopedMembership } }),
      this.prisma.problem.count({ where: scopedInstitution ? { institutionId: scopedInstitution } : undefined }),
      this.prisma.contest.count({ where: scopedInstitution ? { institutionId: scopedInstitution } : undefined }),
      this.prisma.submission.count({
        where: scopedInstitution ? { problem: { institutionId: scopedInstitution } } : undefined,
      }),
    ]);

    return {
      institutionsCount,
      collegesCount: institutionsCount,
      studentsCount,
      facultyCount,
      adminsCount,
      totalUsersCount,
      problemsCount,
      contestsCount,
      submissionsCount,
      systemStatus: 'Healthy',
      uptimePercentage: '99.99%',
    };
  }

  async getAdminAuditLogs(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async logAdminActivity(
    userId: string,
    action: string,
    detail?: string,
    ipAddress?: string,
    status: string = 'SUCCESS',
  ) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          detail,
          ipAddress,
          status,
        },
      });
    } catch {
      return null;
    }
  }

  async findPaginated(
    args: PaginationArgs,
    role?: Role,
    status?: UserStatus,
    institutionId?: string,
  ) {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (args.search) {
      where.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { email: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.globalRole = role;
    }

    if (status) {
      where.status = status;
    }

    if (institutionId) {
      where.memberships = {
        some: {
          institutionId,
        },
      };
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (args.sortBy && ['name', 'email', 'globalRole', 'status', 'contestRating', 'createdAt', 'updatedAt'].includes(args.sortBy)) {
      orderBy[args.sortBy as keyof Prisma.UserOrderByWithRelationInput] =
        args.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: userSanitizedSelect,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items as unknown as SanitizedUser[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    globalRole?: Role;
    status?: UserStatus;
    rollNo?: string;
  }): Promise<SanitizedUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash: data.passwordHash,
        globalRole: data.globalRole || Role.STUDENT,
        status: data.status || UserStatus.ACTIVE,
        rollNo: data.rollNo,
      },
      select: userSanitizedSelect,
    });

    return user as unknown as SanitizedUser;
  }

  async createWithInput(input: CreateUserInput): Promise<SanitizedUser> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const rollNo = input.rollNo || input.handle || input.username;
    const user = await this.createUser({
      email: input.email,
      name: input.name,
      passwordHash,
      globalRole: input.globalRole,
      status: input.status,
      rollNo,
    });

    const targetInstitutionId = input.institutionId || input.collegeId;
    if (targetInstitutionId) {
      await this.prisma.institutionMembership.create({
        data: {
          userId: user.id,
          institutionId: targetInstitutionId,
          role: input.globalRole || Role.STUDENT,
        },
      });
    }

    return user;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<SanitizedUser> {
    const data: Prisma.UserUpdateInput = {};

    if (input.email) data.email = input.email.toLowerCase();
    if (input.name) data.name = input.name;
    if (input.globalRole) data.globalRole = input.globalRole;
    if (input.status) data.status = input.status;
    if (input.password) data.passwordHash = await bcrypt.hash(input.password, 10);
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
    if (input.bannerUrl !== undefined) data.bannerUrl = input.bannerUrl;
    if (input.bio !== undefined) data.bio = input.bio;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.institution !== undefined) data.institution = input.institution;
    if (input.department !== undefined) data.department = input.department;
    if (input.specialization !== undefined) data.specialization = input.specialization;
    if (input.officeHours !== undefined) data.officeHours = input.officeHours;
    if (input.location !== undefined) data.location = input.location;
    if (input.birthDate !== undefined) data.birthDate = input.birthDate;
    if (input.githubUrl !== undefined) data.githubUrl = input.githubUrl;
    if (input.linkedinUrl !== undefined) data.linkedinUrl = input.linkedinUrl;
    if (input.websiteUrl !== undefined) data.websiteUrl = input.websiteUrl;
    if (input.resumeUrl !== undefined) data.resumeUrl = input.resumeUrl;
    if (input.resumeFileName !== undefined) data.resumeFileName = input.resumeFileName;
    const customHandle = input.rollNo !== undefined ? input.rollNo : (input.handle !== undefined ? input.handle : input.username);
    if (customHandle !== undefined) data.rollNo = customHandle;
    if (input.contestRating !== undefined) data.contestRating = input.contestRating;
    if (input.ratingTier !== undefined) data.ratingTier = input.ratingTier;

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: userSanitizedSelect,
    });

    await this.logAdminActivity(id, 'Profile Updated', `User profile attributes updated`);

    return updated as unknown as SanitizedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const fallbackAdmin = await this.prisma.user.findFirst({
      where: {
        globalRole: Role.SUPER_ADMIN,
        id: { not: id },
      },
    });

    await this.prisma.$transaction(async (tx) => {
      if (fallbackAdmin) {
        await tx.course.updateMany({
          where: { createdById: id },
          data: { createdById: fallbackAdmin.id },
        });
        await tx.problem.updateMany({
          where: { createdById: id },
          data: { createdById: fallbackAdmin.id },
        });
        await tx.contest.updateMany({
          where: { createdById: id },
          data: { createdById: fallbackAdmin.id },
        });
      }

      await tx.user.delete({
        where: { id },
      });
    });

    return true;
  }

  async bulkInvite(input: BulkInviteUsersInput): Promise<BulkInviteResult> {
    const emails = input.users.map((item) => item.email.toLowerCase());
    if (new Set(emails).size !== emails.length) {
      throw new BadRequestException('Each bulk invitation must have a unique email address');
    }

    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const deliveries: Array<{ email: string; activationUrl: string; invitationId: string }> = [];

    await this.prisma.$transaction(async (tx) => {
      for (const item of input.users) {
        const email = item.email.toLowerCase();
        const existing = await tx.user.findUnique({ where: { email } });
        if (existing) {
          throw new ConflictException(`An account already exists for ${item.email}`);
        }
        const pendingInvitation = await tx.userInvitation.findFirst({
          where: { email, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
        });
        if (pendingInvitation) {
          throw new ConflictException(`An active invitation already exists for ${item.email}`);
        }
        if (item.batchId) {
          const batch = await tx.batch.findUnique({ where: { id: item.batchId }, select: { id: true, institutionId: true } });
          if (!batch) throw new BadRequestException(`Batch ${item.batchId} does not exist`);
          const targetInstId = item.institutionId || item.collegeId;
          if (targetInstId && batch.institutionId !== targetInstId) {
            throw new BadRequestException(`Batch ${item.batchId} does not belong to institution ${targetInstId}`);
          }
          if (!targetInstId) {
            item.institutionId = batch.institutionId;
          }
        }
        const effectiveInstId = item.institutionId || item.collegeId;
        if (effectiveInstId) {
          const inst = await tx.institution.findUnique({ where: { id: effectiveInstId }, select: { id: true } });
          if (!inst) throw new BadRequestException(`Institution ${effectiveInstId} does not exist`);
        }
      }

      for (const item of input.users) {
        const email = item.email.toLowerCase();
        const rawToken = randomBytes(32).toString('base64url');
        const effectiveInstId = item.institutionId || item.collegeId;
        const invitation = await tx.userInvitation.create({
          data: {
            email,
            name: item.name,
            role: item.role,
            institutionId: effectiveInstId,
            batchId: item.batchId,
            rollNo: item.rollNo,
            tokenHash: this.hashInvitationToken(rawToken),
            expiresAt,
          },
        });
        const activationUrl = `${appUrl}/accept-invitation?token=${rawToken}`;
        const encryptedActivationUrl = this.encryptActivationUrl(activationUrl);
        await tx.invitationDelivery.create({
          data: { invitationId: invitation.id, email, activationUrl: encryptedActivationUrl },
        });
        deliveries.push({ email, activationUrl, invitationId: invitation.id });
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    const debugInvitationUrls = process.env.NODE_ENV !== 'production' && process.env.DEBUG_INVITATION_URLS === 'true';
    for (const delivery of deliveries) {
      if (debugInvitationUrls) {
        this.logger.log(`DEV invitation for ${delivery.email}: ${delivery.activationUrl}`);
      } else {
        this.logger.log(`Invitation queued for ${delivery.email}`);
      }
    }

    // Dispatch rich invitation emails asynchronously
    if (this.mailService) {
      const mailService = this.mailService;
      const batchIds = [...new Set(input.users.map((u) => u.batchId).filter(Boolean))] as string[];
      const institutionIds = [...new Set(input.users.map((u) => u.institutionId || u.collegeId).filter(Boolean))] as string[];

      const [batches, institutions] = await Promise.all([
        batchIds.length > 0 ? this.prisma.batch.findMany({ where: { id: { in: batchIds } }, select: { id: true, name: true } }) : [],
        institutionIds.length > 0 ? this.prisma.institution.findMany({ where: { id: { in: institutionIds } }, select: { id: true, name: true } }) : [],
      ]);

      const batchMap = new Map(batches.map((b) => [b.id, b.name]));
      const institutionMap = new Map(institutions.map((c) => [c.id, c.name]));

      for (const item of input.users) {
        const delivery = deliveries.find((d) => d.email.toLowerCase() === item.email.toLowerCase());
        if (delivery) {
          const batchName = item.batchId ? batchMap.get(item.batchId) : undefined;
          const instId = item.institutionId || item.collegeId;
          const institutionName = instId ? institutionMap.get(instId) : undefined;
          this.prisma.invitationDelivery
            .updateMany({
              where: { invitationId: delivery.invitationId, status: 'PENDING' },
              data: { status: 'CLAIMED', claimedAt: new Date(), attempts: { increment: 1 } },
            })
            .then(async (claim) => {
              if (claim.count !== 1) return;
              let sendSucceeded = false;
              try {
                const res = await mailService.sendInvitationEmail({
                  to: item.email,
                  name: item.name,
                  activationUrl: delivery.activationUrl,
                  batchName,
                  institutionName,
                  collegeName: institutionName,
                  expiresInHours: 72,
                });
                sendSucceeded = Boolean(res?.success);
              } catch (err: any) {
                sendSucceeded = false;
                this.logger.warn(`Failed to dispatch background invitation email to ${item.email}: ${err.message}`);
              }

              if (sendSucceeded) {
                try {
                  await this.prisma.invitationDelivery.updateMany({
                    where: { invitationId: delivery.invitationId, status: 'CLAIMED' },
                    data: { activationUrl: null as any, status: 'DELIVERED' },
                  });
                } catch (finalizeErr: any) {
                  this.logger.error(
                    `Invitation email sent to ${item.email}, but failed to finalize delivery record: ${finalizeErr.message}`,
                  );
                }
              } else {
                await this.prisma.invitationDelivery
                  .updateMany({
                    where: { invitationId: delivery.invitationId, status: 'CLAIMED' },
                    data: { status: 'PENDING' },
                  })
                  .catch((revertErr) => {
                    this.logger.warn(
                      `Failed to reset invitation delivery status to PENDING for ${item.email}: ${revertErr.message}`,
                    );
                  });
              }
            })
            .catch((err) => {
              this.logger.warn(`Failed to claim invitation delivery for ${item.email}: ${err.message}`);
            });
        }
      }
    }

    const invitationLinks = deliveries.map(({ email, activationUrl }) => ({ email, activationUrl }));
    return { invited: input.users.length, expiresInHours: 72, invitationLinks };
  }

  async acceptInvitation(token: string, password: string): Promise<SanitizedUser> {
    const tokenHash = this.hashInvitationToken(token);
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const invitation = await tx.userInvitation.findUnique({ where: { tokenHash } });
      if (!invitation || invitation.acceptedAt || invitation.revokedAt || invitation.expiresAt <= now) {
        throw new UnauthorizedException('This invitation is invalid or has expired');
      }
      const existing = await tx.user.findUnique({ where: { email: invitation.email } });
      if (existing) throw new ConflictException('An account already exists for this email address');

      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name: invitation.name,
          passwordHash: await bcrypt.hash(password, 12),
          globalRole: invitation.role,
          rollNo: invitation.rollNo,
        },
        select: userSanitizedSelect,
      });
      if (invitation.institutionId) {
        await tx.institutionMembership.create({
          data: { userId: user.id, institutionId: invitation.institutionId, role: invitation.role },
        });
      }
      if (invitation.batchId) {
        await tx.batchStudent.upsert({
          where: {
            batchId_userId: {
              batchId: invitation.batchId,
              userId: user.id,
            },
          },
          update: {
            rollNo: invitation.rollNo,
          },
          create: {
            batchId: invitation.batchId,
            userId: user.id,
            rollNo: invitation.rollNo,
          },
        });
      }
      const consumed = await tx.userInvitation.updateMany({
        where: { id: invitation.id, acceptedAt: null, revokedAt: null },
        data: { acceptedAt: now },
      });
      if (consumed.count !== 1) throw new UnauthorizedException('This invitation has already been used');

      await tx.invitationDelivery.updateMany({
        where: { invitationId: invitation.id },
        data: { activationUrl: null as any, status: 'DELIVERED' },
      });

      return user as unknown as SanitizedUser;
    });
  }

  encryptActivationUrl(url: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKeys[0], iv);
    const encrypted = Buffer.concat([cipher.update(url, 'utf8'), cipher.final()]);
    return `enc:v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${encrypted.toString('base64url')}`;
  }

  decryptActivationUrl(value: string): string {
    if (!value.startsWith('enc:v1:')) return value;
    const [, , iv, tag, encrypted] = value.split(':');
    for (const key of this.encryptionKeys) {
      try {
        const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
        decipher.setAuthTag(Buffer.from(tag, 'base64url'));
        return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
      } catch {
        continue;
      }
    }
    throw new UnauthorizedException('Unable to decrypt invitation URL');
  }

  async processPendingDeliveries(
    sender?: (delivery: { email: string; activationUrl: string; invitationId: string }) => Promise<boolean>,
  ): Promise<{ delivered: number; expired: number }> {
    const now = new Date();
    const expiredResult = await this.prisma.invitationDelivery.updateMany({
      where: {
        status: 'PENDING',
        invitation: { expiresAt: { lte: now } },
      },
      data: { activationUrl: null as any, status: 'EXPIRED' },
    });

    // Reset stale CLAIMED deliveries older than 10 minutes back to PENDING
    await this.prisma.invitationDelivery.updateMany({
      where: {
        status: 'CLAIMED',
        claimedAt: { lte: new Date(Date.now() - 10 * 60 * 1000) },
      },
      data: { status: 'PENDING', updatedAt: new Date() },
    });

    const pendingDeliveries = await this.prisma.invitationDelivery.findMany({
      where: {
        status: 'PENDING',
        invitation: { expiresAt: { gt: now }, acceptedAt: null, revokedAt: null },
      },
      include: { invitation: true },
    });

    let deliveredCount = 0;
    for (const delivery of pendingDeliveries) {
      if (!delivery.activationUrl) continue;
      // Claim the delivery to avoid concurrent processing
const claim = await this.prisma.invitationDelivery.updateMany({
  where: { id: delivery.id, status: 'PENDING' },
  data: { status: 'CLAIMED', claimedAt: new Date(), attempts: { increment: 1 } },
});
if (claim.count !== 1) continue; // already claimed by another worker
const decryptedUrl = this.decryptActivationUrl(delivery.activationUrl);
      let success = false; // default to failure unless sender succeeds
      if (sender) {
        try {
          success = await sender({ email: delivery.email, activationUrl: decryptedUrl, invitationId: delivery.invitationId });
        } catch {
          success = false;
        }
      }

      if (success) {
        await this.prisma.invitationDelivery.update({
          where: { id: delivery.id },
          data: { activationUrl: null as any, status: 'DELIVERED' },
        });
        deliveredCount++;
      } else {
        // Release claim back to PENDING for retry, keep activationUrl unchanged
        await this.prisma.invitationDelivery.update({
          where: { id: delivery.id },
          data: { status: 'PENDING' },
        });
      }
    }

    return { delivered: deliveredCount, expired: expiredResult.count };
  }

  private hashInvitationToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
