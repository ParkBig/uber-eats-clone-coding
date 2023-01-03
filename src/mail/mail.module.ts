import { Module, DynamicModule } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interface';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule { // 또 다른 모듈을 반환해주는 모듈이다.
    return {
      module: MailModule,
      exports: [MailService],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        MailService
      ]
    }
  }
}

