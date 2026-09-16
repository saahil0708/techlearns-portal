import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '../../common/graphql/pagination-meta.type.js';
import { InstitutionType } from './institution.type.js';

@ObjectType('InstitutionsConnection')
export class InstitutionsConnection {
  @Field(() => [InstitutionType])
  items: InstitutionType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
