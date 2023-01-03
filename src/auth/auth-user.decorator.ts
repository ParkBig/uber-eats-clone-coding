import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => { // ExecutionContext => app.module 에 정의한 context 가져올 수 있다
    const gqlContext = GqlExecutionContext.create(context).getContext();  // 가져온 context를 쓸 수 있게 가공.
    const user = gqlContext["user"];
    return user;
  }
)

// 데코레이터를 만든거라고 한다... 