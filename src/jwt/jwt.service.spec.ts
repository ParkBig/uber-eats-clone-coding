import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { JwtService } from "./jwt.service"
import * as jwt from "jsonwebtoken"

const TEST_KEY = "testKey";
const USER_ID = 1;
const TOKEN = "TOKEN"

// npm module을 mock하는방법
jest.mock("jsonwebtoken", () => {
  return {
    sign: jest.fn(() => "TOKEN"),
    verify: jest.fn(() => ({id: USER_ID}))
  }
})


describe("JwtService", () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {privateKey: TEST_KEY}
        },
        {
          provide: ConfigService,
          useValue: {PRIVATE_KEY: TEST_KEY}
        }
      ],
    }).compile();
    jwtService = module.get<JwtService>(JwtService);
  });
  it("should be defined", () => {
    expect(jwtService).toBeDefined();
  });

  describe("sign", () => {

    it("should return a signed token", () => {
      const token = jwtService.sign({id:USER_ID});
      expect(typeof token).toBe("string");
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({id:USER_ID}, TEST_KEY);
    })
  });

  describe("verify", () => {
    it("should return the decoded token", () => {
      const decodedToken = jwtService.verify(TOKEN);
      expect(decodedToken).toEqual({id: USER_ID});
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
    })
  });
})
