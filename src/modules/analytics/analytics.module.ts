import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [UsersModule, MessagesModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
