import { forwardRef, Global, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { MailService } from './mail.service.js';
import { OutboxService } from './outbox.service.js';

@Global()
@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [MailService, OutboxService],
  exports: [MailService, OutboxService],
})
export class MailModule {}

