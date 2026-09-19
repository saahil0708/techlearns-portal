import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InstitutionStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { AddInstitutionMemberInput } from './dto/add-member.input.js';
import { CreateInstitutionInput } from './dto/create-institution.input.js';
import { UpdateInstitutionInput } from './dto/update-institution.input.js';
import { InstitutionsService } from './institutions.service.js';
import { InstitutionType } from './types/institution.type.js';
import { InstitutionsConnection } from './types/institutions-connection.type.js';

@Resolver(() => InstitutionType)
export class InstitutionsResolver {
  constructor(private institutionsService: InstitutionsService) {}

  private checkInstitutionAdminAccess(
    user: CurrentUserPayload,
    targetInstitutionId: string,
    targetRole?: Role,
  ): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const membership = user.memberships?.find((m) => m.institutionId === targetInstitutionId);
    if (!membership || (membership.role !== Role.INSTITUTION_ADMIN && membership.role !== Role.FACULTY)) {
      throw new ForbiddenException('You do not have administrative or faculty access to this institution');
    }
    if (membership.role === Role.FACULTY && targetRole && targetRole !== Role.STUDENT) {
      throw new ForbiddenException('Faculty can only manage student memberships');
    }
  }

  private checkInstitutionUpdateAccess(user: CurrentUserPayload, targetInstitutionId: string): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const hasAdmin = user.memberships?.some(
      (m) => m.institutionId === targetInstitutionId && m.role === Role.INSTITUTION_ADMIN,
    );
    if (!hasAdmin) {
      throw new ForbiddenException('You do not have administrative access to update this institution');
    }
  }

  private checkInstitutionMemberAccess(user: CurrentUserPayload, targetInstitutionId: string): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const hasMember = user.memberships?.some(
      (m) => m.institutionId === targetInstitutionId,
    );
    if (!hasMember) {
      throw new ForbiddenException('You do not have access to this institution organization');
    }
  }

  @Query(() => InstitutionsConnection, { name: 'institutions' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  async getInstitutions(
    @Args() paginationArgs: PaginationArgs,
    @Args('status', { type: () => InstitutionStatus, nullable: true }) status?: InstitutionStatus,
  ) {
    return this.institutionsService.findPaginated(paginationArgs, status);
  }

  @Query(() => InstitutionType, { name: 'institution', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getInstitution(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    this.checkInstitutionMemberAccess(currentUser, id);
    return this.institutionsService.findOne(id);
  }

  @Mutation(() => InstitutionType, { name: 'createInstitution' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  async createInstitution(@Args('input') input: CreateInstitutionInput) {
    return this.institutionsService.create(input);
  }

  @Mutation(() => InstitutionType, { name: 'updateInstitution' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN)
  async updateInstitution(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateInstitutionInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    this.checkInstitutionUpdateAccess(currentUser, id);
    return this.institutionsService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteInstitution' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN)
  async deleteInstitution(@Args('id', { type: () => ID }) id: string) {
    return this.institutionsService.delete(id);
  }

  @Mutation(() => Boolean, { name: 'addInstitutionMember' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  async addInstitutionMember(
    @Args('institutionId', { type: () => ID }) institutionId: string,
    @Args('input') input: AddInstitutionMemberInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    this.checkInstitutionAdminAccess(currentUser, institutionId, input.role);
    let allowedTargetRole: Role | undefined;
    if (
      currentUser.globalRole !== Role.SUPER_ADMIN &&
      currentUser.globalRole !== Role.PLATFORM_ADMIN
    ) {
      const membership = currentUser.memberships?.find((m) => m.institutionId === institutionId);
      if (membership?.role === Role.FACULTY) {
        allowedTargetRole = Role.STUDENT;
      }
    }
    await this.institutionsService.addMember(institutionId, input, allowedTargetRole);
    return true;
  }

  @Mutation(() => Boolean, { name: 'removeInstitutionMember' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  async removeInstitutionMember(
    @Args('institutionId', { type: () => ID }) institutionId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    this.checkInstitutionAdminAccess(currentUser, institutionId);
    let allowedRole: Role | undefined;
    if (
      currentUser.globalRole !== Role.SUPER_ADMIN &&
      currentUser.globalRole !== Role.PLATFORM_ADMIN
    ) {
      const membership = currentUser.memberships?.find((m) => m.institutionId === institutionId);
      if (membership?.role === Role.FACULTY) {
        allowedRole = Role.STUDENT;
      }
    }
    await this.institutionsService.removeMember(institutionId, userId, allowedRole);
    return true;
  }
}
