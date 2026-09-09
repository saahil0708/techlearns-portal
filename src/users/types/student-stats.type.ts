import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('TopicSkill')
export class TopicSkillType {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  solved: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pct: number;
}

@ObjectType('StudentSubmissionItem')
export class StudentSubmissionItemType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  problemTitle: string;

  @Field(() => String)
  problemSlug: string;

  @Field(() => String)
  problemCode: string;

  @Field(() => String)
  difficulty: string;

  @Field(() => String)
  language: string;

  @Field(() => String)
  verdict: string;

  @Field(() => Int, { nullable: true })
  runtimeMs?: number;

  @Field(() => Int, { nullable: true })
  memoryKb?: number;

  @Field(() => String)
  submittedAt: string;

  @Field(() => String, { nullable: true })
  codeSnippet?: string;
}

@ObjectType('StudentContestItem')
export class StudentContestItemType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  contestName: string;

  @Field(() => String)
  contestDate: string;

  @Field(() => Int)
  rank: number;

  @Field(() => Int)
  totalParticipants: number;

  @Field(() => Int)
  score: number;

  @Field(() => String)
  penaltyTime: string;

  @Field(() => Int)
  ratingDelta: number;

  @Field(() => Int)
  newRating: number;
}

@ObjectType('StudentCourseItem')
export class StudentCourseItemType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  instructor: string;

  @Field(() => Int)
  modulesCompleted: number;

  @Field(() => Int)
  totalModules: number;

  @Field(() => Int)
  progressPct: number;

  @Field(() => String)
  status: string;
}

@ObjectType('StudentProfile')
export class StudentProfileType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  handle: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  role: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  bannerUrl?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  institution?: string;

  @Field(() => String, { nullable: true })
  department?: string;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  joinedDate: string;

  @Field(() => String, { nullable: true })
  githubUrl?: string;

  @Field(() => String, { nullable: true })
  linkedinUrl?: string;

  @Field(() => String, { nullable: true })
  websiteUrl?: string;

  @Field(() => String, { nullable: true })
  resumeUrl?: string;

  @Field(() => String, { nullable: true })
  resumeFileName?: string;

  @Field(() => Int)
  contestRating: number;

  @Field(() => String)
  ratingTier: string;

  @Field(() => Int)
  globalRank: number;

  @Field(() => Int)
  solvedTotal: number;

  @Field(() => Int)
  solvedEasy: number;

  @Field(() => Int)
  solvedMedium: number;

  @Field(() => Int)
  solvedHard: number;

  @Field(() => Int)
  totalSubmissions: number;

  @Field(() => String)
  accuracyRate: string;

  @Field(() => Int)
  currentStreakDays: number;

  @Field(() => Int)
  maxStreakDays: number;

  @Field(() => [TopicSkillType])
  topics: TopicSkillType[];

  @Field(() => [StudentSubmissionItemType])
  submissions: StudentSubmissionItemType[];

  @Field(() => [StudentContestItemType])
  contests: StudentContestItemType[];

  @Field(() => [StudentCourseItemType])
  courses: StudentCourseItemType[];
}
