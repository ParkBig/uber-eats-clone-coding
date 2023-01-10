import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dtos";
import { UseGuards } from "@nestjs/common";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { VerifyEmailInput, VerityEmailOutput } from "./dtos/verify-email.dto";
import { Role } from "src/auth/role.decoreator";

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}   // 서비스 넣어줘야함

  // Queries ~>

  @Query(returns => User)
  @Role(['Any'])  // 이것이 metadata를 데코레이션으로 만들어쓴거고 이걸한다는건 Authentication을 고려한다는 것.
  me(@AuthUser() authUser: User) {  // @AuthUser() authUser은 request의 헤더즈에 담긴 토큰값을 가지고 지가 알아서 판별한후 authUser에 값을 담아줌
    return authUser;
  }

  @Query(returns => UserProfileOutput)
  @Role(['Any'])  // @UseGuards(AuthGuard) 토큰을 가지고 검증한후 작동한다. 옆의 Role로 업그레이드
  userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
    return this.userService.findById(userProfileInput.userId);
  }

  // Mutations ~>

  @Mutation(returns => CreateAccountOutput)
  createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {  
    return this.userService.createAccount(createAccountInput);
  }

  @Mutation(returns => LoginOutput)
  login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Mutation(returns => EditProfileOutput)
  @Role(['Any'])
  editProfile(@AuthUser() authUser: User, @Args("input") editProfileInput: EditProfileInput): Promise<EditProfileOutput> {
    return this.userService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(returns => VerityEmailOutput)
  verifyEmail(@Args("input") verifyEmailInput: VerifyEmailInput): Promise<VerityEmailOutput> {
    return this.userService.verifyEmail(verifyEmailInput.code);
  }
}
