import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService]
})
export class UsersModule {}

// imports: [] <= 이곳에 엔티티 넣어줘야함
// providers: [] <= 서비스, 리졸버파일 넣어주고 수입해서 같다쓸거 있음 그것도 넣어준다.
//                  그런데 수입해서 쓸 녀석이 isGlobal: true 혹은 @Global 데코레이터 적용 된 녀석이면 안 넣어도 됨.

// ex) 지금 jwt.service에다 @Global 데코레이터 적용해서 위에 안 넣어줬음.
// ex) 지금 ConfigService에다 isGlobal:true 해서 위에 안 넣어줬음.