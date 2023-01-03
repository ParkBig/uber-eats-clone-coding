import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = "/graphql";
const testUser = {
  email: "kingtest@naver.com",
  password: "12345",
  newEmail: "chagetest@naver.com"
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: String;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) => baseTest().set({"X-JWT": jwtToken}).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification))
    await app.init(); // 앱 켜놓은걸
  });
  afterAll(async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'parkbig',
      password: 'anjfqhk1',
      database: 'uber-eats-test',
    });
    const connection = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();
    app.close();  // 꺼줘야 한다.
  });

  describe("MUTATIONS, createAccount", () => {
    
    it("should create account", () => {
      return publicTest(`
        mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}"
            role: Owner
          }) {
            ok
            error
          }
        }
      `)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null)
        });
    });

    it("should fail if account already exists", () => {
      return publicTest(`
        mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}"
            role: Owner
          }) {
            ok
            error
          }
        }
      `)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe("There is a user with that email already")
        });
    });
  });
  
  describe("MUTATIONS, login", () => {

    it("should login with correct credentials", () => {
      return publicTest(`
        mutation {
          login(input: {
            email: "${testUser.email}",
            password: "${testUser.password}"
          }) {
            ok
            error
            token
          }
        }
      `)
        .expect(200)
        .expect(res => {
          expect(res.body.data.login.ok).toBe(true);
          expect(res.body.data.login.error).toBe(null);
          expect(res.body.data.login.token).toEqual(expect.any(String));
          jwtToken = res.body.data.login.token;
        });
    });

    it("should not be able to login with wrong credentials", () => {
      return publicTest(`
        mutation {
          login(input: {
            email: "${testUser.email}",
            password: "11111111111"
          }) {
            ok
            error
            token
          }
        }
      `)
        .expect(200)
        .expect(res => {
          expect(res.body.data.login.ok).toBe(false);
          expect(res.body.data.login.error).toBe("Password not Correct");
          expect(res.body.data.login.token).toEqual(null);
        });
    });
  });

  describe("QUERIES, userProfile", () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it("should see a user's profile", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set({"X-JWT": jwtToken}).send({
        query: `
          {
            userProfile(userId:${userId}) {
              ok
              error
              user {
                id
              }
            }
          }
        `
      })
        .expect(200)
        .expect(res => {
          expect(res.body.data.userProfile.ok).toBe(true);
          expect(res.body.data.userProfile.error).toBe(null);
          expect(res.body.data.userProfile.user.id).toEqual(`${userId}`);
        })
    });

    it("should not found a profile", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set({"X-JWT": jwtToken}).send({
        query: `
          {
            userProfile(userId:666) {
              ok
              error
              user {
                id
              }
            }
          }
        `
      })
        .expect(200)
        .expect(res => {
          expect(res.body.data.userProfile.ok).toBe(false);
          expect(res.body.data.userProfile.error).toBe("User Not  Found");
          expect(res.body.data.userProfile.user).toBe(null);
        })
    });
  });

  describe("QUERIES, me", () => {

    it("should find my profile", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set({"X-JWT": jwtToken}).send({
        query: `
          {
            me {
              email
            }
          }
        `
      })
        .expect(200)
        .expect(res => {
          expect(res.body.data.me.email).toBe(testUser.email);
        });
    });

    it("should not allow logged out user", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          {
            me {
              email
            }
          }
        `
      })
        .expect(200)
        .expect(res => {
          expect(res.body.errors[0].message).toBe("Forbidden resource");
        });
    })
  })

  describe("MUTATIONS, editProfile", () => {

    it("should change email", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set({"X-JWT": jwtToken}).send({
        query: `
          mutation {
            editProfile(input: {
              email: "${testUser.newEmail}"
            }) {
              ok
              error
            }
          }
        `
      })
        .expect(200)
        .expect(res => {
          expect(res.body.data.editProfile.ok).toBe(true);
          expect(res.body.data.editProfile.error).toBe(null);
        });
    });
    
    it("should have new email", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set({ 'X-JWT': jwtToken }).send({
        query: `
          {
            me {
              email
            }
          }
        `,
      })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.newEmail);
        });
    });
  });

  describe("MUTATIONS, verifyEmail", () => {
    let verificationCode: string;

    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });

    it('should verify email', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            verifyEmail(input:{
              code:"${verificationCode}"
            }){
              ok
              error
            }
          }
        `,
      })
        .expect(200)
        .expect(res => {
          expect(res.body.data.verifyEmail.ok).toBe(true);
          expect(res.body.data.verifyEmail.error).toBe(null);
        });
    });

    it('should fail on verification code not found', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
          mutation {
            verifyEmail(input:{
              code:"xxxxx"
            }){
              ok
              error
            }
          }
        `,
      })
        .expect(200)
        .expect(res => {
          expect(res.body.data.verifyEmail.ok).toBe(false);
          expect(res.body.data.verifyEmail.error).toBe("Verification not found.");
        });
    });
  });
});
