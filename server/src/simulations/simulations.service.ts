import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto.js';
import { QueryTicketDto } from './dto/query-ticket.dto.js';
import { Role } from '@prisma/client';

@Injectable()
export class SimulationsService {
  constructor(private readonly prisma: PrismaService) {}

  private checkTicketAuth(
    ticket: { assigneeId: string; institutionId: string | null },
    currentUser: CurrentUserPayload,
    actionName: string = 'modify',
  ) {
    const isOwner = ticket.assigneeId === currentUser.id;
    const isGlobalSuperAdmin = currentUser.globalRole === Role.SUPER_ADMIN;
    const isInstitutionAdmin =
      Boolean(ticket.institutionId) &&
      currentUser.memberships?.some(
        (m) =>
          (m.role === Role.SUPER_ADMIN || m.role === Role.INSTITUTION_ADMIN) &&
          m.institutionId === ticket.institutionId,
      );

    if (!isOwner && !isGlobalSuperAdmin && !isInstitutionAdmin) {
      throw new ForbiddenException(`Not authorized to ${actionName} this ticket`);
    }
  }

  async createTicket(
    userId: string,
    dto: CreateTicketDto,
    currentUser: CurrentUserPayload,
  ) {
    const institutionId = currentUser.memberships?.[0]?.institutionId ?? null;
    return this.prisma.sprintTicket.create({
      data: {
        key: dto.key,
        title: dto.title,
        domain: dto.domain ?? 'Engineering',
        priority: dto.priority ?? 'P1 - High',
        storyPoints: dto.storyPoints ?? 3,
        status: dto.status ?? 'Backlog',
        assigneeId: userId,
        institutionId,
        prNumber: dto.prNumber,
        techLeadFeedback: dto.techLeadFeedback,
        description: dto.description,
      },
      include: {
        assignee: {
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

  async findAll(query: QueryTicketDto, currentUser?: CurrentUserPayload) {
    const { search, domain, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (domain) {
      where.domain = domain;
    }

    if (status) {
      where.status = status;
    }

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { key: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
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
      this.prisma.sprintTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.sprintTicket.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(idOrKey: string, currentUser?: CurrentUserPayload) {
    const ticket = await this.prisma.sprintTicket.findFirst({
      where: {
        OR: [{ id: idOrKey }, { key: idOrKey }],
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Sprint ticket not found');

    const isGlobalSuperAdmin = currentUser?.globalRole === Role.SUPER_ADMIN;
    if (ticket.institutionId && !isGlobalSuperAdmin && currentUser) {
      const userInstitutionIds =
        currentUser.memberships
          ?.map((m) => m.institutionId)
          .filter((id): id is string => Boolean(id)) ?? [];

      if (!userInstitutionIds.includes(ticket.institutionId)) {
        throw new NotFoundException('Sprint ticket not found');
      }
    }

    return ticket;
  }

  async updateTicket(
    id: string,
    dto: UpdateTicketDto,
    currentUser: CurrentUserPayload,
  ) {
    const ticket = await this.prisma.sprintTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Sprint ticket not found');

    this.checkTicketAuth(ticket, currentUser, 'modify');

    return this.prisma.sprintTicket.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        assignee: {
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

  async submitPullRequest(
    id: string,
    prNumber: string,
    currentUser: CurrentUserPayload,
  ) {
    const ticket = await this.prisma.sprintTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Sprint ticket not found');

    this.checkTicketAuth(ticket, currentUser, 'submit PR for');

    return this.prisma.sprintTicket.update({
      where: { id },
      data: {
        prNumber,
        status: 'In Review',
        techLeadFeedback:
          'Automated CI/CD checks running. Code analysis passed with 0 warnings. Ready for lead sign-off.',
      },
      include: {
        assignee: {
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

  async deleteTicket(id: string, currentUser: CurrentUserPayload) {
    const ticket = await this.prisma.sprintTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Sprint ticket not found');

    this.checkTicketAuth(ticket, currentUser, 'delete');

    await this.prisma.sprintTicket.delete({ where: { id } });
    return { success: true, message: 'Ticket deleted successfully' };
  }
}
