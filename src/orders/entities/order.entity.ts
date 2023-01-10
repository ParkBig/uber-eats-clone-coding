import { ObjectType, Field, InputType, registerEnumType, Int, Float } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsString, Length } from 'class-validator';
import { CommonEntity } from 'src/common/entities/common.entities';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = "Pending",
  Cooking = "Cooking",
  Cooked = "Cooked",
  PickedUp = "PickedUp",
  Delivered = "Delivered",
};

registerEnumType(OrderStatus, { name: "OrderStatus" });

@InputType("OrderInputType", { isAbstract: true })
@ObjectType()  
@Entity()      
export class Order extends CommonEntity {

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.orders, { onDelete: "SET NULL", nullable: true, eager: true })  // eager: true => 릴레이션을 좀더 섹쉬하게 받아 사용할 수 있다. 비슷한거 => lazy 릴레이션쉽
  customer?: User;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.rides, { onDelete: "SET NULL", nullable: true, eager: true })
  driver?: User;

  @Field(type => Restaurant, { nullable: true })
  @ManyToOne(type => Restaurant, restaurant => restaurant.order, { onDelete: "SET NULL", nullable: true, eager: true })
  restaurant: Restaurant;

  @RelationId((order: Order) => order.customer) // id값만 가지고 오고 싶을떄.
  customerId: number;

  @RelationId((order: Order) => order.driver) // id값만 가지고 오고 싶을떄.
  driverId: number;

  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem, { eager: true })
  @JoinTable()  // 소유권 쪽에 써줘야함. => Dish는 얼마나 많은 Order받았는지 알 필요없다. 하지만 Order는 알아야하기 때문.
  items: OrderItem[];

  @Field(type => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number;

  @Field(type => OrderStatus)
  @Column({type: "enum", enum: OrderStatus, default: OrderStatus.Pending})
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
