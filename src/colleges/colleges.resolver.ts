import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CollegeStatus, Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import { CollegesService } from './colleges.service.js';
import { AddCollegeMemberInput } from './dto/add-member.input.js';
import { CreateCollegeInput } from './dto/create-college.input.js';
import { UpdateCollegeInput } from './dto/update-college.input.js';
import { CollegeType } from './types/college.type.js';
import { CollegesConnection } from './types/colleges-connection.type.js';

@Resolver(() => CollegeType)
export class CollegesResolver {
  constructor(private collegesService: CollegesService) {}

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
  async getCollege(@Args('id', { type: () => ID }) id: string) {
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
  ) {
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
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  async addCollegeMember(
    @Args('collegeId', { type: () => ID }) collegeId: string,
    @Args('input') input: AddCollegeMemberInput,
  ) {
    await this.collegesService.addMember(collegeId, input);
    return true;
  }

  @Mutation(() => Boolean, { name: 'removeCollegeMember' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.COLLEGE_ADMIN)
  async removeCollegeMember(
    @Args('collegeId', { type: () => ID }) collegeId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    await this.collegesService.removeMember(collegeId, userId);
    return true;
  }
}
