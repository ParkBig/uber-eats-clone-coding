import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CommonEntity } from 'src/common/entities/common.entities';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType("DishChoiceInputType", { isAbstract: true })
@ObjectType()
export class DishChoice {
  
  @Field(type => String)
  name: string;

  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType("DishOptionInputType", { isAbstract: true })
@ObjectType()
export class DishOption {
  
  @Field(type =>String)
  name: string;

  @Field(type => [DishChoice], { nullable: true })
  choices?: DishChoice[];

  @Field(type => Int, { nullable: true })
  extra?: number;
}


@InputType("DishInputType", { isAbstract: true }) // 그래프큐엘 입력할떄 그 인풋값으로 쓸 수 있게하는거다 (input: {})
@ObjectType()   // 그래프큐엘 데이터 받아오는 형식 즉 받아올수 있는 것들, 이걸 해줘야 요청시에 데이터 받아올수 있음 
@Entity()       // 타입오알엠이 아래 내용을 DB에 저장할 수 있게 해준다.
export class Dish extends CommonEntity {

  @Field(type => String)                                
  @Column()
  @IsString()
  @Length(2)
  name: string;

  @Field(type => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  photo: string;

  @Field(type => String)
  @Column()
  @Length(5, 140)
  description: string;

  // 리얼리리얼리 쿨한 세부옵션기능을 만들어보았다.
  @Field(type => [DishOption], { nullable: true })
  @Column({ type: "json", nullable: true })
  options?: DishOption[];

  // 레스토랑은 여러개의 디쉬를 가질꺼다
  @ManyToOne(type => Restaurant, restaurant => restaurant.menu, { onDelete: "CASCADE", nullable: false })
  @Field(type => Restaurant)
  restaurant: Restaurant;

  // 디쉬(menu)와 관계된 레스토랑의 아이디만 가져다 쓰고싶을떄 사용.
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;
}
