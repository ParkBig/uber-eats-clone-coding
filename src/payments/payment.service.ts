import { Injectable } from "@nestjs/common";
import { Cron, Interval } from "@nestjs/schedule/dist";
import { SchedulerRegistry } from "@nestjs/schedule/dist/scheduler.registry";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { LessThan, Repository } from "typeorm";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { GetPaymentOutput } from "./dtos/get-payments.dto";
import { Payment } from "./entities/payment.entity";


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(owner: User, { transactionId, restaurantId }: CreatePaymentInput): Promise<CreatePaymentOutput>{
    try {
      const restaurant = await this.restaurants.findOne({ where: { id: restaurantId } });
      if (!restaurant) return { ok: false, error: "Restaurant not found." };
      if (restaurant.ownerId !== owner.id) return { ok: false, error: "You are not allowed to do this." };
      await this.restaurants.save(this.payments.create({ transactionId, user: owner, restaurant }));
      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      this.restaurants.save(restaurant); 
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not create payment." };
    }
  }

  async getPayments(owner: User): Promise<GetPaymentOutput> {
    try {
      const payments = await this.payments.find({ where: { user: { id : owner.id } } });
      return { ok: true, payments };
    } catch (error) {
      return { ok: false, error: "Could not get payment." };
    }
  }

  // Schedule ~>
  // 고정된 날짜/시간, 반복 간격 또는 지정된 간격마다 특정 메서드나 함수를 한 번 실행되도록 예약할 수 있습니다.
  // * * * * * * => 별6개이며 왼쪽부터 초(옵셔날), 분, 시, 일 of 월, 월, 일 of 윅 https://docs.nestjs.com/techniques/task-scheduling

  @Cron("0 0 0 * * *")
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({ where: { isPromoted: true, promotedUntil: LessThan(new Date()) } });
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant)
    })
  }

  // @Cron("30 * * * * *", {
  //   name: "myJob"
  // })
  // async checkForPayment() {
  //   console.log("Check baby by Cron");
  //   const job = this.schedulerRegistry.getCronJob("myJob");
  //   job.stop() // 한번 실행하고 이젠 다시 안됨. ㅋ
  // }

  // @Interval(60000)
  // async checkForPaymentsss() {
  //   console.log("Check baby by Interval")
  // }

}
