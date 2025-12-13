import { AuthMethod } from '../../core/enum/auth-method.enum';

export class CreateUserDto {
  email: string;
  passwordHash?: string;
  authMethod: AuthMethod;
}
