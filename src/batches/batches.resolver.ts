import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { BatchesService } from './batches.service.js';
import { AssignStudentsInput } from './dto/assign-students.input.js';
import { CreateBatchInput } from './dto/create-batch.input.js';
import { UpdateBatchInput } from './dto/update-batch.input.js';
import { BatchStudentType } from './types/batch-student.type.js';
import { BatchStudentsConnection } from './types/batch-students-connection.type.js';
import { BatchType } from './types/batch.type.js';
import { BatchesConnection } from './types/batches-connection.type.js';

@Resolver(() => BatchType)
export class BatchesResolver {
  constructor(private batchesService: BatchesService) {}

  private checkCollegeBatchAccess(user: CurrentUserPayload, targetCollegeId: string): void {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const hasAccess = user.memberships?.some(
      (m) =>
        m.collegeId === targetCollegeId &&
        (m.role === Role.COLLEGE_ADMIN || m.role === Role.FACULTY),
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have administrative or faculty access to this college');
    }
  }

  private async checkBatchAccess(user: CurrentUserPayload, batchId: string): Promise<void> {
    if (user.globalRole === Role.SUPER_ADMIN || user.globalRole === Role.PLATFORM_ADMIN) {
      return;
    }
    const batch = await this.batchesService.findOne(batchId);
    const hasAccess = user.memberships?.some(
      (m) =>
        m.collegeId === batch.collegeId &&
        (m.role === Role.COLLEGE_ADMIN || m.role === Role.FACULTY),
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to manage this batch');
    }
  }

  @Query(() => BatchesConnection, { name: 'batches' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  async getBatches(
    @GqlCurrentUser() user: CurrentUserPayload,
    @Args({ type: () => PaginationArgs }) pagination: PaginationArgs,
    @Args('collegeId', { type: () => String, nullable: true }) collegeId?: string,
  ) {
    if (collegeId) {
      this.checkCollegeBatchAccess(user, collegeId);
    } else if (
      user.globalRole !== Role.SUPER_ADMIN &&
      user.globalRole !== Role.PLATFORM_ADMIN
    ) {
      // If no collegeId specified and not super admin, use user's first admin/faculty college
      const primaryMembership = user.memberships?.find(
        (m) => m.role === Role.COLLEGE_ADMIN || m.role === Role.FACULTY,
      );
      if (!primaryMembership) {
        throw new ForbiddenException('No college membership found with batch management rights');
      }
      collegeId = primaryMembership.collegeId;
    }

    return this.batchesService.findPaginated(pagination, collegeId);
  }

  @Query(() => BatchType, { name: 'batch' })
  @UseGuards(GqlAuthGuard)
  async getBatch(
    @GqlCurrentUser() user: CurrentUserPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const batch = await this.batchesService.findOne(id);
    if (
      user.globalRole !== Role.SUPER_ADMIN &&
      user.globalRole !== Role.PLATFORM_ADMIN
    ) {
      const hasMembership = user.memberships?.some((m) => m.collegeId === batch.collegeId);
      if (!hasMembership) {
        throw new ForbiddenException('You do not have access to this batch');
      }
    }
    return batch;
  }

  @Query(() => BatchStudentsConnection, { name: 'batchStudents' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  async getBatchStudents(
    @GqlCurrentUser() user: CurrentUserPayload,
    @Args('batchId', { type: () => ID }) batchId: string,
    @Args({ type: () => PaginationArgs }) pagination: PaginationArgs,
  ) {
    await this.checkBatchAccess(user, batchId);
    return this.batchesService.getStudentsPaginated(batchId, pagination);
  }

  @Mutation(() => BatchType)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  async createBatch(
    @GqlCurrentUser() user: CurrentUserPayload,
    @Args('input') input: CreateBatchInput,
  ) {
    this.checkCollegeBatchAccess(user, input.collegeId);
    return this.batchesService.create(input);
  }

  @Mutation(() => BatchType)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  async updateBatch(
    @GqlCurrentUser() user: CurrentUserPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBatchInput,
  ) {
    await this.checkBatchAccess(user, id);
    return this.batchesService.update(id, input);
  }

  @Mutation(() => BatchType)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  async deleteBatch(
    @GqlCurrentUser() user: CurrentUserPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    await this.checkBatchAccess(user, id);
    return this.batchesService.delete(id);
  }

  @Mutation(() => [BatchStudentType])
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  async assignStudentsToBatch(
    @GqlCurrentUser() user: CurrentUserPayload,
    @Args('input') input: AssignStudentsInput,
  ) {
    await this.checkBatchAccess(user, input.batchId);
    const assignments =
      input.students && input.students.length > 0
        ? input.students
        : input.userIds?.map((userId) => ({ userId })) || [];
    return this.batchesService.assignStudents(input.batchId, assignments);
  }

  @Mutation(() => BatchStudentType)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN, Role.FACULTY)
  async removeStudentFromBatch(
    @GqlCurrentUser() user: CurrentUserPayload,
    @Args('batchId', { type: () => ID }) batchId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    await this.checkBatchAccess(user, batchId);
    return this.batchesService.removeStudent(batchId, userId);
  }
}
