import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { MessagesModule } from '../messages/messages.module';
import { LogsModule } from '../logs/logs.module';
import { SavedMessagesModule } from '../saved/saved-messages.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [
    MessagesModule,
    LogsModule,
    SavedMessagesModule,
    RemindersModule,
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
