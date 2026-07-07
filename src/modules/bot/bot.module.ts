import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [UsersModule, MessagesModule, LogsModule],
  providers: [BotService],
  exports: [BotService]
})
export class BotModule {}
