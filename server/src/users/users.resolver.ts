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
import { validateUserCreationRBAC } from './utils/user-rbac.util.js';
import { AdminMetricsType } from './types/admin-metrics.type.js';
import { AuditLogItemType } from './types/audit-log.type.js';
import { StudentProfileType } from './types/student-stats.type.js';
import { UserType } from './types/user.type.js';
import { UsersConnection } from './types/users-connection.type.js';
import { BulkInviteResultType } from './types/bulk-invite-result.type.js';
import { UsersService } from './users.service.js';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => UsersConnection, { name: 'users' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN)
  async getUsers(
    @Args() paginationArgs: PaginationArgs,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
    @Args('role', { type: () => Role, nullable: true }) role?: Role,
    @Args('status', { type: () => UserStatus, nullable: true }) status?: UserStatus,
    @Args('institutionId', { type: () => String, nullable: true }) institutionId?: string,
    @Args('collegeId', { type: () => String, nullable: true }) collegeId?: string,
  ) {
    const isSuperAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    let targetInstId = institutionId || collegeId;

    if (!isSuperAdmin) {
      const adminInstitutionIds =
        currentUser.memberships
          ?.filter((m) => m.role === Role.INSTITUTION_ADMIN)
          .map((m) => m.institutionId) || [];

      if (adminInstitutionIds.length === 0) {
        throw new ForbiddenException('You do not have institution admin privileges');
      }

      if (targetInstId) {
        if (!adminInstitutionIds.includes(targetInstId)) {
          throw new ForbiddenException('You can only list users within your own institution');
        }
      } else {
        targetInstId = adminInstitutionIds[0];
      }
    }

    return this.usersService.findPaginated(paginationArgs, role, status, targetInstId);
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
      currentUser.globalRole === Role.INSTITUTION_ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this user profile.');
    }

    if (currentUser.globalRole === Role.INSTITUTION_ADMIN) {
      const target = await this.usersService.findById(id);
      const targetMemberships = (target as (typeof target & {
        memberships?: Array<{ institutionId: string; role: Role }>;
      }) | null)?.memberships;
      const allowed = targetMemberships?.some((membership) =>
        currentUser.memberships?.some(
          (ownMembership) =>
            ownMembership.institutionId === membership.institutionId &&
            ownMembership.role === Role.INSTITUTION_ADMIN,
        ),
      );
      if (!allowed) {
        throw new ForbiddenException('You do not have permission to view this user profile.');
      }
      return target;
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
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN)
  async getAdminMetrics(@GqlCurrentUser() currentUser: CurrentUserPayload) {
    return this.usersService.getSuperAdminMetrics(currentUser);
  }

  @Query(() => [AuditLogItemType], { name: 'adminAuditLogs' })
  @UseGuards(GqlAuthGuard)
  async getAdminAuditLogs(@GqlCurrentUser() currentUser: CurrentUserPayload) {
    return this.usersService.getAdminAuditLogs(currentUser.id);
  }

  @Mutation(() => UserType, { name: 'createUser' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  async createUser(
    @Args('input') input: CreateUserInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    const targetInstitutionId = input.institutionId || input.collegeId;
    const targetRole = (input.globalRole as Role) || Role.STUDENT;

    validateUserCreationRBAC(currentUser, targetRole, targetInstitutionId);

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

  @Mutation(() => BulkInviteResultType, { name: 'bulkInviteUsers' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  async bulkInviteUsers(
    @Args('input') input: BulkInviteUsersInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    for (const item of input.users) {
      const instId = item.institutionId || item.collegeId;
      const targetRole = (item.role as Role) || Role.STUDENT;
      validateUserCreationRBAC(currentUser, targetRole, instId);
    }

    return this.usersService.bulkInvite(input);
  }
}
