import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { BatchStudentType } from './batch-student.type.js';

@ObjectType('BatchStudentsConnection')
export class BatchStudentsConnection {
  @Field(() => [BatchStudentType])
  items: BatchStudentType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
