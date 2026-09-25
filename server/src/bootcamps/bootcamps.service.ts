import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBootcampDto } from './dto/create-bootcamp.dto.js';
import { QueryBootcampDto } from './dto/query-bootcamp.dto.js';
import { UpdateBootcampDto } from './dto/update-bootcamp.dto.js';
import { UpdateBootcampProgressDto } from './dto/update-progress.dto.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';

@Injectable()
export class BootcampsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private hasInstitutionAccess(user: CurrentUserPayload, institutionId: string): boolean {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return true;
    }
    return Boolean(
      user.memberships?.some(
        (m) =>
          m.institutionId === institutionId &&
          (m.role === Role.INSTITUTION_ADMIN || m.role === Role.FACULTY),
      ),
    );
  }

  async createBootcamp(userId: string, dto: CreateBootcampDto, user?: CurrentUserPayload) {
    if (dto.institutionId && user && !this.hasInstitutionAccess(user, dto.institutionId)) {
      throw new ForbiddenException('You do not have permission to create bootcamps for this institution');
    }

    let slug = this.slugify(dto.title);
    if (!slug) {
      slug = `bootcamp-${Date.now()}`;
    }

    const existing = await this.prisma.bootcamp.findUnique({
      where: { slug },
    });

    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const bootcamp = await this.prisma.bootcamp.create({
      data: {
        slug,
        title: dto.title,
        subtitle: dto.subtitle,
        description: dto.description,
        track: dto.track,
        instructor: dto.instructor,
        instructorRole: dto.instructorRole || 'Principal Architect',
        instructorAvatar: dto.instructorAvatar,
        duration: dto.duration,
        level: dto.level || 'Intermediate',
        badge: dto.badge,
        rating: dto.rating ?? 4.9,
        maxSeats: dto.maxSeats ?? 100,
        totalSessions: dto.totalSessions ?? 12,
        status: dto.status || 'PUBLISHED',
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        nextSessionDate: dto.nextSessionDate ? new Date(dto.nextSessionDate) : null,
        nextSessionTopic: dto.nextSessionTopic,
        syllabus: dto.syllabus ? (dto.syllabus as any) : undefined,
        institutionId: dto.institutionId || null,
        createdById: userId,
      },
    });

    return bootcamp;
  }

  async updateBootcamp(id: string, dto: UpdateBootcampDto, user?: CurrentUserPayload) {
    const bootcamp = await this.prisma.bootcamp.findUnique({ where: { id } });
    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp with ID ${id} not found`);
    }

    if (user && user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
      const isCreator = bootcamp.createdById === user.id;
      const isInstStaff = bootcamp.institutionId
        ? this.hasInstitutionAccess(user, bootcamp.institutionId)
        : false;

      if (!isCreator && !isInstStaff) {
        throw new ForbiddenException('You do not have permission to modify this bootcamp');
      }

      if (dto.institutionId && dto.institutionId !== bootcamp.institutionId) {
        if (!this.hasInstitutionAccess(user, dto.institutionId)) {
          throw new ForbiddenException('You do not have permission to assign bootcamps to the specified institution');
        }
      }
    }

    let slug = bootcamp.slug;
    if (dto.title && dto.title !== bootcamp.title) {
      slug = this.slugify(dto.title);
      if (!slug) {
        slug = `bootcamp-${Date.now()}`;
      }
      const existing = await this.prisma.bootcamp.findUnique({
        where: { slug },
      });
      if (existing && existing.id !== id) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    return this.prisma.bootcamp.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title, slug } : {}),
        ...(dto.subtitle !== undefined ? { subtitle: dto.subtitle } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.track ? { track: dto.track } : {}),
        ...(dto.instructor ? { instructor: dto.instructor } : {}),
        ...(dto.instructorRole !== undefined ? { instructorRole: dto.instructorRole } : {}),
        ...(dto.instructorAvatar !== undefined ? { instructorAvatar: dto.instructorAvatar } : {}),
        ...(dto.duration ? { duration: dto.duration } : {}),
        ...(dto.level ? { level: dto.level } : {}),
        ...(dto.badge !== undefined ? { badge: dto.badge } : {}),
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.maxSeats !== undefined ? { maxSeats: dto.maxSeats } : {}),
        ...(dto.totalSessions !== undefined ? { totalSessions: dto.totalSessions } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate ? new Date(dto.startDate) : null } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
        ...(dto.nextSessionDate !== undefined ? { nextSessionDate: dto.nextSessionDate ? new Date(dto.nextSessionDate) : null } : {}),
        ...(dto.nextSessionTopic !== undefined ? { nextSessionTopic: dto.nextSessionTopic } : {}),
        ...(dto.syllabus !== undefined ? { syllabus: dto.syllabus as any } : {}),
        ...(dto.institutionId !== undefined ? { institutionId: dto.institutionId || null } : {}),
      },
    });
  }

  async deleteBootcamp(id: string, user?: CurrentUserPayload) {
    const bootcamp = await this.prisma.bootcamp.findUnique({ where: { id } });
    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp with ID ${id} not found`);
    }

    if (user && user.globalRole !== Role.SUPER_ADMIN && user.globalRole !== Role.PLATFORM_ADMIN) {
      const isCreator = bootcamp.createdById === user.id;
      const isInstStaff = bootcamp.institutionId
        ? this.hasInstitutionAccess(user, bootcamp.institutionId)
        : false;

      if (!isCreator && !isInstStaff) {
        throw new ForbiddenException('You do not have permission to delete this bootcamp');
      }
    }

    return this.prisma.bootcamp.delete({ where: { id } });
  }

  async findAll(query: QueryBootcampDto, currentUserId?: string) {
    const { search, track, status, institutionId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (track && track !== 'All') {
      where.track = { contains: track, mode: 'insensitive' };
    }

    if (institutionId) {
      where.institutionId = institutionId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { track: { contains: search, mode: 'insensitive' } },
        { instructor: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.bootcamp.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          institution: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { enrollments: true, sessions: true },
          },
          ...(currentUserId
            ? {
                enrollments: {
                  where: { userId: currentUserId },
                  select: {
                    id: true,
                    status: true,
                    progressPct: true,
                    sessionsCompleted: true,
                    enrolledAt: true,
                  },
                },
              }
            : {}),
        },
      }),
      this.prisma.bootcamp.count({ where }),
    ]);

    // Shape items to attach user-specific enrollment state
    const shapedItems = items.map((bc: any) => {
      const userEnrollment = bc.enrollments && bc.enrollments[0];
      let userStatus: 'Enrolled' | 'Available' | 'Completed' = 'Available';
      let progressPct = 0;
      let sessionsCompleted = 0;

      if (userEnrollment) {
        if (userEnrollment.status === 'COMPLETED' || userEnrollment.progressPct >= 100) {
          userStatus = 'Completed';
          progressPct = 100;
          sessionsCompleted = bc.totalSessions;
        } else {
          userStatus = 'Enrolled';
          progressPct = userEnrollment.progressPct;
          sessionsCompleted = userEnrollment.sessionsCompleted;
        }
      }

      return {
        id: bc.id,
        slug: bc.slug,
        title: bc.title,
        subtitle: bc.subtitle,
        description: bc.description,
        track: bc.track,
        instructor: bc.instructor,
        instructorRole: bc.instructorRole,
        instructorAvatar: bc.instructorAvatar,
        duration: bc.duration,
        level: bc.level,
        badge: bc.badge,
        rating: bc.rating,
        maxSeats: bc.maxSeats,
        enrolledStudents: bc.enrolledCount,
        totalSessions: bc.totalSessions,
        status: userStatus,
        progressPct,
        sessionsCompleted,
        nextSessionDate: bc.nextSessionDate ? bc.nextSessionDate.toISOString() : 'TBA',
        nextSessionTopic: bc.nextSessionTopic || 'Live Architecture Session',
        syllabus: Array.isArray(bc.syllabus) ? bc.syllabus : [],
        rawStatus: bc.status,
        createdAt: bc.createdAt,
      };
    });

    return {
      items: shapedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string, currentUserId?: string) {
    const bootcamp = await this.prisma.bootcamp.findUnique({
      where: { slug },
      include: {
        institution: {
          select: { id: true, name: true, code: true },
        },
        sessions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { enrollments: true },
        },
        ...(currentUserId
          ? {
              enrollments: {
                where: { userId: currentUserId },
                select: {
                  id: true,
                  status: true,
                  progressPct: true,
                  sessionsCompleted: true,
                  enrolledAt: true,
                },
              },
            }
          : {}),
      },
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp with slug '${slug}' not found`);
    }

    return bootcamp;
  }

  async enroll(bootcampId: string, userId: string) {
    const existing = await this.prisma.bootcampEnrollment.findUnique({
      where: {
        userId_bootcampId: {
          userId,
          bootcampId,
        },
      },
    });

    if (existing) {
      return {
        message: 'Already enrolled in this bootcamp',
        enrollment: existing,
      };
    }

    const bootcamp = await this.prisma.bootcamp.findUnique({
      where: { id: bootcampId },
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp with ID ${bootcampId} not found`);
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const updateResult = await tx.bootcamp.updateMany({
          where: {
            id: bootcampId,
            status: { notIn: ['ARCHIVED', 'COMPLETED'] },
            enrolledCount: { lt: bootcamp.maxSeats },
          },
          data: {
            enrolledCount: { increment: 1 },
          },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException('Bootcamp is full or not open for enrollment');
        }

        const enrollment = await tx.bootcampEnrollment.create({
          data: {
            userId,
            bootcampId,
            status: 'ACTIVE',
            progressPct: 0,
            sessionsCompleted: 0,
          },
        });

        return enrollment;
      });

      return {
        message: 'Successfully enrolled in bootcamp',
        enrollment: result,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const current = await this.prisma.bootcampEnrollment.findUnique({
          where: { userId_bootcampId: { userId, bootcampId } },
        });
        return {
          message: 'Already enrolled in this bootcamp',
          enrollment: current,
        };
      }
      throw err;
    }
  }

  async updateProgress(bootcampId: string, userId: string, dto: UpdateBootcampProgressDto) {
    const enrollment = await this.prisma.bootcampEnrollment.findUnique({
      where: {
        userId_bootcampId: {
          userId,
          bootcampId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const wasCompleted = enrollment.status === 'COMPLETED';
    const isNowCompleted = wasCompleted || dto.progressPct >= 100;

    return this.prisma.bootcampEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPct: wasCompleted ? 100 : Math.min(100, Math.max(0, dto.progressPct)),
        ...(dto.sessionsCompleted !== undefined ? { sessionsCompleted: dto.sessionsCompleted } : {}),
        status: isNowCompleted ? 'COMPLETED' : 'ACTIVE',
        completedAt: enrollment.completedAt || (isNowCompleted ? new Date() : null),
      },
    });
  }
}
