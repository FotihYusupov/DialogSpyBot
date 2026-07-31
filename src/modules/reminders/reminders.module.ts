import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reminder, ReminderSchema } from './schemas/reminder.schema';
import { RemindersService } from './reminders.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reminder.name, schema: ReminderSchema },
    ]),
  ],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
