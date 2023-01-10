import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { provideCustomRepository } from 'src/customDatabase/customRepository';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './respositories/category.repository';
import { CategoryResolver, DishResolver, RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish])],  // 서비스에서 쓸 레포지토리 가져오는 것.
  providers: [RestaurantResolver, CategoryResolver, RestaurantService, DishResolver, provideCustomRepository(Category, CategoryRepository)],
})
export class RestaurantsModule {}
