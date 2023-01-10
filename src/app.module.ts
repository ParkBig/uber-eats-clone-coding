import { Module } from '@nestjs/common';
import * as Joi from "joi";
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule, } from "@nestjs/typeorm"
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common/interfaces';
import { RequestMethod } from '@nestjs/common/enums';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Context } from 'vm';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test",
      ignoreEnvFile: process.env.NODE_ENV === "prod",
      // 스키마의 유효성을 Joi로 검사한다.
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("dev", "prod", "test").required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAIL_API_KEY: Joi.string().required(),
        MAIL_DOMAIN_NAME: Joi.string().required(),
        MAIL_FROM_EMAIL: Joi.string().required(),
      })
    }),
    TypeOrmModule.forRoot({ // 포스트그래서DB사용하기위한 코드, pgAdmin4로 확인 가능
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== "prod",
      logging:  // 를 함으로써 DB에서 돌아가는 모든 로그들을 확인할 수 있다.
        process.env.NODE_ENV !== "prod" && process.env.NODE_ENV !== "test",
      entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem, Payment]  // DB의 스키마의 테이블에 엔티티생성
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      // installSubscriptionHandlers: true,  // order.resolver에서 서브스크립션동작을 위해(ws 사용할 수 있게?) 즉 웹소켓 기능을 가지게 된다.
      subscriptions: {  // ws 사용할 수 있게? 즉 웹소켓 기능을 가지게 된다
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: any) => ({
            token: connectionParams['x-jwt'],
          }),
        },
      },
      context: ({ req }) => ({ token: req.headers['x-jwt'] }),  // app.module의 context은 req, res등 에 접근 가능하며 다른 리졸브 파일이 req, res등에 접근할 수 있게 해줌 
    }),
    JwtModule.forRoot({ // forRoot함으로써 동적인 모듈로 변신!
      privateKey: process.env.PRIVATE_KEY
    }),
    MailModule.forRoot({  // mailGun 이라는 서비스 이용하고 있음.
      apiKey: process.env.MAIL_API_KEY,
      domain: process.env.MAIL_DOMAIN_NAME,
      fromEmail: process.env.MAIL_FROM_EMAIL,
    }),
    ScheduleModule.forRoot( // 고정된 날짜/시간, 반복 간격 또는 지정된 간격마다 특정 메서드나 함수를 한 번 실행되도록 예약할 수 있습니다.

    ),  // ****** => 별6개이며 왼쪽부터 초(옵셔날), 분, 시, 일 of 월, 월, 일 of 윅 https://docs.nestjs.com/techniques/task-scheduling
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}


// 아래 내용은 http만 사용하면서 미들웨어 쓸때 내용이다.
// // 특정 경로에만 미들웨어 쓰고싶을떄 다음과 같이. 추가로 메인.ts에서 app.use(jwtMiddleware);지워줘야함
// // request발생 => request가 jwt미들웨어로 이동 => request가지고 이것저것 쓰고 다시 request다시 가공가능 =>
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {   // MiddlewareConsumer명시해야 미들웨어 사용가능.
//     consumer.apply(JwtMiddleware).forRoutes({ // JwtMiddleware미들웨어를 모든경로, 모든 요청에쓰겠다는내용.
//       path: "/graphql",
//       method: RequestMethod.ALL
//     })
//   }
// }

