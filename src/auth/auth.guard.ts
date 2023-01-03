import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate { // CanActivate = 함수이며 true리턴하면 request진행, false면 스탑
  
  canActivate(context: ExecutionContext) {  // ExecutionContext => app.module 에 정의한 context 가져올 수 있다
    const gqlContext = GqlExecutionContext.create(context).getContext(); // 가져온 context를 쓸 수 있게 가공.
    const user = gqlContext["user"];
    if (!user) return false;
    return true;
  }
}