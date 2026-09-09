import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role, User, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BulkInviteUsersInput } from './dto/bulk-invite.input.js';
import { CreateUserInput } from './dto/create-user.input.js';
import { UpdateUserInput } from './dto/update-user.input.js';

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
  location: true,
  birthDate: true,
  githubUrl: true,
  linkedinUrl: true,
  websiteUrl: true,
  resumeUrl: true,
  resumeFileName: true,
  contestRating: true,
  ratingTier: true,
  createdAt: true,
  updatedAt: true,
  memberships: {
    select: {
      id: true,
      collegeId: true,
      role: true,
      college: {
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
  constructor(private prisma: PrismaService) {}

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
          { email: { startsWith: handleOrId.toLowerCase() + '@' } },
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
      handle: user.email.split('@')[0],
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

  async getSuperAdminMetrics() {
    const [
      collegesCount,
      studentsCount,
      facultyCount,
      adminsCount,
      totalUsersCount,
      problemsCount,
      contestsCount,
      submissionsCount,
    ] = await Promise.all([
      this.prisma.college.count(),
      this.prisma.user.count({ where: { globalRole: Role.STUDENT } }),
      this.prisma.user.count({ where: { globalRole: Role.FACULTY } }),
      this.prisma.user.count({
        where: {
          globalRole: { in: [Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN] },
        },
      }),
      this.prisma.user.count(),
      this.prisma.problem.count(),
      this.prisma.contest.count(),
      this.prisma.submission.count(),
    ]);

    return {
      collegesCount,
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
    collegeId?: string,
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

    if (collegeId) {
      where.memberships = {
        some: {
          collegeId,
        },
      };
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (args.sortBy) {
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
      },
      select: userSanitizedSelect,
    });

    return user as unknown as SanitizedUser;
  }

  async createWithInput(input: CreateUserInput): Promise<SanitizedUser> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.createUser({
      email: input.email,
      name: input.name,
      passwordHash,
      globalRole: input.globalRole,
      status: input.status,
    });

    if (input.collegeId) {
      await this.prisma.collegeMembership.create({
        data: {
          userId: user.id,
          collegeId: input.collegeId,
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
    if (input.location !== undefined) data.location = input.location;
    if (input.birthDate !== undefined) data.birthDate = input.birthDate;
    if (input.githubUrl !== undefined) data.githubUrl = input.githubUrl;
    if (input.linkedinUrl !== undefined) data.linkedinUrl = input.linkedinUrl;
    if (input.websiteUrl !== undefined) data.websiteUrl = input.websiteUrl;
    if (input.resumeUrl !== undefined) data.resumeUrl = input.resumeUrl;
    if (input.resumeFileName !== undefined) data.resumeFileName = input.resumeFileName;
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

  async bulkInvite(input: BulkInviteUsersInput): Promise<SanitizedUser[]> {
    const defaultPasswordHash = await bcrypt.hash('TempPassword123!', 10);
    const createdUsers: SanitizedUser[] = [];

    for (const item of input.users) {
      try {
        const existing = await this.findByEmail(item.email);
        if (existing) continue;

        const user = await this.createUser({
          email: item.email,
          name: item.name,
          passwordHash: defaultPasswordHash,
          globalRole: item.role,
        });

        if (item.collegeId) {
          await this.prisma.collegeMembership.create({
            data: {
              userId: user.id,
              collegeId: item.collegeId,
              role: item.role,
            },
          });
        }

        createdUsers.push(user);
      } catch {
        // Skip duplicate or error rows gracefully
      }
    }

    return createdUsers;
  }
}
