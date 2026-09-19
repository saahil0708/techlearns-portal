import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { SubmissionType } from './submission.type.js';

@ObjectType('SubmissionsConnection')
export class SubmissionsConnection {
  @Field(() => [SubmissionType])
  items: SubmissionType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
