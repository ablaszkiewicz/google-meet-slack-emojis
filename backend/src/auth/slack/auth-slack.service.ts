import { BadRequestException, Injectable } from "@nestjs/common";
import { UserWriteService } from "../../user/write/user-write.service";
import { CustomJwtService } from "../custom-jwt/custom-jwt.service";
import {
  ExchangeSlackCodeRequest,
  ExchangeSlackCodeResponse,
} from "./dto/exchange-code.dto";

type SlackOAuthResponse = {
  ok: boolean;
  access_token?: string;
  authed_user?: {
    id: string;
    access_token: string;
  };
  team?: {
    id: string;
    name: string;
  };
  error?: string;
};

type SlackIdentityResponse = {
  ok: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    image_72?: string;
    image_192?: string;
    image_512?: string;
  };
  team?: {
    id: string;
    name: string;
  };
  error?: string;
};

@Injectable()
export class AuthSlackService {
  constructor(
    private readonly userWriteService: UserWriteService,
    private readonly jwtService: CustomJwtService
  ) {}

  public async exchangeCode(
    dto: ExchangeSlackCodeRequest
  ): Promise<ExchangeSlackCodeResponse> {
    const slackClientId = process.env.SLACK_CLIENT_ID;
    const slackClientSecret = process.env.SLACK_CLIENT_SECRET;

    if (!slackClientId || !slackClientSecret) {
      throw new Error("Missing SLACK_CLIENT_ID or SLACK_CLIENT_SECRET");
    }

    const token = await this.exchangeForTokens({
      code: dto.code,
      redirectUri: dto.redirectUri,
      clientId: slackClientId,
      clientSecret: slackClientSecret,
    });

    const botToken = token.access_token;
    const userAccessToken = token.authed_user?.access_token;
    const slackUserId = token.authed_user?.id;
    const slackTeamId = token.team?.id;
    const slackTeamName = token.team?.name;

    if (!botToken || !userAccessToken || !slackUserId || !slackTeamId) {
      throw new BadRequestException("Slack token exchange failed");
    }

    const identity = await this.fetchIdentity(userAccessToken);

    const name = identity.user?.name;
    const slackUserEmail = identity.user?.email;
    const avatar =
      identity.user?.image_192 ??
      identity.user?.image_72 ??
      identity.user?.image_512;

    if (!slackUserEmail) {
      throw new BadRequestException("Slack identity did not include email");
    }

    const user = await this.userWriteService.upsertUser({
      slackUserId,
      slackTeamId,
      slackBotToken: botToken,
      slackTeamName,
      name,
      avatar,
      email: slackUserEmail,
    });

    const jwt = await this.jwtService.sign({
      id: user.id,
      email: slackUserEmail,
    });

    return { token: jwt };
  }

  private async exchangeForTokens(input: {
    code: string;
    redirectUri: string;
    clientId: string;
    clientSecret: string;
  }): Promise<SlackOAuthResponse> {
    const params = new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: input.code,
      redirect_uri: input.redirectUri,
    });

    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = (await response.json()) as SlackOAuthResponse;

    if (!data.ok) {
      throw new BadRequestException(
        data.error ?? "Slack token exchange failed"
      );
    }

    return data;
  }

  private async fetchIdentity(
    userAccessToken: string
  ): Promise<SlackIdentityResponse> {
    const response = await fetch("https://slack.com/api/users.identity", {
      method: "GET",
      headers: { Authorization: `Bearer ${userAccessToken}` },
    });

    const data = (await response.json()) as SlackIdentityResponse;

    if (!data.ok) {
      throw new BadRequestException(
        data.error ?? "Slack identity fetch failed"
      );
    }

    return data;
  }
}
