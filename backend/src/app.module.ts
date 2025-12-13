import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthCoreModule } from './auth/core/auth-core.module';
import { UserCoreModule } from './user/core/user-core.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthEventModule } from './auth/events/auth-event.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://todo-change-this'),
    AuthCoreModule,
    UserCoreModule,
  ],
})
export class AppModule {}
