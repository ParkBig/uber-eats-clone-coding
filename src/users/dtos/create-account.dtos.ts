import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CommonOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@InputType()
export class CreateAccountInput extends PickType(User, ["email", "password", "role"]) {}

@ObjectType()
export class CreateAccountOutput extends CommonOutput {}

// PartialType 고른 것을(혹은 고른것을 제외하고) 입맛대로 쓸수 있게
// PickType 고른 것을 무조건 써야함
// OmitType 고른 것을 제외하고 무조건 써야함
