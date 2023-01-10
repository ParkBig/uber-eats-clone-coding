import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CommonEntity } from "src/common/entities/common.entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { Order } from "src/orders/entities/order.entity";
import { Payment } from "src/payments/entities/payment.entity";

export enum UserRole {
  Client = "Client",
  Owner = "Owner",
  Delivery = "Delivery"
}

registerEnumType(UserRole, { name: "UserRole" })

@InputType("UserInputType", { isAbstract: true }) // 그래프큐엘 입력할떄 그 인풋값으로 쓸 수 있게하는거다 (input: {})
@ObjectType() // 그래프큐엘 데이터 받아오는 형식 즉 받아올수 있는 것들, 이걸 해줘야 요청시에 데이터 받아올수 있음 
@Entity()
export class User extends CommonEntity {

  @Field(type => String)
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field(type => String)
  @Column({ select: false })
  @IsString()
  password: string;

  @Field(type => UserRole)
  @Column({type: "enum", enum: UserRole})
  @IsEnum(UserRole)
  role: UserRole;

  @Field(type => Boolean)
  @Column({ default: false })
  @IsBoolean()
  verified: boolean;


  // 원투 매니 ~>

  @Field(type => [Restaurant])
  @OneToMany(type => Restaurant, restaurant => restaurant.owner)
  restaurants: Restaurant[];
  
  @Field(type => [Order])
  @OneToMany(type => Order, orders => orders.customer)
  orders: Order[];

  @Field(type => [Order])
  @OneToMany(type => Order, orders => orders.driver)
  rides: Order[];

  @Field(type => [Payment])
  @OneToMany(type => Payment, payment => payment.user, { eager: true })
  payments: Payment[];

  // 여타 로직 ~>

  @BeforeInsert() // 유저 서비스에서 this.users.save 하기전에 작동.
  @BeforeUpdate() // 유저 서비스에서 this.users.update 하기전에 작동.
  async hashPassword(): Promise<void > {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10)
      } catch (e) {
        // console.log(e)
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      // console.log(e)
      throw new InternalServerErrorException();
    }
  }
}
