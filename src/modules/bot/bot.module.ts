import { Module, forwardRef } from '@nestjs/common';
import { BotService } from './bot.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { LogsModule } from '../logs/logs.module';
import { PremiumModule } from '../premium/premium.module';
import { SavedMessagesModule } from '../saved/saved-messages.module';
import { RemindersModule } from '../reminders/reminders.module';
import { SmartMemoryModule } from '../memory/smart-memory.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MessagesModule,
    LogsModule,
    PremiumModule,
    SmartMemoryModule,
    SavedMessagesModule,
    RemindersModule,
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
