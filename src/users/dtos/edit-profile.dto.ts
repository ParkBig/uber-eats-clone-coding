import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CommonOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@InputType()
export class EditProfileInput extends PartialType(PickType(User, ["email", "password"])) {}

@ObjectType()
export class EditProfileOutput extends CommonOutput {}

// PartialType 고른 것을(혹은 고른것을 제외하고) 입맛대로 쓸수 있게
// PickType 고른 것을 무조건 써야함
// OmitType 고른 것을 제외하고 무조건 써야함

// 그리고 위의 요소 사용할땐 아직까진 entities에서 가져와 쓰고있다.
