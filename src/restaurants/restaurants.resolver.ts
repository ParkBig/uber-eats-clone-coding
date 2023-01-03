import { Resolver, Query, Args, Mutation} from "@nestjs/graphql"
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { updateRestaurantDto } from "./dtos/updateRestaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";


@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(returns => [Restaurant])
  restaurant(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => Boolean, {nullable: true})
  async createRestaurant(@Args("input") createRestaurantDto: CreateRestaurantDto): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      // console.log(e);
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(@Args("input") updateRestaurantDto: updateRestaurantDto): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDto);
      return true;
    } catch (e) {
      // console.log(e);
      return false;
    }
  }
}

// @Args()다음에 오는 Dto타입이 Args 타입이면 @Args() 괄호안에 아무것도 안 적어야한다.
// @Args()다음에 오는 Dto타입이 Input 타입이면 @Args() 괄호안에 아무 이름 이든 적어줘야 한다.