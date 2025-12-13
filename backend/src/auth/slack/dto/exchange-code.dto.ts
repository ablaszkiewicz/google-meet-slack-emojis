export class ExchangeSlackCodeRequest {
  code: string;
  redirectUri: string;
}

export class ExchangeSlackCodeResponse {
  token: string;
}
