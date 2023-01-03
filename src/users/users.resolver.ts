import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dtos";
import { UseGuards } from "@nestjs/common";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { VerifyEmailInput, VerityEmailOutput } from "./dtos/verify-email.dto";

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}   // 서비스 넣어줘야함

  // Queries ~>

  @Query(returns => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {  // @AuthUser() authUser은 request의 헤더즈에 담긴 토큰값을 가지고 지가 알아서 판별한후 authUser에 값을 담아줌
    // 토큰을 가지고 검증한후 작동한다.
    return authUser;
  }

  @Query(returns => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
    return this.userService.findById(userProfileInput.userId);
  }

  // Mutations ~>

  @Mutation(returns => CreateAccountOutput) // 와 미쳤다.ㅋㅋ 입력값만 받아서 처리한 후 결과값으로 에러 혹은 성공알려줌
  async createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {  
    return this.userService.createAccount(createAccountInput);
  }

  @Mutation(returns => LoginOutput)
  async login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Mutation(returns => EditProfileOutput)
  @UseGuards(AuthGuard)
  async editProfile(@AuthUser() authUser: User, @Args("input") editProfileInput: EditProfileInput): Promise<EditProfileOutput> {
    // 토큰을 가지고 검증한후 작동한다.
    return this.userService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(returns => VerityEmailOutput)
  async verifyEmail(@Args("input") verifyEmailInput: VerifyEmailInput): Promise<VerityEmailOutput> {
    return this.userService.verifyEmail(verifyEmailInput.code);
  }
}
