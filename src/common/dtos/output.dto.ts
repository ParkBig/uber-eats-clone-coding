import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CommonOutput {
  
  @Field(type => String, { nullable: true })
  error?: string;

  @Field(type => Boolean)
  ok: boolean;
}

// PartialType 고른 것을(혹은 고른것을 제외하고) 입맛대로 쓸수 있게
// PickType 고른 것을 무조건 써야함
// OmitType 고른 것을 제외하고 무조건 써야함
