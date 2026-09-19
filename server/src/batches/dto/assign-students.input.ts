import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString } from 'class-validator';

@InputType('BatchStudentAssignmentItem')
export class BatchStudentAssignmentItem {
  @Field(() => String)
  @IsString()
  userId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  rollNo?: string;
}

@InputType('AssignStudentsInput')
export class AssignStudentsInput {
  @Field(() => String)
  @IsString()
  batchId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @Field(() => [BatchStudentAssignmentItem], { nullable: true })
  @IsOptional()
  @IsArray()
  students?: BatchStudentAssignmentItem[];
}
