import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { CommonOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";


@ArgsType()
export class UserProfileInput {

  @Field(type => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CommonOutput {

  @Field(type => User, { nullable: true})
  user?: User;
}

// PartialType 고른 것을(혹은 고른것을 제외하고) 입맛대로 쓸수 있게
// PickType 고른 것을 무조건 써야함
// OmitType 고른 것을 제외하고 무조건 써야함
