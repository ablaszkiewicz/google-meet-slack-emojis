import { AuthMethod } from '../enum/auth-method.enum';

export interface IUser {
  id: string;
  email?: string;
  passwordHash?: string;
  authMethod: AuthMethod;
}
