import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CommonEntity } from 'src/common/entities/common.entities';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType("CategoryInputType", { isAbstract: true }) // 그래프큐엘 입력할떄 그 인풋값으로 쓸 수 있게하는거다 (input: {})
@ObjectType()   // 그래프큐엘 데이터 받아오는 형식 즉 받아올수 있는 것들, 이걸 해줘야 요청시에 데이터 받아올수 있음 
@Entity()       // 타입오알엠이 아래 내용을 DB에 저장할 수 있게 해준다.
export class Category extends CommonEntity {

  @Field(type => String)                                
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImage: string;

  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  // 카테고리는 많은 레스토랑을 가지고 있다. 반면 하나의 레스토랑은 하나의 카테고리만 가능. 짝지가 필요
  @OneToMany(type => Restaurant, restaurant => restaurant.category)
  @Field(type => [Restaurant])
  restaurants: Restaurant[];
}
