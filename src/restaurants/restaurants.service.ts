import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { ILike, Like, Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-actegories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateDishInput } from "./dtos/create-dish.dto";
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
import { Restaurant } from "./entities/restaurant.entity"
import { CategoryRepository } from "./respositories/category.repository";

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(CategoryRepository) private readonly categories: CategoryRepository,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
  ) {}

  async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(createRestaurantInput.categoryName);
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return { ok: true }
    } catch (error) {
      return { ok: false, error: "Could not create restaurant." }
    }
  }

  async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({ where: {id: editRestaurantInput.restaurantId}, loadRelationIds: true });  // ??????????????? id??? ????????????.
      if (!restaurant) return { ok: false, error: "Restaurant not found" };
      if (owner.id !== restaurant.ownerId) return { ok: false, error: "You can't edit a restaurant that you don't own." };

      let category: Category = null;
      if(editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(editRestaurantInput.categoryName)
      };
      await this.restaurants.save([{
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && {category})
      }])
      return { ok: true };
    } catch(error) {
      return { ok: false, error: "Could not edit restaurant."};
    }
  }

  async deleteRestaurantInput(owner: User, {restaurantId}: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({ where: {id: restaurantId}, loadRelationIds: true });  // ??????????????? id??? ????????????.
      if (!restaurant) return { ok: false, error: "Restaurant not found" };
      if (owner.id !== restaurant.ownerId) return { ok: false, error: "You can't delete a restaurant that you don't own." };
      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not delete restaurant."};
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories }
    } catch (error) {
      return { ok: false, error: "Could not load categories." };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurants.count({ where: { category: { id: category.id } } });
  }

  // ????????? ??????????????? ???????????????.
  async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ where: { slug }, relations: ["restaurants"] });
      if (!category) return { ok: false, error: "Category not found." };
      const restaurants = await this.restaurants.find({ where: { category: { id: category.id } }, take: 25, skip: (page - 1) * 25, order: { isPromoted: "DESC" }  });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return { ok: true, category, restaurants, totalPages: Math.ceil(totalResults / 25) }
    } catch (error) {
      return { ok: false, error: "  Could not load category." };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({ skip: (page - 1) * 25, take: 25, order: { isPromoted: "DESC" } });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch {
      return { ok: false,  error: 'Could not load restaurants' };
    }
  }

  async findRestaurantById({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({where: {id: restaurantId}, relations: ["menu"]});
      if (!restaurant) return { ok: false, error: "Restaurant not found." };
      return { ok: true, restaurant };
    } catch (error) {
      return { ok: false, error: "Could not find restaurant." }
    }
  }

  async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({ where: { name: ILike(`%${query}%`) }, skip: (page - 1) * 25, take: 25 });
      return { ok: true, restaurants, totalResults, totalPages: Math.ceil(totalResults / 25) }
    } catch (error) {
      return { ok: false, error: "Could not search for restaurant." }
    }
  }

  async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({ where: { id: createDishInput.restaurantId } });
      if (!restaurant) return { ok: false, error: "Restaurant not found." };
      if (owner.id !== restaurant.ownerId) return { ok: false, error: "You do not have access." };
      const dish = await this.dishes.create(createDishInput);
      dish.restaurant = restaurant; // ????????? dish.restaurant??? restaurant??? restaurantId??? ????????? ????????? ?????? restaurant??? const???????????? restaurant???????????? ??????????????????
      await this.dishes.save(dish);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not create dish." }
    }
  }
  
  async deleteDish(owner: User, { dishId }: DeleteDishInput): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne({ where: { id: dishId }, relations: ["restaurant"] });
      if (!dish) return { ok: false, error: "Dish not found" };
      if (dish.restaurant.ownerId !== owner.id) return { ok: false, error: "You do not have access." };
      await this.dishes.delete(dishId);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not delete dish." };
    }
  }

  async editDish(owner: User, editDishInput: EditDishInput): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne({ where: { id: editDishInput.dishId }, relations: ["restaurant"] });
      if (!dish) return { ok: false, error: "Dish not found" };
      if (dish.restaurant.ownerId !== owner.id) return { ok: false, error: "You do not have access." };
      await this.dishes.save([{ id: editDishInput.dishId, ...editDishInput, }]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not edit dish." };
    }
  }

}

// ?????????????????? ????????? ?????????js ???????????? ?????? ????????????.
// save??? id??? ???????????? ?????? ?????? ????????????.
