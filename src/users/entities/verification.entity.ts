import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { v4 as uuid4 } from "uuid";
import { CommonEntity } from "src/common/entities/common.entities";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";


@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CommonEntity {

  @Field(type => String)
  @Column()
  code: string;

  // 이게 지금 db상에서 userId가 되고 있는거 같은데
  // 현재 베리피케이션은 유저에 의존하고 있다. 따라서 유저를 지우려고하면 베리피케이션때매 안지워짐.
  // 따라서 아래처럼 { onDelete: "CASCADE" }설정을 하면 유저 삭제시 의존하고 있는 베리피케이션까지 같이 삭제된다.
  @OneToOne(type => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuid4();
  }
}
