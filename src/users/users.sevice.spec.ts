import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service";
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(() => "signed-token-baby"),
  verify: jest.fn(),
});
const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T =any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UserService", () => {

  let service: UsersService;
  let mailService: MailService;
  let jwtService: JwtService;
  let usersRepository: Partial<Record<keyof Repository<User>, jest.Mock>>; // === MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>; // === Partial<Record<keyof Repository<Verification>, jest.Mock>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("createAccount", () => {
    const createAccountArg = {
      email: "test@naver.com",
      password: "test",
      role: 0
    };

    it("should fail if user exists", async () => {
      usersRepository.findOne.mockResolvedValue({ id:1, email: "what the fuck?" });

      const result = await service.createAccount(createAccountArg);
      expect(result).toMatchObject({ ok: false, error: "There is a user with that email already" })
    });
    it("should create a new user", async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArg);
      usersRepository.save.mockResolvedValue(createAccountArg);
      verificationsRepository.create.mockReturnValue({user: createAccountArg});
      verificationsRepository.save.mockResolvedValue({code: "code"});
      
      const result = await service.createAccount(createAccountArg);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArg);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArg);
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({user: createAccountArg,});
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({user: createAccountArg});
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));
      expect(result).toEqual({ ok: true });
    });
    it("should fail on exception", async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.createAccount(createAccountArg);
      expect(result).toEqual({ ok: false, error: "Couldn't create Account"})
    });
  });

  describe("login", () => {
    const loginArg = {
      email: "test@naver.com",
      password: "test",
    };

    it("should fail if user does not exist", async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArg);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: false, error: "User not Found" });
    });
    it("should fail if the password is wrong", async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false))
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArg);
      expect(result).toEqual({ ok: false, error: "Password not Correct" });
    });
    it("should return token if password correct", async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true))
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArg);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArg);
      expect(result).toEqual({ ok: false, error: "Can't log user in." });
    });
  });

  describe("findById", () => {
    const findByIdArgs = {
      id:1,
    }

    it("should find an existing user", async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);

      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs })
    });
    it("should fail if no user is found", async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: "User Not  Found", });
    });
  });

  describe("editProfile", () => {

    it("should change Email", async () => {
      const oldUser = {
        email: "test.naver.com",
        verified: true
      };
      const editProfileArg = {
        userId: 1,
        input: {email: "newtest@naver.com"}
      };
      const newVerification = {
        code: "code"
      };
      const newUser = {
        verified: false,
        email: editProfileArg.input.email
      }
      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockReturnValue(newVerification);

      await service.editProfile(editProfileArg.userId, editProfileArg.input);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({where: {id: editProfileArg.userId}});
      expect(verificationsRepository.create).toHaveBeenCalledWith({user: newUser});
      expect(verificationsRepository.save).toHaveBeenCalledWith(newVerification);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVerification.code)
    });
    it("should change password", async () => {
      const editProfileArg = {
        userId: 1,
        input: {password: "newPassword"}
      };
      usersRepository.findOne.mockResolvedValue({ password: "oldPassword" });

      const result = await service.editProfile(editProfileArg.userId, editProfileArg.input);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArg.input);
      expect(result).toEqual({ ok: true });
    });
    it("should fail on exception", async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      
      const result = await service.editProfile(1, {email: "test@naver.com", password: "test"})
      expect(result).toEqual({ ok: false, error: "Could not update profile." })
    })
  });

  describe("verifyEmail", () => {

    it("should verify email", async () => {
      const mockVerification = {
        user: {
          verified: false,
        },
        id: 1
      };
      verificationsRepository.findOne.mockResolvedValue(mockVerification);

      const result = await service.verifyEmail("");
      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });
      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(mockVerification.id);
      expect(result).toEqual({ ok: true })
    })
    it("should fail on verification not found", async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail("");

      expect(result).toEqual({ ok: false, error: "Verification not found." });
    });
    it("should fail on exception", async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail("");

      expect(result).toEqual({ ok: false, error: "Could not verify email." });
    });
  });

})

// Record
// 속성 키가 Key이고 속성 값이 Type인 객체 유형을 구성합니다.
// 이 유틸리티는 유형의 속성을 다른 유형에 매핑하는 데 사용할 수 있습니다.
// ```
// interface CatInfo {
// age: number;
// breed: string;
// }
// type CatName = "miffy" | "boris" | "mordred";
// const cats: Record< CatName, CatInfo > = {
// miffy: { age: 10, breed: "Persian" },
// boris: { age: 5, breed: "Maine Coon" },
// mordred: { age: 16, breed: "British Shorthair" },
// };
// cats.boris;
// ```
// https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
// Keyof Type Operator
// keyof 연산자는 객체 type을 사용하여 해당 키의 문자열 또는 숫자 리터럴 통합을 생성합니다.
// ```
// type Point = { x: number; y: number };
// const hello: keyof Point; // hello에는 x, y만 할당 가능
// ```
// https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
