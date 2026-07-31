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

    // ==================== 1. Kasb / Occupation ====================
    // Inglizcha + O'zbekcha
    const occupationRegexes = [
      // Inglizcha
      /(?:i am|i'm|working as|works as|job is|role is|position is)\s+(?:a|an)?\s*([a-zA-Z0-9\s-]{3,30})(?=\.|,|$|and|at|in)/i,
      // O'zbekcha
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

    // ==================== 2. Kompaniya / Company ====================
    const companyRegexes = [
      // Inglizcha
      /(?:work at|works at|working at|started at|joined|hired by|employed at)\s+([A-Z][a-zA-Z0-9\s&]{2,30})/i,
      // O'zbekcha
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

    // ==================== 3. Ta'lim / Education ====================
    const eduRegexes = [
      // Inglizcha
      /(?:study at|studying at|student at|graduated from|degree from|attending)\s+([A-Z][a-zA-Z0-9\s&]{2,40})/i,
      // O'zbekcha
      /(?:universitetida|institutida|o'qiyman|talabaman|bitirganman)\s+([A-Z][a-zA-Z0-9\s&]{2,40})/i,
      /([A-Z][a-zA-Z0-9\s&]{2,30})\s+(?:universitetida|institutida|kollejida)\s+(?:o'qiyman|talabaman)/i,
      // Qisqa: "TATU da o'qiyman", "INHA da talabaman"
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

    // ==================== 4. Joylashuv / Location ====================
    const locRegexes = [
      // Inglizcha
      /(?:moved to|relocated to|living in|live in|based in|from)\s+([A-Z][a-zA-Z\s]{2,25})/i,
      // O'zbekcha
      /(?:ko'chdim|ko'chib o'tdim|yashayman|yashayapman|turaman)\s+([A-Z][a-zA-ZÀ-ÿ\s]{2,25})/i,
      /([A-Z][a-zA-ZÀ-ÿ\s]{2,20})\s+(?:shahriga ko'chdim|shahrida yashayman|da turaman)/i,
      // Shahar nomlari (O'zbekiston shaharlari)
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

    // ==================== 5. Qiziqishlar / Interests ====================
    const interestKeywords = [
      // Inglizcha
      'formula 1', 'football', 'soccer', 'crypto', 'bitcoin', 'ai', 'artificial intelligence',
      'machine learning', 'travel', 'finance', 'fitness', 'photography', 'movies', 'anime',
      'gaming', 'design', 'music', 'chess', 'reading', 'startup',
      // O'zbekcha
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

    // ==================== 6. Ko'nikmalar / Skills ====================
    const skillKeywords = [
      'nestjs', 'nodejs', 'express', 'react', 'vue', 'angular', 'nextjs', 'typescript',
      'javascript', 'python', 'django', 'fastapi', 'java', 'spring', 'go', 'golang',
      'c++', 'c#', 'rust', 'mongodb', 'postgresql', 'mysql', 'docker', 'kubernetes',
      'aws', 'gcp', 'git', 'redis', 'graphql', 'flutter', 'swift', 'kotlin',
      // O'zbekistonda keng tarqalgan texnologiyalar
      '1c', 'bitrix', 'wordpress', 'php', 'laravel',
    ];
    const skillDisplayNames: Record<string, string> = {
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
      } catch (e) {
        if (lowerText.includes(skill)) {
          facts.push({ type: 'skill', value: skill, confidence: 0.80 });
        }
      }
    }

    // ==================== 7. Loyiha / Project ====================
    const projectRegexes = [
      // Inglizcha
      /(?:building|developing|creating|working on|project:?)\s+([a-zA-Z0-9\s-]{3,35})(?=\.|,|$|and|with)/i,
      // O'zbekcha
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

    // ==================== 8. Maqsad / Goal ====================
    const goalRegexes = [
      // Inglizcha
      /(?:preparing for|aiming for|target is|goal is|planning to)\s+([a-zA-Z0-9\s-]{3,35})(?=\.|,|$)/i,
      // O'zbekcha
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

  private cleanValue(str: string): string {
    return str
      .trim()
      .replace(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, '')
      .replace(/^[\s,.-]+|[\s,.-]+$/g, '');
  }
}
