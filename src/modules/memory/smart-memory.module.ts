import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactProfile, ContactProfileSchema } from './schemas/contact-profile.schema';
import { KnowledgeFact, KnowledgeFactSchema } from './schemas/knowledge-fact.schema';
import { TimelineEvent, TimelineEventSchema } from './schemas/timeline-event.schema';
import { InterestScore, InterestScoreSchema } from './schemas/interest-score.schema';
import { RuleEngineService } from './services/rule-engine.service';
import { AIExtractorService } from './services/ai-extractor.service';
import { SmartMemoryService } from './smart-memory.service';
import { MemoryController } from './memory.controller';
import { UsersModule } from '../users/users.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactProfile.name, schema: ContactProfileSchema },
      { name: KnowledgeFact.name, schema: KnowledgeFactSchema },
      { name: TimelineEvent.name, schema: TimelineEventSchema },
      { name: InterestScore.name, schema: InterestScoreSchema },
    ]),
    UsersModule,
  ],
  controllers: [MemoryController],
  providers: [RuleEngineService, AIExtractorService, SmartMemoryService],
  exports: [SmartMemoryService],
})
export class SmartMemoryModule {}
