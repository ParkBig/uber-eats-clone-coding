import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CommonEntity } from "src/common/entities/common.entities";
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator";

enum UserRole {
  Client,       // 0
  Owner,        // 1
  Delivery      // 2
}

registerEnumType(UserRole, { name: "UserRole" })

@InputType({ isAbstract: true })
@ObjectType()
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
