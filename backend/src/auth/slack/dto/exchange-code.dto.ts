import { IUser } from '../../../user/core/entities/user.interface';

export class ExchangeSlackCodeRequest {
  code: string;
  redirectUri: string;
}

export class ExchangeSlackCodeResponse {
  token: string;
  user: IUser;
}

