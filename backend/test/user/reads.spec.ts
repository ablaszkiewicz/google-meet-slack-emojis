import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { UserEntity } from '../../src/user/core/entities/user.entity';
import { Model } from 'mongoose';
import { AuthTraditionalUtils } from '../utils/auth-traditional-utils';
import { createTestApp } from '../utils/bootstrap';
import { closeInMemoryMongoServer } from '../utils/mongo-in-memory-server';

describe('UserCoreController', () => {
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

  it('returns current user if logged in', async () => {
    // given
    const { token } = await authUtils.registerAndLoginUser({
      email: 'test@test.com',
      password: 'password',
    });

    // when
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('authorization', `Bearer ${token}`);

    // then
    expect(response.body.email).toEqual('test@test.com');
  });

  it('returns exception if not logged in', async () => {
    // given
    const token = 'asdf';

    // when
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('authorization', `Bearer ${token}`);

    // then
    expect(response.status).toEqual(403);
  });
});
