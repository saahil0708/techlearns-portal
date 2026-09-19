import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { CourseType } from './course.type.js';

@ObjectType('CoursesConnection')
export class CoursesConnection {
  @Field(() => [CourseType])
  items: CourseType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
