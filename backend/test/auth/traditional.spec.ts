import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Model, Types } from 'mongoose';
import { UserEntity } from '../../src/user/core/entities/user.entity';
import { AuthTraditionalUtils } from '../utils/auth-traditional-utils';
import { createTestApp } from '../utils/bootstrap';
import { closeInMemoryMongoServer } from '../utils/mongo-in-memory-server';
import { sleep } from '../utils/sleep';

describe('Auth (traditional)', () => {
  let app: INestApplication<App>;
  let userModel: Model<UserEntity>;
  let authUtils: AuthTraditionalUtils;

  beforeAll(async () => {
    const result = await createTestApp();

    app = result.app;
    userModel = result.models.userModel;
    authUtils = new AuthTraditionalUtils(app);
  });

  beforeEach(async () => {
    await userModel.deleteMany();
  });

  afterAll(async () => {
    await closeInMemoryMongoServer();
    await app.close();
  });

  it('registers user and logs him in', async () => {
    // when
    const response = await request(app.getHttpServer())
      .post('/auth/traditional/register')
      .send({
        email: 'test@test.com',
        password: 'password',
      });

    // then
    const user = (await userModel.findOne())!;

    expect(response.body.token).toContain('ey');
    expect(user.email).toEqual('test@test.com');
  });

  it('logs user in with correct password', async () => {
    // given
    await authUtils.registerUser({
      email: 'test@test.com',
      password: 'password',
    });

    // when
    const response = await request(app.getHttpServer())
      .post('/auth/traditional/login')
      .send({
        email: 'test@test.com',
        password: 'password',
      });

    // then
    expect(response.body.token).toContain('ey');
  });

  it('does not log user in with incorrect password', async () => {
    // given
    await authUtils.registerUser({
      email: 'test@test.com',
      password: 'password',
    });

    // when
    const response = await request(app.getHttpServer())
      .post('/auth/traditional/login')
      .send({
        email: 'test@test.com',
        password: 'incorrect',
      });

    // then
    expect(response.status).toBe(401);
  });

  it('updates user last activity date on login', async () => {
    // given
    await authUtils.registerUser({
      email: 'test@test.com',
      password: 'password',
    });

    const userBeforeLogin = (await userModel.findOne())!;
    const lastActivityDateBeforeLogin = userBeforeLogin.lastActivityDate;

    // when
    await authUtils.loginUser({
      email: 'test@test.com',
      password: 'password',
    });

    // then
    await sleep(50);

    const userAfterLogin = (await userModel.findOne())!;
    const lastActivityDateAfterLogin = userAfterLogin.lastActivityDate;

    expect(lastActivityDateAfterLogin).not.toEqual(lastActivityDateBeforeLogin);
  });
});
