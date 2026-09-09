import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { ContestType } from './contest.type.js';

@ObjectType('ContestsConnection')
export class ContestsConnection {
  @Field(() => [ContestType])
  items: ContestType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
