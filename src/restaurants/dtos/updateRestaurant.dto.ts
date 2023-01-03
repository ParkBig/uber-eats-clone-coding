import { ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./create-restaurant.dto";


@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {} // 현재 Restaurant은 객체타입이라서 InputType으로 변경

@InputType()
export class updateRestaurantDto {
  
  @Field(type => Number)
  id: number;

  @Field(type => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}