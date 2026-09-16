import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminMetrics')
export class AdminMetricsType {
  @Field(() => Int, { nullable: true })
  institutionsCount?: number;

  @Field(() => Int, { nullable: true })
  collegesCount?: number;

  @Field(() => Int)
  studentsCount: number;

  @Field(() => Int)
  facultyCount: number;

  @Field(() => Int)
  adminsCount: number;

  @Field(() => Int)
  totalUsersCount: number;

  @Field(() => Int)
  problemsCount: number;

  @Field(() => Int)
  contestsCount: number;

  @Field(() => Int)
  submissionsCount: number;

  @Field(() => String)
  systemStatus: string;

  @Field(() => String)
  uptimePercentage: string;
}
