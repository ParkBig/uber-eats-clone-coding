import { ObjectType, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()   // 자동으로 스키마를 빌드하기 위해 사용하는 그래프큐엘 데코레이터다.
@Entity()       // 타입오알엠이 아래 내용을 DB에 저장할 수 있게 해준다.
export class Restaurant {
  
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number

  @Field(type => String)                                // , { nullable: true } 을 추가하여 눌라불 가능
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(type => Boolean, { nullable: true })           // 눌라블 트루 해주면 @IsOptional()안적어줘도됨
  @Column({ default: true })                            // 디폴트 트루해주면 db데이터상에 디폴트 값으로 true입력
  @IsOptional()                                         // @IsOptional()해줘야 값을 항상 안적어줘도 됨
  @IsBoolean()
  isVegan: boolean;

  @Field(type => String, { defaultValue: "강남" })      // , { nullable: true } 을 추가하여 눌라불 가능
  @Column()
  @IsString()
  address: string;

  @Field(type => String)                                // , { nullable: true } 을 추가하여 눌라불 가능
  @Column()
  @IsString()
  ownersName: string;

  @Field(type => String)
  @Column()
  @IsString()
  categoryName: string
}

// 이파일을 작성해야 DB 컬럼에 추가됨 (정확히는 @Entity()와 @Column()을 작성해줘야함.)