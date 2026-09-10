import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

const COLLEGE_ROLES = [Role.COLLEGE_ADMIN, Role.FACULTY, Role.STUDENT] as const;

@InputType('AddCollegeMemberInput')
export class AddCollegeMemberInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Field(() => Role, { defaultValue: Role.STUDENT })
  @IsEnum(COLLEGE_ROLES)
  role: (typeof COLLEGE_ROLES)[number] = Role.STUDENT;
}
