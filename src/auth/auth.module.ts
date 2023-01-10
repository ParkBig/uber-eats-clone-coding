import { Module } from '@nestjs/common';
import { APP_GUARD } from "@nestjs/core"
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [UsersModule],
  providers: [{
    provide: APP_GUARD, // 모든 것에 아래AuthGuard를 통해 검증하겠다는 뜼. 즉 GLOBAL가드임.
    useClass: AuthGuard
  }]
})
export class AuthModule {}
