import { Module, forwardRef } from '@nestjs/common';
import { BotService } from './bot.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [forwardRef(() => UsersModule), MessagesModule, LogsModule],
  providers: [BotService],
  exports: [BotService]
})
export class BotModule {}
