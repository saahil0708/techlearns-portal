import { Field, InputType } from '@nestjs/graphql';
import { CourseStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('CreateCourseInput')
export class CreateCourseInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  institutionId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @Field(() => CourseStatus, { defaultValue: CourseStatus.DRAFT, nullable: true })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus = CourseStatus.DRAFT;
}
