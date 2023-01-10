import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { type } from "os";
import { CommonEntity } from "src/common/entities/common.entities";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";


@InputType("PaymentInputType", { isAbstract: true })
@ObjectType()  
@Entity()      
export class Payment extends CommonEntity {

  @Field(type => Int)
  @Column()
  transactionId: number;

  // Many to One ~>

  @Field(type => User)
  @ManyToOne(type => User, user => user.payments)
  user: User;

  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant)  // 레스토랑에 원투매니가 없어도 매니투원 생성 쌉가능이다.
  restaurant: Restaurant;

  // id값만 가지고 오기 ~>

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field(type => Int) // 요기서만 특이하게 갖다쓸일 있어서 퓔드 설정해줌. 그래야 딴곳dto같은데서 갖다씀 .
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
