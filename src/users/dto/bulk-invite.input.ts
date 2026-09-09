import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType('BulkInviteItemInput')
export class BulkInviteItemInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Role, { defaultValue: Role.STUDENT })
  @IsEnum(Role)
  role: Role = Role.STUDENT;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  collegeId?: string;
}

@InputType('BulkInviteUsersInput')
export class BulkInviteUsersInput {
  @Field(() => [BulkInviteItemInput])
  @IsArray()
  users: BulkInviteItemInput[];
}
