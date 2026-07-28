"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RuleEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEngineService = void 0;
const common_1 = require("@nestjs/common");
let RuleEngineService = RuleEngineService_1 = class RuleEngineService {
    constructor() {
        this.logger = new common_1.Logger(RuleEngineService_1.name);
        this.PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/g;
        this.EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        this.URL_REGEX = /https?:\/\/[^\s<>"']+/gi;
        this.TG_HANDLE_REGEX = /(?:@|t\.me\/)([a-zA-Z0-9_]{5,32})/gi;
        this.GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/gi;
        this.GITLAB_REGEX = /(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([a-zA-Z0-9_-]+)/gi;
        this.LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/gi;
        this.INSTAGRAM_REGEX = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/gi;
        this.TWITTER_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/gi;
        this.MAPS_REGEX = /(?:https?:\/\/)?(?:maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)\/[^\s]+/gi;
        this.FLIGHT_REGEX = /\b([A-Z]{2}\d{3,4})\b/g;
        this.TRACKING_REGEX = /\b(1Z[0-9A-Z]{16}|[0-9]{12,22})\b/g;
        this.CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
        this.INVOICE_REGEX = /\b(?:INV|INVOICE|SCH|BILL)[-:\s]?#?\d{3,10}\b/gi;
        this.DATE_REGEX = /\b(?:\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})\b/g;
        this.TIME_REGEX = /\b(?:[01]?\d|2[0-3]):[0-5]\d(?:\s?[AP]M)?\b/gi;
    }
    extractRuleFacts(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return [];
        }
        const facts = [];
        const pushFact = (type, value, confidence = 0.95) => {
            const cleanValue = value.trim();
            if (cleanValue && !facts.some(f => f.type === type && f.value.toLowerCase() === cleanValue.toLowerCase())) {
                facts.push({ type, value: cleanValue, confidence });
            }
        };
        const emailMatches = text.match(this.EMAIL_REGEX);
        if (emailMatches) {
            emailMatches.forEach(email => pushFact('email', email, 0.98));
        }
        const phoneMatches = text.match(this.PHONE_REGEX);
        if (phoneMatches) {
            phoneMatches.forEach(phone => {
                const digitsOnly = phone.replace(/\D/g, '');
                if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
                    pushFact('phone', phone, 0.95);
                }
            });
        }
        let match;
        const githubRegex = new RegExp(this.GITHUB_REGEX);
        while ((match = githubRegex.exec(text)) !== null) {
            pushFact('github', match[0], 0.98);
        }
        const gitlabRegex = new RegExp(this.GITLAB_REGEX);
        while ((match = gitlabRegex.exec(text)) !== null) {
            pushFact('gitlab', match[0], 0.98);
        }
        const linkedinRegex = new RegExp(this.LINKEDIN_REGEX);
        while ((match = linkedinRegex.exec(text)) !== null) {
            pushFact('linkedin', match[0], 0.98);
        }
        const instaRegex = new RegExp(this.INSTAGRAM_REGEX);
        while ((match = instaRegex.exec(text)) !== null) {
            pushFact('instagram', match[0], 0.95);
        }
        const twitterRegex = new RegExp(this.TWITTER_REGEX);
        while ((match = twitterRegex.exec(text)) !== null) {
            pushFact('twitter', match[0], 0.95);
        }
        const mapsRegex = new RegExp(this.MAPS_REGEX);
        while ((match = mapsRegex.exec(text)) !== null) {
            pushFact('maps', match[0], 0.95);
        }
        const tgRegex = new RegExp(this.TG_HANDLE_REGEX);
        while ((match = tgRegex.exec(text)) !== null) {
            pushFact('telegram', `@${match[1]}`, 0.95);
        }
        const urlMatches = text.match(this.URL_REGEX);
        if (urlMatches) {
            urlMatches.forEach(url => {
                if (!facts.some(f => url.toLowerCase().includes(f.value.toLowerCase()))) {
                    pushFact('website', url, 0.90);
                }
            });
        }
        const flightMatches = text.match(this.FLIGHT_REGEX);
        if (flightMatches) {
            flightMatches.forEach(flight => pushFact('flight_number', flight, 0.85));
        }
        const trackMatches = text.match(this.TRACKING_REGEX);
        if (trackMatches) {
            trackMatches.forEach(track => pushFact('tracking_number', track, 0.85));
        }
        const invMatches = text.match(this.INVOICE_REGEX);
        if (invMatches) {
            invMatches.forEach(inv => pushFact('invoice_number', inv, 0.85));
        }
        const dateMatches = text.match(this.DATE_REGEX);
        if (dateMatches) {
            dateMatches.forEach(dt => pushFact('date', dt, 0.85));
        }
        const timeMatches = text.match(this.TIME_REGEX);
        if (timeMatches) {
            timeMatches.forEach(tm => pushFact('time', tm, 0.85));
        }
        return facts;
    }
};
exports.RuleEngineService = RuleEngineService;
exports.RuleEngineService = RuleEngineService = RuleEngineService_1 = __decorate([
    (0, common_1.Injectable)()
], RuleEngineService);
//# sourceMappingURL=rule-engine.service.js.map