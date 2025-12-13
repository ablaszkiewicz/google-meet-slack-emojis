export class UpsertUserDto {
  slackUserId: string;
  slackTeamId: string;
  slackBotToken: string;
  email: string;
  slackTeamName?: string;
  name?: string;
  avatar?: string;
}
