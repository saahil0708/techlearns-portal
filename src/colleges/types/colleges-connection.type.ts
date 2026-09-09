import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { CollegeType } from './college.type.js';

@ObjectType('CollegesConnection')
export class CollegesConnection {
  @Field(() => [CollegeType])
  items: CollegeType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
