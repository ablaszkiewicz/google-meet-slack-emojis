import { INestApplication } from '@nestjs/common';

import * as request from 'supertest';
import { RegisterTraditionalRequest } from '../../src/auth/traditonal/dto/register-traditional.dto';
import { TokenResponse } from '../../src/auth/traditonal/dto/token.dto';
import { LoginTraditionalRequest } from '../../src/auth/traditonal/dto/login-traditional.dto';

export class AuthTraditionalUtils {
  constructor(private readonly app: INestApplication<any>) {}

  public async registerUser(
    dto: RegisterTraditionalRequest,
  ): Promise<TokenResponse> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/traditional/register')
      .send({
        email: dto.email,
        password: dto.password,
      });

    return response.body;
  }

  public async loginUser(dto: LoginTraditionalRequest): Promise<TokenResponse> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/traditional/login')
      .send({
        email: dto.email,
        password: dto.password,
      });

    return response.body;
  }

  public async registerAndLoginUser(
    dto: RegisterTraditionalRequest,
  ): Promise<TokenResponse> {
    await this.registerUser(dto);

    const response = await request(this.app.getHttpServer())
      .post('/auth/traditional/login')
      .send({
        email: dto.email,
        password: dto.password,
      });

    return response.body;
  }
}
