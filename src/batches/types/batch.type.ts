import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { CollegeType } from '../../colleges/types/college.type.js';
import { BatchCountsType } from './batch-counts.type.js';
import { BatchStudentType } from './batch-student.type.js';

@ObjectType('Batch')
export class BatchType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  collegeId: string;

  @Field(() => Int)
  maxCapacity: number;

  @Field(() => String)
  status: string;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => CollegeType, { nullable: true })
  college?: CollegeType;

  @Field(() => [BatchStudentType], { nullable: true })
  students?: BatchStudentType[];

  @Field(() => BatchCountsType, { nullable: true })
  _count?: BatchCountsType;
}
