import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CurrentUserPayload } from '../types/current-user.interface.js';

export const GqlCurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserPayload | undefined => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req?.user;
  },
);
