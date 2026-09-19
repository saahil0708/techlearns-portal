import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { ProblemType } from './problem.type.js';

@ObjectType('ProblemsConnection')
export class ProblemsConnection {
  @Field(() => [ProblemType])
  items: ProblemType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
