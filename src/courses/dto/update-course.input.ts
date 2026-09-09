import { Field, InputType } from '@nestjs/graphql';
import { CourseStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

@InputType('UpdateCourseInput')
export class UpdateCourseInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => CourseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
