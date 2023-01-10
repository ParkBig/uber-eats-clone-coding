import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CommonEntity } from 'src/common/entities/common.entities';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

@InputType("RestaurantInputType", { isAbstract: true }) // 그래프큐엘 입력할떄 그 인풋값으로 쓸 수 있게하는거다 (input: {})
@ObjectType() // 그래프큐엘 데이터 받아오는 형식 즉 받아올수 있는 것들, 이걸 해줘야 요청시에 데이터 받아올수 있음 
@Entity()       // 타입오알엠이 아래 내용을 DB에 저장할 수 있게 해준다.
export class Restaurant extends CommonEntity{

  @Field(type => String)                                
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(type => String, { defaultValue: "강남" })      
  @Column()
  @IsString()
  address: string;

  @Field(type => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(type => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil: Date;

  // One to Many ~>

  @Field(type => [Dish])  // 레스토랑이 대빵이고 여러개의 메뉴(Dish)를 갖는다. 보통 대빵이 하위를 배열로갖음.
  @OneToMany(type => Dish, dish => dish.restaurant)
  menu: Dish[];

  @Field(type => [Order])
  @OneToMany(type => Order, order => order.restaurant)
  order: Order[];

  // Many to One ~>

  @ManyToOne(type => Category, category => category.restaurants, { nullable: true, onDelete: "SET NULL" })
  @Field(type => Category, { nullable: true })
  category: Category;

  @Field(type => User)  // 레스토랑은 주인이 항상 있어야한다
  @ManyToOne(type => User, user => user.restaurants, { onDelete: "CASCADE", nullable: false })
  owner: User;

  // id값만 가지고 오기 ~>

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;
}

// 이파일을 작성해야 DB 컬럼에 추가됨 (정확히는 @Entity()와 @Column()을 작성해줘야함.)
// @Field(type => Boolean, { nullable: true })           // 눌라블 트루 해주면 @IsOptional()안적어줘도됨
// @Column({ default: true })                            // 디폴트 트루해주면 db데이터상에 디폴트 값으로 true입력
// @IsOptional()                                         // @IsOptional()해줘야 값을 항상 안적어줘도 됨
// @IsBoolean()
// isVegan: boolean;
