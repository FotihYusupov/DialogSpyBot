import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemLog, SystemLogSchema } from './schemas/log.schema';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SystemLog.name, schema: SystemLogSchema }])
  ],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService]
})
export class LogsModule {}
