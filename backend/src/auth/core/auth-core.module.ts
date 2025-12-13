import { Module } from '@nestjs/common';
import { AuthTraditionalModule } from '../traditonal/auth-traditional.module';
import { AuthGuard } from './guards/auth.guard';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthEventModule } from '../events/auth-event.module';

@Module({
  imports: [AuthTraditionalModule, CustomJwtModule, AuthEventModule],
  providers: [AuthGuard, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthCoreModule {}
