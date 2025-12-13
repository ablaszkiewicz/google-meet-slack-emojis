import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../core/decorators/is-public';
import { AuthSlackService } from './auth-slack.service';
import {
  ExchangeSlackCodeRequest,
  ExchangeSlackCodeResponse,
} from './dto/exchange-code.dto';

@Public()
@Controller('auth/slack')
export class AuthSlackController {
  constructor(private readonly service: AuthSlackService) {}

  @Post('exchange-code')
  public async exchangeCode(
    @Body() payload: ExchangeSlackCodeRequest,
  ): Promise<ExchangeSlackCodeResponse> {
    return this.service.exchangeCode(payload);
  }
}


