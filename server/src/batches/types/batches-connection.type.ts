import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { BatchType } from './batch.type.js';

@ObjectType('BatchesConnection')
export class BatchesConnection {
  @Field(() => [BatchType])
  items: BatchType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
