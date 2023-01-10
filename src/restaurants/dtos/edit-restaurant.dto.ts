import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { CommonOutput } from "src/common/dtos/output.dto";
import { CreateRestaurantInput } from "./create-restaurant.dto";


@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  
  @Field(type => Number)
  restaurantId: number;
};

@ObjectType()
export class EditRestaurantOutput extends CommonOutput {};


// PartialType 고른 것을(혹은 고른것을 제외하고) 입맛대로 쓸수 있게
// PickType 고른 것을 무조건 써야함
// OmitType 고른 것을 제외하고 무조건 써야함
