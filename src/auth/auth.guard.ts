import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from "@nestjs/core";
import { AllowedRoles } from './role.decoreator';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate { // CanActivate = 함수이며 true리턴하면 request진행, false면 스탑
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {  // ExecutionContext => app.module 에 정의한 context 가져올 수 있다
    const roles = this.reflector.get<AllowedRoles>("roles", context.getHandler());  // 리졸브에서 설정한 role이 뭔지 가져옴.
    if(!roles) return true; // 메타데이터가 없으면 퍼블릭(아무 role이든 상관없다.)이니까 그냥 통과하라는 뜻. (auth.module.ts때매 모든 리졸브에 Auth검사중임)

    const gqlContext = GqlExecutionContext.create(context).getContext(); // 가져온 context를 쓸 수 있게 가공.
    const token = gqlContext.token;

    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === "object" && decoded.hasOwnProperty("id")) {
        const { user } = await this.userService.findById(decoded["id"]);
        if (!user) return false;
        gqlContext["user"] = user;
        if (roles.includes("Any")) return true; // any타입의 리졸브면 그냥 통과.
        return roles.includes(user.role); // 특정 role을 가진 유저만 통과.
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

// 이녀석은 context뿐 만이 아닌 metadata도 가져와 판별한다.
