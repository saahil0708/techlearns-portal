import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

const INSTITUTION_ROLES = [Role.INSTITUTION_ADMIN, Role.FACULTY, Role.STUDENT] as const;

@InputType('AddInstitutionMemberInput')
export class AddInstitutionMemberInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Field(() => Role, { defaultValue: Role.STUDENT })
  @IsEnum(INSTITUTION_ROLES)
  role: (typeof INSTITUTION_ROLES)[number] = Role.STUDENT;
}
