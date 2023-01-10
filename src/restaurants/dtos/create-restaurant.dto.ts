import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql"
import { CommonOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entity";

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ["name", "coverImage", "address"]) {
  
  @Field(type => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CommonOutput {}

// PartialType 고른 것을(혹은 고른것을 제외하고) 입맛대로 쓸수 있게
// PickType 고른 것을 무조건 써야함
// OmitType 고른 것을 제외하고 무조건 써야함
