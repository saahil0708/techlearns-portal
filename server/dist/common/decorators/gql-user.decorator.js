import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
export const GqlCurrentUser = createParamDecorator((_data, context) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req?.user;
});
//# sourceMappingURL=gql-user.decorator.js.map