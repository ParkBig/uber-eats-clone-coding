import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service"
import got from 'got';
import * as FormData from 'form-data';

// 라이브러리는 이런식으로 꼭 해줘야함
jest.mock("got");
jest.mock("form-data");

const TEST_DOMAIN = "test-domain";

describe("MailService", () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        { // 인터페이스 내용 가져온다고 생각하면 된다.
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: "test-apiKey",
            domain: TEST_DOMAIN,
            fromEmail: "test-fromEmail",
          }
        },
        {
          provide: ConfigService,
          useValue: {
            apiKey: "test-apiKey",
            domain: TEST_DOMAIN,
            fromEmail: "test-fromEmail",
          }
        }
      ],
    }).compile();
    mailService = module.get<MailService>(MailService);
  })
  it("should be defined", () => {
    expect(mailService).toBeDefined();
  });


  describe("sendVerificationEmail", () => {

    it("should call sendEmail", () => {
      const sendVerificationEmailArg = {
        email: "email",
        code: "code"
      };
      // 함수를 테스트하고싶은데 mock하긴 싫을때, 함수를 테스트하기 위해선 mock을 하면 안됨.
      jest.spyOn(mailService,"sendEmail").mockImplementation(async () => true)
      mailService.sendVerificationEmail(sendVerificationEmailArg.email, sendVerificationEmailArg.code);

      expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        "Verify Your Email", "verify-email", 
        [{key:"code", value: sendVerificationEmailArg.code}, {key:"username", value: sendVerificationEmailArg.email}]
      );
    });
  });

  describe("sendEmail", () => {

    it("sends email", async () => {
      const ok = await mailService.sendEmail("", "", []);
      const formSpy = jest.spyOn(FormData.prototype, "append");

      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(`https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, expect.any(Object));
      expect(ok).toEqual(true);
    });
    it("fails on error", async () => {
      jest.spyOn(got, "post").mockImplementation(() => {
        throw new Error();
      });
      const ok = await mailService.sendEmail("", "", []);
      expect(ok).toEqual(false);
    });
  });
});
