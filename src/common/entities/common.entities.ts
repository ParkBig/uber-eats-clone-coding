import { Field, ObjectType } from "@nestjs/graphql";
import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
export class CommonEntity {

  @PrimaryGeneratedColumn() // 이걸 써줘야 id 자동생성.
  @Field(type => String)
  id: number;

  @CreateDateColumn()       // 이걸 써줘야 날짜 자동생성.
  @Field(type => Date)
  createdAt: Date;

  @CreateDateColumn()
  @Field(type => Date)
  updatedAt: Date;
}