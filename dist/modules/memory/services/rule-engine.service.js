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
        this.EMAIL_REGEX = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
        this.URL_REGEX = /https?:\/\/[^\s<>"']+/gi;
        this.GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/gi;
        this.GITLAB_REGEX = /(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([a-zA-Z0-9_-]+)/gi;
        this.LINKEDIN_PROFILE_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/gi;
        this.INSTAGRAM_REGEX = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/gi;
        this.TWITTER_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/gi;
        this.MAPS_REGEX = /(?:https?:\/\/)?(?:maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)\/[^\s]+/gi;
        this.TG_LINK_OR_HANDLE = /(?:https?:\/\/)?(?:t\.me\/|telegram\.me\/)([a-zA-Z0-9_]{5,32})|(?<=^|\s)@([a-zA-Z0-9_]{5,32})\b/gi;
        this.FLIGHT_REGEX = /\b(HY|AF|BA|LH|TK|EK|QR|SU|S7|U6|UZ|AK|AA|UA|DL|WS|AC|FR|VY|W6|RYR|EZY)\d{1,4}\b/g;
        this.TRACKING_REGEX = /\b(1Z[0-9A-Z]{16}|[0-9]{12,22})\b/g;
        this.CARD_REGEX = /\b(?:8600|9860|4\d{3}|5[1-5]\d{2})[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;
        this.INVOICE_REGEX = /\b(?:INV|INVOICE|SCH|BILL)[-:\s]?#?\d{3,10}\b/gi;
        this.DATE_REGEX = /\b(?:\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})\b/g;
        this.TIME_REGEX = /\b(?:[01]?\d|2[0-3]):[0-5]\d(?:\s?[AP]M)?\b/gi;
        this.IG_CONTENT_KEYWORDS = new Set([
            'p', 'reel', 'reels', 'stories', 'explore', 'direct', 'accounts', 'tv', 'share', 'about', 'legal'
        ]);
        this.TWITTER_NON_PROFILES = new Set([
            'status', 'i', 'hashtag', 'search', 'intent', 'share', 'home', 'explore', 'notifications'
        ]);
        this.GITHUB_NON_PROFILES = new Set([
            'pull', 'issues', 'commit', 'blob', 'tree', 'releases', 'topics', 'explore', 'pricing', 'features'
        ]);
        this.TG_NON_USER_HANDLES = new Set([
            'c', 'joinchat', 'addstickers', 'addtheme', 'share', 'login', 'setlanguage', 'invoice', 'proxy', 'trackmychatbot', 'dialogspybot'
        ]);
        this.UZ_PREFIXES = new Set(['90', '91', '93', '94', '95', '97', '98', '99', '33', '88', '77', '20', '50', '71']);
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
        const extractedUrls = [];
        let match;
        const urlRegex = new RegExp(this.URL_REGEX);
        while ((match = urlRegex.exec(text)) !== null) {
            extractedUrls.push(match[0]);
        }
        for (const url of extractedUrls) {
            const igMatch = /instagram\.com\/([a-zA-Z0-9_.]+)/i.exec(url);
            if (igMatch && igMatch[1]) {
                const username = igMatch[1].toLowerCase().replace(/\/$/, '');
                if (!this.IG_CONTENT_KEYWORDS.has(username) && !username.includes('/')) {
                    pushFact('instagram', `@${username}`, 0.98);
                }
            }
        }
        for (const url of extractedUrls) {
            const twMatch = /(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i.exec(url);
            if (twMatch && twMatch[1]) {
                const username = twMatch[1].toLowerCase().replace(/\/$/, '');
                if (!this.TWITTER_NON_PROFILES.has(username)) {
                    pushFact('twitter', `@${username}`, 0.98);
                }
            }
        }
        for (const url of extractedUrls) {
            const ghMatch = /github\.com\/([a-zA-Z0-9_-]+)/i.exec(url);
            if (ghMatch && ghMatch[1]) {
                const username = ghMatch[1].toLowerCase().replace(/\/$/, '');
                if (!this.GITHUB_NON_PROFILES.has(username)) {
                    pushFact('github', `https://github.com/${username}`, 0.98);
                }
            }
        }
        for (const url of extractedUrls) {
            const glMatch = /gitlab\.com\/([a-zA-Z0-9_-]+)/i.exec(url);
            if (glMatch && glMatch[1]) {
                const username = glMatch[1].toLowerCase().replace(/\/$/, '');
                if (!this.GITHUB_NON_PROFILES.has(username)) {
                    pushFact('gitlab', `https://gitlab.com/${username}`, 0.98);
                }
            }
        }
        for (const url of extractedUrls) {
            const liMatch = /linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i.exec(url);
            if (liMatch && liMatch[1]) {
                pushFact('linkedin', `https://linkedin.com/in/${liMatch[1]}`, 0.98);
            }
        }
        for (const url of extractedUrls) {
            if (/(?:maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)/i.test(url)) {
                pushFact('maps', url, 0.95);
            }
        }
        const tgRegex = new RegExp(this.TG_LINK_OR_HANDLE);
        while ((match = tgRegex.exec(text)) !== null) {
            const handle = (match[1] || match[2] || '').toLowerCase().replace(/[\/\.]/g, '');
            if (handle && handle.length >= 5 && !this.TG_NON_USER_HANDLES.has(handle)) {
                pushFact('telegram', `@${handle}`, 0.95);
            }
        }
        for (const url of extractedUrls) {
            const isSocialOrMap = /(?:instagram\.com|twitter\.com|x\.com|github\.com|gitlab\.com|linkedin\.com|t\.me|maps\.google|goo\.gl)/i.test(url);
            const isMediaFile = /\.(?:png|jpg|jpeg|gif|webp|mp4|webm|mp3|pdf)$/i.test(url.split('?')[0]);
            if (!isSocialOrMap && !isMediaFile) {
                const cleanUrl = url.replace(/[.,;!?)]+$/, '');
                pushFact('website', cleanUrl, 0.90);
            }
        }
        const emailMatches = text.match(this.EMAIL_REGEX);
        if (emailMatches) {
            emailMatches.forEach(email => pushFact('email', email, 0.98));
        }
        let textWithoutUrls = text;
        for (const url of extractedUrls) {
            textWithoutUrls = textWithoutUrls.replace(url, ' [LINK] ');
        }
        const cardMatches = textWithoutUrls.match(this.CARD_REGEX);
        if (cardMatches) {
            cardMatches.forEach(card => {
                const digits = card.replace(/\D/g, '');
                if (digits.length === 16) {
                    const masked = `${digits.substring(0, 4)} **** **** ${digits.substring(12)}`;
                    pushFact('card_number', masked, 0.98);
                }
                textWithoutUrls = textWithoutUrls.replace(card, ' [CARD] ');
            });
        }
        const phoneCandidatesRegex = /(?:\+?998[-.\s]?\(?\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2})|(?:\+?[1-9]\d{0,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4})|(?:\b\(?\d{2}\)?[-.\s]\d{3}[-.\s]\d{2}[-.\s]\d{2}\b)/g;
        const rawPhones = textWithoutUrls.match(phoneCandidatesRegex);
        if (rawPhones) {
            for (const raw of rawPhones) {
                const digits = raw.replace(/\D/g, '');
                if (digits.length < 9 || digits.length > 15)
                    continue;
                if (/^(\d)\1+$/.test(digits))
                    continue;
                if (digits.startsWith('998') && digits.length === 12) {
                    const prefix = digits.substring(3, 5);
                    if (this.UZ_PREFIXES.has(prefix)) {
                        const formatted = `+998 (${prefix}) ${digits.substring(5, 8)}-${digits.substring(8, 10)}-${digits.substring(10, 12)}`;
                        pushFact('phone', formatted, 0.98);
                        continue;
                    }
                }
                else if (digits.length === 9) {
                    const prefix = digits.substring(0, 2);
                    if (this.UZ_PREFIXES.has(prefix)) {
                        const formatted = `+998 (${prefix}) ${digits.substring(2, 5)}-${digits.substring(5, 7)}-${digits.substring(7, 9)}`;
                        pushFact('phone', formatted, 0.95);
                        continue;
                    }
                }
                else if (raw.trim().startsWith('+') && digits.length >= 10 && digits.length <= 15) {
                    pushFact('phone', `+${digits}`, 0.95);
                }
            }
        }
        const flightMatches = textWithoutUrls.match(this.FLIGHT_REGEX);
        if (flightMatches) {
            flightMatches.forEach(flight => pushFact('flight_number', flight, 0.85));
        }
        const trackMatches = textWithoutUrls.match(this.TRACKING_REGEX);
        if (trackMatches) {
            trackMatches.forEach(track => {
                const digits = track.replace(/\D/g, '');
                if (!facts.some(f => f.value.replace(/\D/g, '') === digits)) {
                    pushFact('tracking_number', track, 0.85);
                }
            });
        }
        const invMatches = textWithoutUrls.match(this.INVOICE_REGEX);
        if (invMatches) {
            invMatches.forEach(inv => pushFact('invoice_number', inv, 0.85));
        }
        const dateMatches = textWithoutUrls.match(this.DATE_REGEX);
        if (dateMatches) {
            dateMatches.forEach(dt => pushFact('date', dt, 0.85));
        }
        const timeMatches = textWithoutUrls.match(this.TIME_REGEX);
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