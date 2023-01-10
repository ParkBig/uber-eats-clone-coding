import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CommonOutput } from "src/common/dtos/output.dto";
import { Verification } from "../entities/verification.entity";

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}

@ObjectType()
export class VerityEmailOutput extends CommonOutput {}

// PartialType 고른 것을(혹은 고른것을 제외하고) 입맛대로 쓸수 있게
// PickType 고른 것을 무조건 써야함
// OmitType 고른 것을 제외하고 무조건 써야함
