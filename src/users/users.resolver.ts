import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role, UserStatus } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { BulkInviteUsersInput } from './dto/bulk-invite.input.js';
import { CreateUserInput } from './dto/create-user.input.js';
import { UpdateUserInput } from './dto/update-user.input.js';
import { AdminMetricsType } from './types/admin-metrics.type.js';
import { AuditLogItemType } from './types/audit-log.type.js';
import { StudentProfileType } from './types/student-stats.type.js';
import { UserType } from './types/user.type.js';
import { UsersConnection } from './types/users-connection.type.js';
import { UsersService } from './users.service.js';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => UsersConnection, { name: 'users' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  async getUsers(
    @Args() paginationArgs: PaginationArgs,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
    @Args('role', { type: () => Role, nullable: true }) role?: Role,
    @Args('status', { type: () => UserStatus, nullable: true }) status?: UserStatus,
    @Args('collegeId', { type: () => String, nullable: true }) collegeId?: string,
  ) {
    const isSuperAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin) {
      const adminCollegeIds =
        currentUser.memberships
          ?.filter((m) => m.role === Role.COLLEGE_ADMIN)
          .map((m) => m.collegeId) || [];

      if (adminCollegeIds.length === 0) {
        throw new ForbiddenException('You do not have college admin privileges');
      }

      if (collegeId) {
        if (!adminCollegeIds.includes(collegeId)) {
          throw new ForbiddenException('You can only list users within your own college');
        }
      } else {
        collegeId = adminCollegeIds[0];
      }
    }

    return this.usersService.findPaginated(paginationArgs, role, status, collegeId);
  }

  @Query(() => UserType, { name: 'user', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getUser(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    const isSelf = currentUser.id === id;
    const isAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN ||
      currentUser.globalRole === Role.COLLEGE_ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this user profile.');
    }

    return this.usersService.findById(id);
  }

  @Query(() => UserType, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getMe(@GqlCurrentUser() currentUser: CurrentUserPayload) {
    return this.usersService.getProfile(currentUser.id);
  }

  @Query(() => StudentProfileType, { name: 'studentProfile' })
  @UseGuards(GqlAuthGuard)
  async getStudentProfile(
    @Args('handleOrId', { type: () => String }) handleOrId: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    const profile = await this.usersService.getStudentProfile(handleOrId);
    const isOwnerOrAdmin =
      profile.id === currentUser.id ||
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    if (!isOwnerOrAdmin) {
      profile.email = undefined;
      profile.phone = null as any;
      profile.location = null as any;
      profile.resumeFileName = null as any;
      profile.resumeUrl = null as any;
      if (profile.submissions) {
        profile.submissions = profile.submissions.map((s) => ({
          ...s,
          codeSnippet: undefined,
        }));
      }
    }
    return profile;
  }

  @Query(() => AdminMetricsType, { name: 'adminMetrics' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  async getAdminMetrics() {
    return this.usersService.getSuperAdminMetrics();
  }

  @Query(() => [AuditLogItemType], { name: 'adminAuditLogs' })
  @UseGuards(GqlAuthGuard)
  async getAdminAuditLogs(@GqlCurrentUser() currentUser: CurrentUserPayload) {
    return this.usersService.getAdminAuditLogs(currentUser.id);
  }

  @Mutation(() => UserType, { name: 'createUser' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  async createUser(
    @Args('input') input: CreateUserInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    const isSuperAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin) {
      if (!input.collegeId) {
        throw new ForbiddenException('College admin must specify a collegeId');
      }
      const hasAdmin = currentUser.memberships?.some(
        (m) => m.collegeId === input.collegeId && m.role === Role.COLLEGE_ADMIN,
      );
      if (!hasAdmin) {
        throw new ForbiddenException('You can only create users within your assigned college');
      }
      if ((input.globalRole as Role) === Role.SUPER_ADMIN || (input.globalRole as Role) === Role.PLATFORM_ADMIN) {
        throw new ForbiddenException('College admins cannot assign platform administrator roles');
      }
    }

    return this.usersService.createWithInput(input);
  }

  @Mutation(() => UserType, { name: 'updateUser' })
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    const isAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    if (currentUser.id !== id && !isAdmin) {
      throw new ForbiddenException('You are not authorized to update another user profile');
    }

    if (!isAdmin) {
      if (
        input.globalRole !== undefined ||
        input.status !== undefined ||
        input.contestRating !== undefined ||
        input.ratingTier !== undefined ||
        input.password !== undefined ||
        input.email !== undefined
      ) {
        throw new ForbiddenException('You do not have permission to modify privileged user attributes');
      }
    }

    return this.usersService.updateUser(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteUser' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  async deleteUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.deleteUser(id);
  }

  @Mutation(() => [UserType], { name: 'bulkInviteUsers' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  async bulkInviteUsers(
    @Args('input') input: BulkInviteUsersInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    const isSuperAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    if (!isSuperAdmin) {
      const adminCollegeIds =
        currentUser.memberships
          ?.filter((m) => m.role === Role.COLLEGE_ADMIN)
          .map((m) => m.collegeId) || [];

      for (const item of input.users) {
        if (!item.collegeId || !adminCollegeIds.includes(item.collegeId)) {
          throw new ForbiddenException(
            `You can only invite users to your assigned college (${adminCollegeIds.join(', ')})`,
          );
        }
        if ((item.role as Role) === Role.SUPER_ADMIN || (item.role as Role) === Role.PLATFORM_ADMIN) {
          throw new ForbiddenException('College admins cannot assign platform administrator roles');
        }
      }
    }

    return this.usersService.bulkInvite(input);
  }
}

