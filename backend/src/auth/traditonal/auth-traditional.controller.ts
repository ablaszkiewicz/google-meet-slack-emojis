import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthTraditionalService } from './auth-traditional.service';
import { RegisterTraditionalRequest } from './dto/register-traditional.dto';
import { TokenResponse } from './dto/token.dto';
import { LoginTraditionalRequest } from './dto/login-traditional.dto';
import { Public } from '../core/decorators/is-public';

@Public()
@Controller('auth/traditional')
export class AuthTraditionalController {
  constructor(private readonly service: AuthTraditionalService) {}

  @Post('register')
  public async register(
    @Body() payload: RegisterTraditionalRequest,
  ): Promise<TokenResponse> {
    return this.service.register(payload);
  }

  @Post('login')
  public async login(
    @Body() payload: LoginTraditionalRequest,
  ): Promise<TokenResponse> {
    return this.service.login(payload);
  }
}
