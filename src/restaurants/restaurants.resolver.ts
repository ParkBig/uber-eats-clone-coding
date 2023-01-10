import { Resolver, Query, Args, Mutation, ResolveField, Int, Parent } from "@nestjs/graphql"
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decoreator";
import { User } from "src/users/entities/user.entity";
import { AllCategoriesOutput } from "./dtos/all-actegories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(of => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // Queries ~>

  @Query(returns => RestaurantsOutput)
  restaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(returns => RestaurantOutput)
  restaurant(@Args("input") restaurantInput: RestaurantInput): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query(returns => SearchRestaurantOutput)
  searchRestaurant(@Args("input") searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }

  // Mutations ~>

  @Mutation(returns => CreateRestaurantOutput, {nullable: true})
  @Role(["Owner"])  
  createRestaurant(@AuthUser() authUser: User, @Args("input") createRestaurantDto: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(authUser, createRestaurantDto);
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(["Owner"])
  editRestaurant(@AuthUser() owner: User, @Args("input") editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(returns => DeleteRestaurantOutput)
  @Role(["Owner"])
  deleteRestaurant(@AuthUser() owner: User, @Args("input") deleteRestaurantInput: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurantInput(owner, deleteRestaurantInput);
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(returns => Int) // 매 request마다 계산된 field를 만들어준다.(DB에는 존재하지 않고 GraphQL 스키마에만 존재) ex) 좋아요 카운트
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category)
  }

  @Query(returns => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(returns => CategoryOutput)
  category(@Args("input") categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput)
  }
}

@Resolver(of => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(returns => CreateDishOutput)
  @Role(["Owner"])
  createDish(@AuthUser() owner: User, @Args("input") createDishInput: CreateDishInput): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation(returns => DeleteDishOutput)
  @Role(["Owner"])
  deleteDish(@AuthUser() owner: User, @Args("input") deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }

  @Mutation(returns => EditDishOutput)
  @Role(["Owner"])
  editDish(@AuthUser() owner: User, @Args("input") editDishInput: EditDishInput): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }
}

// @Args()다음에 오는 Dto타입이 Args 타입이면 @Args() 괄호안에 아무것도 안 적어야한다.
// @Args()다음에 오는 Dto타입이 Input 타입이면 @Args() 괄호안에 아무 이름 이든 적어줘야 한다.
