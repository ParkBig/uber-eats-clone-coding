import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global() // 을 쓰면 하위 항목 별도 표기 없이, 받는쪽역시 별도 표기 없이 수입, 수출가능
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule { // 또 다른 모듈을 반환해주는 모듈이다.
    return {
      module: JwtModule,
      exports: [JwtService],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        JwtService
      ]
    }
  }
}
