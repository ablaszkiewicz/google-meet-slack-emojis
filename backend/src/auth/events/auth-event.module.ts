import { Global, Module } from '@nestjs/common';
import { AuthEventEmitter } from './auth-event.emitter';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [AuthEventEmitter],
  exports: [AuthEventEmitter],
})
export class AuthEventModule {}
