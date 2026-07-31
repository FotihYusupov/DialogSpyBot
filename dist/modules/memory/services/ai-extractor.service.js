"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AIExtractorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIExtractorService = void 0;
const common_1 = require("@nestjs/common");
let AIExtractorService = AIExtractorService_1 = class AIExtractorService {
    constructor() {
        this.logger = new common_1.Logger(AIExtractorService_1.name);
    }
    async extractSemanticFacts(text) {
        if (!text || text.trim().length < 4) {
            return [];
        }
        const facts = [];
        const lowerText = text.toLowerCase();
        const occupationRegexes = [
            /(?:i am|i'm|working as|works as|job is|role is|position is)\s+(?:a|an)?\s*([a-zA-Z0-9\s-]{3,30})(?=\.|,|$|and|at|in)/i,
            /(?:kasbim|soham|mutaxassisligim|ishlayman|men)\s+([a-zA-ZÀ-ÿ0-9\s-]{3,30})(?=\.|,|$|bilan|da|man)/i,
            /(?:dasturchi|muhandis|dizayner|o'qituvchi|shifokor|iqtisodchi|arxitektor|direktor|menejer|buxgalter)\b/i,
            /(backend|frontend|fullstack|devops|designer|manager|developer|engineer|doctor|teacher|lawyer|accountant|programmer|analyst)/i,
        ];
        for (const reg of occupationRegexes) {
            const match = text.match(reg);
            if (match) {
                const value = this.cleanValue(match[1] || match[0]);
                if (value && value.length >= 3) {
                    facts.push({ type: 'occupation', value, confidence: 0.85 });
                    break;
                }
            }
        }
        const companyRegexes = [
            /(?:work at|works at|working at|started at|joined|hired by|employed at)\s+([A-Z][a-zA-Z0-9\s&]{2,30})/i,
            /(?:kompaniyasida|kompaniyasiga|firmada|ishlayman)\s+([A-Z][a-zA-Z0-9\s&]{2,30})/i,
            /([A-Z][a-zA-Z0-9]{2,20})\s+(?:kompaniyasida|firmada|da ishlayapman|ga ishga kirdim)/i,
            /at\s+([A-Z][a-zA-Z0-9]{2,20})\s+as/i,
        ];
        for (const reg of companyRegexes) {
            const match = text.match(reg);
            if (match && match[1]) {
                const value = this.cleanValue(match[1]);
                if (value && value.length >= 2) {
                    facts.push({ type: 'company', value, confidence: 0.85 });
                    facts.push({ type: 'milestone', value: `${value} kompaniyasida ishlaydi`, category: 'career', confidence: 0.80 });
                    break;
                }
            }
        }
        const eduRegexes = [
            /(?:study at|studying at|student at|graduated from|degree from|attending)\s+([A-Z][a-zA-Z0-9\s&]{2,40})/i,
            /(?:universitetida|institutida|o'qiyman|talabaman|bitirganman)\s+([A-Z][a-zA-Z0-9\s&]{2,40})/i,
            /([A-Z][a-zA-Z0-9\s&]{2,30})\s+(?:universitetida|institutida|kollejida)\s+(?:o'qiyman|talabaman)/i,
            /\b([A-Z]{2,6})\s+da\s+(?:o'qiyman|talabaman|o'qiyapman)/i,
        ];
        for (const reg of eduRegexes) {
            const match = text.match(reg);
            if (match && match[1]) {
                const value = this.cleanValue(match[1]);
                if (value && value.length >= 2) {
                    facts.push({ type: 'education', value, confidence: 0.85 });
                    break;
                }
            }
        }
        const locRegexes = [
            /(?:moved to|relocated to|living in|live in|based in|from)\s+([A-Z][a-zA-Z\s]{2,25})/i,
            /(?:ko'chdim|ko'chib o'tdim|yashayman|yashayapman|turaman)\s+([A-Z][a-zA-ZÀ-ÿ\s]{2,25})/i,
            /([A-Z][a-zA-ZÀ-ÿ\s]{2,20})\s+(?:shahriga ko'chdim|shahrida yashayman|da turaman)/i,
            /\b(Toshkent|Samarqand|Buxoro|Namangan|Andijon|Farg'ona|Qo'qon|Nukus|Urganch|Termiz|Qarshi|Jizzax|Guliston|Navoiy)\b/i,
        ];
        for (const reg of locRegexes) {
            const match = text.match(reg);
            if (match && match[1]) {
                const value = this.cleanValue(match[1]);
                if (value && value.length >= 3) {
                    facts.push({ type: 'location', value, confidence: 0.85 });
                    const moveWords = ['move', "ko'ch", 'relocated', 'ko\'chib'];
                    if (moveWords.some(w => lowerText.includes(w))) {
                        facts.push({ type: 'milestone', value: `${value} ga ko'chdi`, category: 'relocation', confidence: 0.85 });
                    }
                    break;
                }
            }
        }
        const interestKeywords = [
            'formula 1', 'football', 'soccer', 'crypto', 'bitcoin', 'ai', 'artificial intelligence',
            'machine learning', 'travel', 'finance', 'fitness', 'photography', 'movies', 'anime',
            'gaming', 'design', 'music', 'chess', 'reading', 'startup',
            'futbol', 'shaxmat', 'musiqa', 'sayohat', 'kitob', 'kino', 'o\'yinlar', 'sport',
            'rasm chizish', 'raqs', 'milliy kurash', 'boks', 'tennis', 'suzish',
        ];
        for (const topic of interestKeywords) {
            if (lowerText.includes(topic)) {
                facts.push({
                    type: 'interest',
                    value: topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    confidence: 0.80,
                });
            }
        }
        const skillKeywords = [
            'nestjs', 'nodejs', 'express', 'react', 'vue', 'angular', 'nextjs', 'typescript',
            'javascript', 'python', 'django', 'fastapi', 'java', 'spring', 'go', 'golang',
            'c++', 'c#', 'rust', 'mongodb', 'postgresql', 'mysql', 'docker', 'kubernetes',
            'aws', 'gcp', 'git', 'redis', 'graphql', 'flutter', 'swift', 'kotlin',
            '1c', 'bitrix', 'wordpress', 'php', 'laravel',
        ];
        const skillDisplayNames = {
            nestjs: 'NestJS', nextjs: 'Next.js', nodejs: 'Node.js',
            'c++': 'C++', 'c#': 'C#', golang: 'Go',
            '1c': '1C', bitrix: 'Bitrix',
        };
        for (const skill of skillKeywords) {
            try {
                const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = /\w$/.test(skill)
                    ? `\\b${escaped}\\b`
                    : `(?:^|\\s|\\b)${escaped}(?:$|\\s|\\b|[.,!?])`;
                const reg = new RegExp(pattern, 'i');
                if (reg.test(text)) {
                    const displayName = skillDisplayNames[skill] || skill.charAt(0).toUpperCase() + skill.slice(1);
                    facts.push({ type: 'skill', value: displayName, confidence: 0.85 });
                }
            }
            catch (e) {
                if (lowerText.includes(skill)) {
                    facts.push({ type: 'skill', value: skill, confidence: 0.80 });
                }
            }
        }
        const projectRegexes = [
            /(?:building|developing|creating|working on|project:?)\s+([a-zA-Z0-9\s-]{3,35})(?=\.|,|$|and|with)/i,
            /(?:loyiha|ustida ishlayapman|qurmoqdaman|yaratmoqdaman)\s+([a-zA-Z0-9\s-]{3,35})/i,
            /([a-zA-Z0-9\s-]{3,35})\s+(?:loyihasida ishlayapman|loyihasini qurmoqdaman)/i,
        ];
        for (const reg of projectRegexes) {
            const match = text.match(reg);
            if (match && match[1]) {
                const value = this.cleanValue(match[1]);
                if (value && value.length >= 3 && !skillKeywords.includes(value.toLowerCase())) {
                    facts.push({ type: 'project', value, confidence: 0.80 });
                    break;
                }
            }
        }
        const goalRegexes = [
            /(?:preparing for|aiming for|target is|goal is|planning to)\s+([a-zA-Z0-9\s-]{3,35})(?=\.|,|$)/i,
            /(?:tayyorlanayapman|maqsadim|rejam bor|xohlayapman)\s+([a-zA-Z0-9\s-]{3,35})/i,
            /(?:IELTS|TOEFL|CEFR|SAT|GRE|IT Park|Texnopark)\s*(?:ga|uchun)?\s*(?:tayyorlanayapman|o'qiyapman)/i,
        ];
        for (const reg of goalRegexes) {
            const match = text.match(reg);
            if (match) {
                const value = this.cleanValue(match[1] || match[0]);
                if (value && value.length >= 3) {
                    facts.push({ type: 'goal', value, confidence: 0.80 });
                    break;
                }
            }
        }
        return facts;
    }
    cleanValue(str) {
        return str
            .trim()
            .replace(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, '')
            .replace(/^[\s,.-]+|[\s,.-]+$/g, '');
    }
};
exports.AIExtractorService = AIExtractorService;
exports.AIExtractorService = AIExtractorService = AIExtractorService_1 = __decorate([
    (0, common_1.Injectable)()
], AIExtractorService);
//# sourceMappingURL=ai-extractor.service.js.map