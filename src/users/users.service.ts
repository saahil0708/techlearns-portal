import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

    if (input.email) {
      data.email = input.email.toLowerCase();
    }
    if (input.name) {
      data.name = input.name;
    }
    if (input.globalRole) {
      data.globalRole = input.globalRole;
    }
    if (input.status) {
      data.status = input.status;
    }
    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: userSanitizedSelect,
    });

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
