import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterTraditionalRequest } from './dto/register-traditional.dto';
import { UserWriteService } from '../../user/write/user-write.service';
import { LoginTraditionalRequest } from './dto/login-traditional.dto';
import { UserReadService } from '../../user/read/user-read.service';
import { AuthMethod } from '../../user/core/enum/auth-method.enum';
import { TokenResponse } from './dto/token.dto';
import { CustomJwtService } from '../custom-jwt/custom-jwt.service';
import * as bcrypt from 'bcrypt';
import { AuthEventEmitter } from '../events/auth-event.emitter';

@Injectable()
export class AuthTraditionalService {
  constructor(
    private readonly userWriteService: UserWriteService,
    private readonly userReadService: UserReadService,
    private readonly jwtService: CustomJwtService,
    private readonly emitter: AuthEventEmitter,
  ) {}

  public async register(
    dto: RegisterTraditionalRequest,
  ): Promise<TokenResponse> {
    const passwordHash = await this.createPasswordHash(dto.password);
    const user = await this.userWriteService.createUser({
      email: dto.email,
      passwordHash,
      authMethod: AuthMethod.Traditional,
    });

    const token = await this.jwtService.sign({ id: user.id });

    await this.emitter.emitUserRegisteredEvent({
      userId: user.id,
      authMethod: AuthMethod.Traditional,
    });

    return {
      token,
    };
  }

  public async login(dto: LoginTraditionalRequest): Promise<TokenResponse> {
    const user = await this.userReadService.readByEmail(dto.email);

    if (user.authMethod !== AuthMethod.Traditional) {
      throw new UnauthorizedException(
        'User is not registered with traditional auth method',
      );
    }

    if (!user.passwordHash) {
      throw new Error('User does not have password set');
    }

    const passwordMatches = await this.passwordMatchesHash(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const token = await this.jwtService.sign({ id: user.id });

    await this.emitter.emitUserLoggedInEvent({ userId: user.id });

    return { token };
  }

  private async passwordMatchesHash(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  private async createPasswordHash(password: string): Promise<string> {
    const saltRounds = 10;

    return bcrypt.hash(password, saltRounds);
  }
}
