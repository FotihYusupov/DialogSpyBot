"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartMemoryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const contact_profile_schema_1 = require("./schemas/contact-profile.schema");
const knowledge_fact_schema_1 = require("./schemas/knowledge-fact.schema");
const timeline_event_schema_1 = require("./schemas/timeline-event.schema");
const interest_score_schema_1 = require("./schemas/interest-score.schema");
const rule_engine_service_1 = require("./services/rule-engine.service");
const ai_extractor_service_1 = require("./services/ai-extractor.service");
const smart_memory_service_1 = require("./smart-memory.service");
const memory_controller_1 = require("./memory.controller");
let SmartMemoryModule = class SmartMemoryModule {
};
exports.SmartMemoryModule = SmartMemoryModule;
exports.SmartMemoryModule = SmartMemoryModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: contact_profile_schema_1.ContactProfile.name, schema: contact_profile_schema_1.ContactProfileSchema },
                { name: knowledge_fact_schema_1.KnowledgeFact.name, schema: knowledge_fact_schema_1.KnowledgeFactSchema },
                { name: timeline_event_schema_1.TimelineEvent.name, schema: timeline_event_schema_1.TimelineEventSchema },
                { name: interest_score_schema_1.InterestScore.name, schema: interest_score_schema_1.InterestScoreSchema },
            ]),
        ],
        controllers: [memory_controller_1.MemoryController],
        providers: [rule_engine_service_1.RuleEngineService, ai_extractor_service_1.AIExtractorService, smart_memory_service_1.SmartMemoryService],
        exports: [smart_memory_service_1.SmartMemoryService],
    })
], SmartMemoryModule);
//# sourceMappingURL=smart-memory.module.js.map