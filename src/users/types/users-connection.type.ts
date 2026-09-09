import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { UserType } from './user.type.js';

@ObjectType('UsersConnection')
export class UsersConnection {
  @Field(() => [UserType])
  items: UserType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
