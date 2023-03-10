import { NestMiddleware, Injectable } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UsersService } from "src/users/users.service";
import { JwtService } from "./jwt.service";

@Injectable() // 이걸 해야 아래 constructor사용해서 다른거 가져오기쌉가능.
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ("x-jwt" in req.headers) {
      const token = req.headers["x-jwt"];
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === "object" && decoded.hasOwnProperty("id")) {
          const { ok, user } = await this.userService.findById(decoded["id"]);
          if (ok) {req["user"] = user;};
        }
      } catch (e) {}
    }
    next();
  }
}

// ws 쓰기때문에 이 프젝에선 이파일을 안쓴다. 하지만 http만 사용할떄는 app.module에 미들웨서 사용 추가하고 쓰면된다.

// 함수형으로 할떄 버젼
// export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
//   console.log(req.headers);
//   next();
// }
