import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CourseStatus, Role } from '@prisma/client';
import { GqlCurrentUser } from '../common/decorators/gql-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationArgs } from '../common/graphql/pagination.args.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { GqlRolesGuard } from '../common/guards/gql-roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseInput } from './dto/create-course.input.js';
import { UpdateCourseInput } from './dto/update-course.input.js';
import { CourseType } from './types/course.type.js';
import { CoursesConnection } from './types/courses-connection.type.js';

@Resolver(() => CourseType)
export class CoursesResolver {
  constructor(private coursesService: CoursesService) {}

  @Query(() => CoursesConnection, { name: 'courses' })
  async getCourses(
    @Args() paginationArgs: PaginationArgs,
    @Args('collegeId', { type: () => String, nullable: true }) collegeId?: string,
    @Args('status', { type: () => CourseStatus, nullable: true }) status?: CourseStatus,
    @GqlCurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.coursesService.findPaginated(paginationArgs, collegeId, status, currentUser);
  }

  @Query(() => CourseType, { name: 'course', nullable: true })
  async getCourse(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.coursesService.findCourseById(id, currentUser);
  }

  @Mutation(() => CourseType, { name: 'createCourse' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.COLLEGE_ADMIN)
  async createCourse(
    @Args('input') input: CreateCourseInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.coursesService.createCourse(currentUser.id, input, currentUser);
  }

  @Mutation(() => CourseType, { name: 'updateCourse' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.COLLEGE_ADMIN)
  async updateCourse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCourseInput,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.coursesService.updateCourse(id, input, currentUser);
  }

  @Mutation(() => Boolean, { name: 'deleteCourse' })
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.FACULTY, Role.COLLEGE_ADMIN)
  async deleteCourse(
    @Args('id', { type: () => ID }) id: string,
    @GqlCurrentUser() currentUser: CurrentUserPayload,
  ) {
    await this.coursesService.deleteCourse(id, currentUser);
    return true;
  }
}

