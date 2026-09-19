import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { LessonType } from './lesson.type.js';

@ObjectType('Module')
export class ModuleType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  courseId: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  order: number;

  @Field(() => [LessonType], { nullable: true })
  lessons?: LessonType[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
