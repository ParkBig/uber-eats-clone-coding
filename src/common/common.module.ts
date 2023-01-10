import { Module, Global } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions/dist/pubsub';
import { PUB_SUB } from './common.constants';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: new PubSub()  // 모든 곳에 글로발로 ws에 쓰일 펍섭을 만듬
    }
  ],
  exports: [PUB_SUB]
})
export class CommonModule {}
