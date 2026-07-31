import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedMessage, SavedMessageSchema } from './schemas/saved-message.schema';
import { SavedMessagesService } from './saved-messages.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedMessage.name, schema: SavedMessageSchema },
    ]),
  ],
  providers: [SavedMessagesService],
  exports: [SavedMessagesService],
})
export class SavedMessagesModule {}
