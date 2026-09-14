import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CollegeStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CollegesService } from './colleges.service.js';
import { AddCollegeMemberInput } from './dto/add-member.input.js';
import { CreateCollegeInput } from './dto/create-college.input.js';
import { UpdateCollegeInput } from './dto/update-college.input.js';
import { CollegeType } from './types/college.type.js';
import { CollegesConnection } from './types/colleges-connection.type.js';

@Resolver(() => CollegeType)
export class CollegesResolver {
  constructor(private collegesService: CollegesService) {}

  private checkCollegeAdminAccess(user: CurrentUserPayload, targetCollegeId: string): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const hasAdmin = user.memberships?.some(
      (m) =>
        m.collegeId === targetCollegeId &&
        (m.role === Role.COLLEGE_ADMIN || m.role === Role.FACULTY),
    );
    if (!hasAdmin) {
      throw new ForbiddenException('You do not have administrative or faculty access to this college');
    }
  }

  private checkCollegeUpdateAccess(user: CurrentUserPayload, targetCollegeId: string): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const hasAdmin = user.memberships?.some(
      (m) => m.collegeId === targetCollegeId && m.role === Role.COLLEGE_ADMIN,
    );
    if (!hasAdmin) {
      throw new ForbiddenException('You do not have administrative access to update this college');
    }
  }

  private checkCollegeMemberAccess(user: CurrentUserPayload, targetCollegeId: string): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const hasMember = user.memberships?.some(
      (m) => m.collegeId === targetCollegeId,
    );
    if (!hasMember) {
      throw new ForbiddenException('You do not have access to this college organization');
    }
  }

  @Query(() => CollegesConnection, { name: 'colleges' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  async getColleges(
    @Args() paginationArgs: PaginationArgs,
    @Args('status', { type: () => CollegeStatus, nullable: true }) status?: CollegeStatus,
  ) {
    return this.collegesService.findPaginated(paginationArgs, status);
  }

  @Query(() => CollegeType, { name: 'college', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getCollege(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    this.checkCollegeMemberAccess(currentUser, id);
    return this.collegesService.findOne(id);
  }

  @Mutation(() => CollegeType, { name: 'createCollege' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  async createCollege(@Args('input') input: CreateCollegeInput) {
    return this.collegesService.create(input);
  }

  @Mutation(() => CollegeType, { name: 'updateCollege' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  async updateCollege(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCollegeInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    this.checkCollegeUpdateAccess(currentUser, id);
    return this.collegesService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteCollege' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  async deleteCollege(@Args('id', { type: () => ID }) id: string) {
    return this.collegesService.delete(id);
  }

  @Mutation(() => Boolean, { name: 'addCollegeMember' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  async addCollegeMember(
    @Args('collegeId', { type: () => ID }) collegeId: string,
    @Args('input') input: AddCollegeMemberInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    this.checkCollegeAdminAccess(currentUser, collegeId);
    await this.collegesService.addMember(collegeId, input);
    return true;
  }

  @Mutation(() => Boolean, { name: 'removeCollegeMember' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  async removeCollegeMember(
    @Args('collegeId', { type: () => ID }) collegeId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    this.checkCollegeAdminAccess(currentUser, collegeId);
    await this.collegesService.removeMember(collegeId, userId);
    return true;
  }
}

