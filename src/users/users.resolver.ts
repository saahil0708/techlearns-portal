import { UseGuards } from '@nestjs/common';
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
    @Args('role', { type: () => Role, nullable: true }) role?: Role,
    @Args('status', { type: () => UserStatus, nullable: true }) status?: UserStatus,
    @Args('collegeId', { type: () => String, nullable: true }) collegeId?: string,
  ) {
    return this.usersService.findPaginated(paginationArgs, role, status, collegeId);
  }

  @Query(() => UserType, { name: 'user', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findById(id);
  }

  @Query(() => UserType, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getMe(@GqlCurrentUser() currentUser: CurrentUserPayload) {
    return this.usersService.getProfile(currentUser.id);
  }

  @Query(() => StudentProfileType, { name: 'studentProfile' })
  async getStudentProfile(
    @Args('handleOrId', { type: () => String }) handleOrId: string,
  ) {
    return this.usersService.getStudentProfile(handleOrId);
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
  async createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.createWithInput(input);
  }

  @Mutation(() => UserType, { name: 'updateUser' })
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    // Only allow updating own profile unless SUPER_ADMIN or PLATFORM_ADMIN
    if (
      currentUser.id !== id &&
      currentUser.globalRole !== Role.SUPER_ADMIN &&
      currentUser.globalRole !== Role.PLATFORM_ADMIN
    ) {
      id = currentUser.id;
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
  async bulkInviteUsers(@Args('input') input: BulkInviteUsersInput) {
    return this.usersService.bulkInvite(input);
  }
}
