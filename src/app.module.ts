import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { MessagesModule } from './modules/messages/messages.module';
import { LogsModule } from './modules/logs/logs.module';
import { SettingsModule } from './modules/settings/settings.module';
import { BotModule } from './modules/bot/bot.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BroadcastModule } from './modules/broadcast/broadcast.module';
import { PremiumModule } from './modules/premium/premium.module';
import { SmartMemoryModule } from './modules/memory/smart-memory.module';
import { SavedMessagesModule } from './modules/saved/saved-messages.module';
import { RemindersModule } from './modules/reminders/reminders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    DatabaseModule,
    PremiumModule,
    SmartMemoryModule,
    UsersModule,
    MessagesModule,
    LogsModule,
    SettingsModule,
    BotModule,
    AuthModule,
    AdminModule,
    AnalyticsModule,
    BroadcastModule,
    SavedMessagesModule,
    RemindersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
