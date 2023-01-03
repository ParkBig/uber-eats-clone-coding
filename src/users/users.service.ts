import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common"
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateAccountInput } from "./dtos/create-account.dtos";
import { LoginInput } from "./dtos/login.dto";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { VerityEmailOutput } from "./dtos/verify-email.dto";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,                         // InjectRepository하면 DB의 TABLE 엔티티 사용가능 즉 DB를 가지고 뭘 하겠다는거
    @InjectRepository(Verification) private readonly verification: Repository<Verification>,  // 요기도 엔티티 넣어줘야함
    // private readonly config: ConfigService,     // app.module의 ConfigModule 내용 가져와 쓸 수 있음.
    private readonly jwtService: JwtService,    // JwtService 내용 가져와 쓸 수 있음.
    private readonly mailService: MailService,  // MailService 내용 가져와 쓸 수 있음.
    ) {} 

  async createAccount({email, password, role}: CreateAccountInput): Promise<{ ok: boolean, error?: string }> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) return { ok: false, error: "There is a user with that email already" };
      const user = await this.users.save(this.users.create({ email, password, role }));
      const verification = await this.verification.save(this.verification.create({ user }));
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true }
    } catch (error) {
      return { ok: false, error: "Couldn't create Account"};
    }
  }

  async login({email, password}: LoginInput): Promise<{ ok: boolean, error?: string, token?: string }> {
    try {
      const user = await this.users.findOne({ where: { email }, select: ['password', 'id'] });
      if (!user) return { ok: false, error: "User not Found" };
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) return { ok: false, error: "Password not Correct" };
      const token = this.jwtService.sign({ id: user.id });
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error: "Can't log user in." };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ where: { id } });
      return { ok: Boolean(user), user };
    } catch (error) {
      return { ok: false, error: "User Not  Found", };
    }
  }

  async editProfile(userId: number, { email, password }: EditProfileInput): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({where: { id: userId }});
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verification.delete({user: {id:user.id}})
        const verification = await this.verification.save(this.verification.create({ user }));
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) { 
        user.password = password 
      }
      await this.users.save(user);
      return { ok: true }
    } catch (error) {
      console.log(error)
      return { ok: false, error: "Could not update profile." };
    }
  }

  async verifyEmail(code: string): Promise<VerityEmailOutput> {
    try {
      // 테이블끼리 관계형으로서 한테이블의 값으로 다른 테이블 값 가져올려면 relationship은 비용이 많이 드는 작업이라,
      // 아래 코드처럼 분명하게 쓰겠다고 명시를 해줘야 사용가능
      const verification = await this.verification.findOne({ where: { code }, relations: ["user"] });
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: "Verification not found." };
    } catch (error) {
      return { ok: false, error: "Could not verify email." };
    }
  }
}

// .save()
// DBTableName.save() ()안의 값이 DBTableName에 존재하지 않는 값이라면 create해서 insert한다.
// DBTableName.save() ()안의 값이 DBTableName에 존재한다면 update한다.

// .update()
// DBTableName.update() ()안의 값이 존재하든 말든 그냥 매우빠르게 DB에 쿼리를 날려 업데이트한다.
// 따라서 @BeforeUpdate() 데코레이터가 작동하지 않는다.
