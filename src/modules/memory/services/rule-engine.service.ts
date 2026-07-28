import { Injectable, Logger } from '@nestjs/common';

export interface ExtractedRuleFact {
  type: 
    | 'phone'
    | 'email'
    | 'website'
    | 'github'
    | 'gitlab'
    | 'linkedin'
    | 'telegram'
    | 'instagram'
    | 'twitter'
    | 'discord'
    | 'maps'
    | 'address'
    | 'flight_number'
    | 'tracking_number'
    | 'card_number'
    | 'invoice_number'
    | 'date'
    | 'time';
  value: string;
  confidence: number;
}

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  // Regex patterns
  private readonly PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/g;
  private readonly EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  private readonly URL_REGEX = /https?:\/\/[^\s<>"']+/gi;
  private readonly TG_HANDLE_REGEX = /(?:@|t\.me\/)([a-zA-Z0-9_]{5,32})/gi;
  
  // Specific domains regexes
  private readonly GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/gi;
  private readonly GITLAB_REGEX = /(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([a-zA-Z0-9_-]+)/gi;
  private readonly LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/gi;
  private readonly INSTAGRAM_REGEX = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/gi;
  private readonly TWITTER_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/gi;
  private readonly MAPS_REGEX = /(?:https?:\/\/)?(?:maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)\/[^\s]+/gi;
  
  // Custom identifier patterns
  private readonly FLIGHT_REGEX = /\b([A-Z]{2}\d{3,4})\b/g;
  private readonly TRACKING_REGEX = /\b(1Z[0-9A-Z]{16}|[0-9]{12,22})\b/g;
  private readonly CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
  private readonly INVOICE_REGEX = /\b(?:INV|INVOICE|SCH|BILL)[-:\s]?#?\d{3,10}\b/gi;
  private readonly DATE_REGEX = /\b(?:\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})\b/g;
  private readonly TIME_REGEX = /\b(?:[01]?\d|2[0-3]):[0-5]\d(?:\s?[AP]M)?\b/gi;

  extractRuleFacts(text?: string): ExtractedRuleFact[] {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return [];
    }

    const facts: ExtractedRuleFact[] = [];
    const pushFact = (type: ExtractedRuleFact['type'], value: string, confidence = 0.95) => {
      const cleanValue = value.trim();
      if (cleanValue && !facts.some(f => f.type === type && f.value.toLowerCase() === cleanValue.toLowerCase())) {
        facts.push({ type, value: cleanValue, confidence });
      }
    };

    // 1. Emails
    const emailMatches = text.match(this.EMAIL_REGEX);
    if (emailMatches) {
      emailMatches.forEach(email => pushFact('email', email, 0.98));
    }

    // 2. Phones
    const phoneMatches = text.match(this.PHONE_REGEX);
    if (phoneMatches) {
      phoneMatches.forEach(phone => {
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
          pushFact('phone', phone, 0.95);
        }
      });
    }

    // 3. Social Media & Websites
    let match: RegExpExecArray | null;
    
    // GitHub
    const githubRegex = new RegExp(this.GITHUB_REGEX);
    while ((match = githubRegex.exec(text)) !== null) {
      pushFact('github', match[0], 0.98);
    }

    // GitLab
    const gitlabRegex = new RegExp(this.GITLAB_REGEX);
    while ((match = gitlabRegex.exec(text)) !== null) {
      pushFact('gitlab', match[0], 0.98);
    }

    // LinkedIn
    const linkedinRegex = new RegExp(this.LINKEDIN_REGEX);
    while ((match = linkedinRegex.exec(text)) !== null) {
      pushFact('linkedin', match[0], 0.98);
    }

    // Instagram
    const instaRegex = new RegExp(this.INSTAGRAM_REGEX);
    while ((match = instaRegex.exec(text)) !== null) {
      pushFact('instagram', match[0], 0.95);
    }

    // Twitter/X
    const twitterRegex = new RegExp(this.TWITTER_REGEX);
    while ((match = twitterRegex.exec(text)) !== null) {
      pushFact('twitter', match[0], 0.95);
    }

    // Google Maps
    const mapsRegex = new RegExp(this.MAPS_REGEX);
    while ((match = mapsRegex.exec(text)) !== null) {
      pushFact('maps', match[0], 0.95);
    }

    // Telegram Handles
    const tgRegex = new RegExp(this.TG_HANDLE_REGEX);
    while ((match = tgRegex.exec(text)) !== null) {
      pushFact('telegram', `@${match[1]}`, 0.95);
    }

    // General Websites (excluding already extracted social links)
    const urlMatches = text.match(this.URL_REGEX);
    if (urlMatches) {
      urlMatches.forEach(url => {
        if (!facts.some(f => url.toLowerCase().includes(f.value.toLowerCase()))) {
          pushFact('website', url, 0.90);
        }
      });
    }

    // 4. Flight numbers
    const flightMatches = text.match(this.FLIGHT_REGEX);
    if (flightMatches) {
      flightMatches.forEach(flight => pushFact('flight_number', flight, 0.85));
    }

    // 5. Tracking numbers
    const trackMatches = text.match(this.TRACKING_REGEX);
    if (trackMatches) {
      trackMatches.forEach(track => pushFact('tracking_number', track, 0.85));
    }

    // 6. Invoice numbers
    const invMatches = text.match(this.INVOICE_REGEX);
    if (invMatches) {
      invMatches.forEach(inv => pushFact('invoice_number', inv, 0.85));
    }

    // 7. Dates
    const dateMatches = text.match(this.DATE_REGEX);
    if (dateMatches) {
      dateMatches.forEach(dt => pushFact('date', dt, 0.85));
    }

    // 8. Times
    const timeMatches = text.match(this.TIME_REGEX);
    if (timeMatches) {
      timeMatches.forEach(tm => pushFact('time', tm, 0.85));
    }

    return facts;
  }
}
