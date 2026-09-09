import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CollegeStatus } from '@prisma/client';
import { CollegeCountsType } from './college-counts.type.js';

@ObjectType('College')
export class CollegeType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => CollegeStatus)
  status: CollegeStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => CollegeCountsType, { nullable: true })
  _count?: CollegeCountsType;
}
