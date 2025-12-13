export interface IUser {
  id: string;
  email?: string;
  passwordHash?: string;
  slackUserId?: string;
  slackTeamId?: string;
  slackTeamName?: string;
  name?: string;
  avatar?: string;
}
