import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { QueryProjectDto } from './dto/query-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Role } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private checkProjectAuth(
    project: { userId: string; institutionId: string | null },
    currentUser: CurrentUserPayload,
    actionName: string = 'modify',
  ) {
    const isOwner = project.userId === currentUser.id;
    const isGlobalSuperAdmin = currentUser.globalRole === Role.SUPER_ADMIN;
    const isInstitutionAdmin =
      Boolean(project.institutionId) &&
      currentUser.memberships?.some(
        (m) =>
          (m.role === Role.SUPER_ADMIN || m.role === Role.INSTITUTION_ADMIN) &&
          m.institutionId === project.institutionId,
      );

    if (!isOwner && !isGlobalSuperAdmin && !isInstitutionAdmin) {
      throw new ForbiddenException(`Not authorized to ${actionName} this project`);
    }
  }

  async createProject(
    userId: string,
    dto: CreateProjectDto,
    currentUser: CurrentUserPayload,
  ) {
    const { milestones, ...projectData } = dto;

    const totalMilestones = milestones ? milestones.length : 0;
    const milestonesCompleted = milestones
      ? milestones.filter((m) => m.done).length
      : 0;

    const progressPct =
      totalMilestones > 0
        ? Math.round((milestonesCompleted / totalMilestones) * 100)
        : (projectData.progressPct ?? 0);

    const institutionId = currentUser.memberships?.[0]?.institutionId ?? null;

    return this.prisma.studentProject.create({
      data: {
        title: projectData.title,
        category: projectData.category ?? 'Distributed Systems',
        difficulty: projectData.difficulty ?? 'Intermediate',
        status: projectData.status ?? 'In Progress',
        progressPct,
        techStack: projectData.techStack ?? [],
        iconType: projectData.iconType ?? 'kv',
        accentColor: projectData.accentColor ?? '#7C3AED',
        bgColor: projectData.bgColor ?? '#F5F3FF',
        repoUrl: projectData.repoUrl,
        liveUrl: projectData.liveUrl,
        milestonesCompleted,
        totalMilestones,
        description: projectData.description,
        ports: projectData.ports ?? [],
        services: projectData.services ?? [],
        terminalLogs: projectData.terminalLogs ?? [],
        userId,
        institutionId,
        milestones: milestones
          ? {
              create: milestones.map((m, index) => ({
                title: m.title,
                phase: m.phase ?? 'Phase 1',
                done: m.done ?? false,
                order: m.order ?? index,
              })),
            }
          : undefined,
      },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryProjectDto, currentUser?: CurrentUserPayload) {
    const { search, category, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { techStack: { has: search } },
        ],
      });
    }

    const isGlobalSuperAdmin = currentUser?.globalRole === Role.SUPER_ADMIN;
    if (!isGlobalSuperAdmin) {
      const institutionIds =
        currentUser?.memberships
          ?.map((m) => m.institutionId)
          .filter((id): id is string => Boolean(id)) ?? [];

      if (institutionIds.length > 0) {
        andConditions.push({
          OR: [
            { institutionId: { in: institutionIds } },
            { institutionId: null },
          ],
        });
      } else {
        andConditions.push({
          institutionId: null,
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [items, total] = await Promise.all([
      this.prisma.studentProject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          milestones: {
            orderBy: { order: 'asc' },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.studentProject.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser?: CurrentUserPayload) {
    const project = await this.prisma.studentProject.findUnique({
      where: { id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (currentUser && currentUser.globalRole !== Role.SUPER_ADMIN) {
      if (project.institutionId !== null) {
        const hasMatchingMembership = currentUser.memberships?.some(
          (m) => m.institutionId === project.institutionId,
        );
        if (!hasMatchingMembership) {
          throw new ForbiddenException('Project not accessible in your institution');
        }
      }
    }

    return project;
  }

  async updateProject(
    id: string,
    dto: UpdateProjectDto,
    currentUser: CurrentUserPayload,
  ) {
    const project = await this.prisma.studentProject.findUnique({
      where: { id },
    });
    if (!project) throw new NotFoundException('Project not found');

    this.checkProjectAuth(project, currentUser, 'modify');

    // Exclude progressPct from user payload to preserve derived calculation
    const { milestones, progressPct, ...projectData } = dto;

    return this.prisma.studentProject.update({
      where: { id },
      data: {
        ...projectData,
      },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deleteProject(id: string, currentUser: CurrentUserPayload) {
    const project = await this.prisma.studentProject.findUnique({
      where: { id },
    });
    if (!project) throw new NotFoundException('Project not found');

    this.checkProjectAuth(project, currentUser, 'delete');

    await this.prisma.studentProject.delete({ where: { id } });
    return { success: true, message: 'Project deleted successfully' };
  }

  async toggleMilestone(
    projectId: string,
    milestoneId: string,
    currentUser: CurrentUserPayload,
    targetDone?: boolean,
  ) {
    const milestone = await this.prisma.projectMilestone.findFirst({
      where: { id: milestoneId, projectId },
      include: { project: true },
    });

    if (!milestone) throw new NotFoundException('Milestone not found');

    this.checkProjectAuth(milestone.project, currentUser, 'toggle milestone on');

    const nextDone = targetDone !== undefined ? targetDone : !milestone.done;
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const freshMilestone = await tx.projectMilestone.findUnique({
              where: { id: milestoneId },
            });

            if (!freshMilestone) throw new NotFoundException('Milestone not found');

            const updated = await tx.projectMilestone.update({
              where: { id: milestoneId },
              data: { done: nextDone },
            });

            const allMilestones = await tx.projectMilestone.findMany({
              where: { projectId },
            });

            const totalMilestones = allMilestones.length;
            const milestonesCompleted = allMilestones.filter((m) => m.done).length;
            const progressPct =
              totalMilestones > 0
                ? Math.round((milestonesCompleted / totalMilestones) * 100)
                : 0;

            const status =
              progressPct === 100
                ? 'Completed'
                : progressPct > 0
                  ? 'In Progress'
                  : 'Available';

            const updatedProject = await tx.studentProject.update({
              where: { id: projectId },
              data: {
                totalMilestones,
                milestonesCompleted,
                progressPct,
                status,
              },
            });

            return {
              ...updated,
              projectStatus: updatedProject.status,
              progressPct: updatedProject.progressPct,
              milestonesCompleted: updatedProject.milestonesCompleted,
            };
          },
          { isolationLevel: 'Serializable' as any },
        );
      } catch (err: any) {
        lastError = err;
        if (err?.code === 'P2034' && attempt < maxRetries) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new InternalServerErrorException('Failed to toggle milestone after retries');
  }
}
