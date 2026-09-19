import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { CourseStatus } from '@prisma/client';
import { ModuleType } from './module.type.js';

@ObjectType('CourseCounts')
export class CourseCountsType {
  @Field(() => Int)
  modules: number;

  @Field(() => Int)
  enrollments: number;
}

@ObjectType('Course')
export class CourseType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  institutionId?: string;

  @Field(() => String, { nullable: true })
  collegeId?: string;

  @Field(() => String)
  createdById: string;

  @Field(() => CourseStatus)
  status: CourseStatus;

  @Field(() => [ModuleType], { nullable: true })
  modules?: ModuleType[];

  @Field(() => CourseCountsType, { nullable: true })
  _count?: CourseCountsType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
