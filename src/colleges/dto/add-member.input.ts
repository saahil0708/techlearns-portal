import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

@InputType('AddCollegeMemberInput')
export class AddCollegeMemberInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Field(() => Role, { defaultValue: Role.STUDENT })
  @IsEnum(Role)
  role: Role = Role.STUDENT;
}
