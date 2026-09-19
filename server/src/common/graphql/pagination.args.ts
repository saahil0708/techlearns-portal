import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsIn, IsOptional, IsString, Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 1, nullable: true })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { defaultValue: 10, nullable: true })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field(() => String, { defaultValue: 'desc', nullable: true })
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
