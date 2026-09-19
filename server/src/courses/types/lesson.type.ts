import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Lesson')
export class LessonType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  moduleId: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => Int)
  order: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
