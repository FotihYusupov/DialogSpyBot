import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Broadcast, BroadcastSchema } from './schemas/broadcast.schema';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { UsersModule } from '../users/users.module';
import { BotModule } from '../bot/bot.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Broadcast.name, schema: BroadcastSchema }]),
    UsersModule,
    forwardRef(() => BotModule),
    LogsModule
  ],
  controllers: [BroadcastController],
  providers: [BroadcastService],
  exports: [BroadcastService]
})
export class BroadcastModule {}
