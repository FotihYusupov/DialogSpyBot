import { Injectable, Logger } from '@nestjs/common';

export interface SemanticFactResult {
  type: 
    | 'occupation'
    | 'company'
    | 'education'
    | 'location'
    | 'interest'
    | 'skill'
    | 'project'
    | 'goal'
    | 'language'
    | 'milestone';
  value: string;
  category?: string;
  confidence: number;
}

@Injectable()
export class AIExtractorService {
  private readonly logger = new Logger(AIExtractorService.name);

  async extractSemanticFacts(text?: string): Promise<SemanticFactResult[]> {
    if (!text || text.trim().length < 4) {
      return [];
    }

    const facts: SemanticFactResult[] = [];
    const lowerText = text.toLowerCase();

    // 1. Occupation Patterns
    // "I am a backend developer", "I work as a designer", "Dasturchiman", etc.
    const occupationRegexes = [
      /(?:i am|i'm|working as|works as|job is|role is|position is)\s+(?:a|an)?\s*([a-zA-Z0-9\s-]{3,30})(?=\.|\,|$|and|at|in)/i,
      /(?:kasbim|soham|mutaxassisligim)\s+([a-zA-Z0-9\s-]{3,30})/i,
      /(backend|frontend|fullstack|devops|designer|manager|developer|engineer|doctor|teacher|lawyer|accountant)/i
    ];
    for (const reg of occupationRegexes) {
      const match = text.match(reg);
      if (match && match[1]) {
        const value = this.cleanValue(match[1]);
        if (value && value.length >= 3) {
          facts.push({ type: 'occupation', value, confidence: 0.85 });
          break;
        }
      }
    }

    // 2. Company Patterns
    // "started working at Google", "works at Microsoft", "ishlayman Google da", etc.
    const companyRegexes = [
      /(?:work at|works at|working at|started at|joined|hired by|employed at)\s+([A-Z][a-zA-Z0-9\s&]{2,30})/i,
      /(?:kompaniyasida|kompaniyasiga|firmada)\s+([A-Z][a-zA-Z0-9\s&]{2,30})/i,
      /at\s+([A-Z][a-zA-Z0-9]{2,20})\s+as/i
    ];
    for (const reg of companyRegexes) {
      const match = text.match(reg);
      if (match && match[1]) {
        const value = this.cleanValue(match[1]);
        if (value && value.length >= 2) {
          facts.push({ type: 'company', value, confidence: 0.85 });
          facts.push({ type: 'milestone', value: `Started working at ${value}`, category: 'career', confidence: 0.80 });
          break;
        }
      }
    }

    // 3. Education Patterns
    // "I study at MIT", "graduated from Harvard", "talabaman TATU da"
    const eduRegexes = [
      /(?:study at|studying at|student at|graduated from|degree from|attending)\s+([A-Z][a-zA-Z0-9\s&]{2,40})/i,
      /(?:universitetida|institutida|o'qiyman)\s+([A-Z][a-zA-Z0-9\s&]{2,40})/i
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

    // 4. Location / Relocation Patterns
    // "I moved to Samarkand", "I live in Tashkent", "yashayman Toshkentda"
    const locRegexes = [
      /(?:moved to|relocated to|living in|live in|based in|from)\s+([A-Z][a-zA-Z\s]{2,25})/i,
      /(?:ko'chdim|ko'chib o'tdim|yashayman)\s+([A-Z][a-zA-Z\s]{2,25})/i
    ];
    for (const reg of locRegexes) {
      const match = text.match(reg);
      if (match && match[1]) {
        const value = this.cleanValue(match[1]);
        if (value && value.length >= 3) {
          facts.push({ type: 'location', value, confidence: 0.85 });
          if (lowerText.includes('move') || lowerText.includes("ko'ch")) {
            facts.push({ type: 'milestone', value: `Moved to ${value}`, category: 'relocation', confidence: 0.85 });
          }
          break;
        }
      }
    }

    // 5. Interest Patterns
    // "I love Formula 1", "interested in AI", "qiziqaman futbolga"
    const interestKeywords = [
      'formula 1', 'football', 'soccer', 'crypto', 'bitcoin', 'ai', 'artificial intelligence', 
      'machine learning', 'travel', 'finance', 'fitness', 'photography', 'movies', 'anime',
      'gaming', 'design', 'music', 'chess', 'reading', 'startup'
    ];
    for (const topic of interestKeywords) {
      if (lowerText.includes(topic)) {
        facts.push({ 
          type: 'interest', 
          value: topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
          confidence: 0.80 
        });
      }
    }

    // 6. Skill Patterns
    // "I work with NestJS and MongoDB", "skills: React, Python", etc.
    const skillKeywords = [
      'nestjs', 'nodejs', 'express', 'react', 'vue', 'angular', 'nextjs', 'typescript',
      'javascript', 'python', 'django', 'fastapi', 'java', 'spring', 'go', 'golang',
      'c++', 'c#', 'rust', 'mongodb', 'postgresql', 'mysql', 'docker', 'kubernetes',
      'aws', 'gcp', 'git', 'redis', 'graphql', 'flutter', 'swift', 'kotlin'
    ];
    for (const skill of skillKeywords) {
      try {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = /\w$/.test(skill) 
          ? `\\b${escaped}\\b` 
          : `(?:^|\\s|\\b)${escaped}(?:$|\\s|\\b|[.,!?])`;
        const reg = new RegExp(pattern, 'i');
        if (reg.test(text)) {
          facts.push({ 
            type: 'skill', 
            value: skill === 'nestjs' ? 'NestJS' : skill === 'nextjs' ? 'Next.js' : skill === 'nodejs' ? 'Node.js' : skill === 'c++' ? 'C++' : skill === 'c#' ? 'C#' : skill.charAt(0).toUpperCase() + skill.slice(1), 
            confidence: 0.85 
          });
        }
      } catch (e) {
        // Fallback simple search if regex fails
        if (lowerText.includes(skill)) {
          facts.push({ type: 'skill', value: skill, confidence: 0.80 });
        }
      }
    }

    // 7. Project Patterns
    // "I'm building Telegram CRM", "project: Chatbot"
    const projectRegexes = [
      /(?:building|developing|creating|working on a project|project:?)\s+([a-zA-Z0-9\s-]{3,35})(?=\.|\,|$|and|with)/i,
      /(?:loyiha|ustida ishlayapman)\s+([a-zA-Z0-9\s-]{3,35})/i
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

    // 8. Goal Patterns
    // "I'm preparing for IELTS", "goal is to learn Python"
    const goalRegexes = [
      /(?:preparing for|aiming for|target is|goal is|planning to)\s+([a-zA-Z0-9\s-]{3,35})(?=\.|\,|$)/i,
      /(?:tayyorlanayapman|maqsadim)\s+([a-zA-Z0-9\s-]{3,35})/i
    ];
    for (const reg of goalRegexes) {
      const match = text.match(reg);
      if (match && match[1]) {
        const value = this.cleanValue(match[1]);
        if (value && value.length >= 3) {
          facts.push({ type: 'goal', value, confidence: 0.80 });
          break;
        }
      }
    }

    return facts;
  }

  private cleanValue(str: string): string {
    return str
      .trim()
      .replace(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, '')
      .replace(/^[\s,.-]+|[\s,.-]+$/g, '');
  }
}
