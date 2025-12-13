export class UpsertSlackUserDto {
  slackUserId: string;
  slackTeamId: string;
  slackBotToken: string;
  email?: string;
  slackTeamName?: string;
  slackUserName?: string;
  slackUserAvatar?: string;
}
