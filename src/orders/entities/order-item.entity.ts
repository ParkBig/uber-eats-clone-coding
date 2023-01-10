import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CommonEntity } from "src/common/entities/common.entities";
import { Dish, DishChoice, DishOption } from "src/restaurants/entities/dish.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@InputType("OrderItemOptionInputType", { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  
  @Field(type =>String)
  name: string;

  @Field(type => String, { nullable: true })
  choice?: String;
}

@InputType("OrderItemInputType", { isAbstract: true })
@ObjectType()  
@Entity()
export class OrderItem extends CommonEntity {

  @Field(type => Dish, { nullable: true })
  @ManyToOne(type => Dish, { nullable: true, onDelete: "CASCADE" })
  dish: Dish;

  // 리얼리리얼리 쿨한 세부옵션기능을 만들어보았다.
  @Field(type => [OrderItemOption], { nullable: true })
  @Column({ type: "json", nullable: true })
  options?: OrderItemOption[];
}