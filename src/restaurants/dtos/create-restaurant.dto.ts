import { ArgsType, Field, InputType, OmitType } from "@nestjs/graphql"
import { Restaurant } from "../entities/restaurant.entity";

@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ["id"], InputType) {} // 현재 Restaurant은 객체타입이라서 InputType으로 변경


// extends 하기전의 내용. entities바뀔때마다 dto도 수정해줘야되는데 자동으로 되게끔 하기위해서 위로바꿈.
// {  
//   @Field(type => String)
//   @IsString()
//   @Length(5, 10)
//   name: string;

//   @Field(type => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field(type => String)
//   @IsString()
//   address: string;

//   @Field(type => String)
//   @IsString()
//   ownersName: string;

//   @Field(type => String)
//   @IsString()
//   categoryName: string
// }

// 이 dto에서 명시하지 않은 것들은 자동완성에 안뜸,
// 또한 명시하지 않아 놓고 쓰면 에러 발생