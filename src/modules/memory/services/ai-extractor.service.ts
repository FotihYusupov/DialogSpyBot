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

  // Common stop words to strictly prevent false positive extractions
  private readonly STOP_WORDS = new Set([
    'men', 'sen', 'u', 'biz', 'siz', 'ular', 'ishlayman', 'ishlayapman', 'ish',
    'yo\'q', 'ha', 'bilan', 'uchun', 'hozir', 'bugun', 'ertaga', 'salom', 'rahmat',
    'ok', 'haqida', 'yaxshi', 'yomon', 'qayerda', 'qachon', 'nima', 'qilyapman',
    'keldim', 'ketdim', 'bor', 'yoq', 'kerak', 'mumkin', 'emas', 'lekin', 'ammo',
    'chunki', 'agar', 'balki', 'shuning', 'uchun', 'boladi', 'bop', 'qanaqa'
  ]);

  async extractSemanticFacts(text?: string): Promise<SemanticFactResult[]> {
    if (!text || text.trim().length < 4) {
      return [];
    }

    const facts: SemanticFactResult[] = [];
    const lowerText = text.toLowerCase();

    // ==================== 1. TIMELINE & MILESTONES (Life & Career Events) ====================
    // Career Milestones
    const careerMilestones = [
      { regex: /(?:yangi\s+)?(?:ishga\s+(?:kirdim|o'tdim|qabul\s+qilindim)|ish\s+boshladim)\b/i, title: 'Yangi ish boshladi', category: 'career' },
      { regex: /(?:ishdan\s+(?:bo'shadim|ketdim|chiqdim)|istefo\s+berdim)\b/i, title: 'Ishdan bo\'shadi', category: 'career' },
      { regex: /(?:lavozimim\s+ko'tarildi|senior\s+bo'ldim|team\s+lead\s+bo'ldim|rahbar\s+bo'ldim|promoted\s+to)\b/i, title: 'Lavozimi ko\'tarildi', category: 'career' },
      { regex: /(?:kompaniya\s+ochdim|firma\s+ochdim|biznes\s+boshladim|startap\s+boshladim|launched\s+startup)\b/i, title: 'Yangi biznes/startap boshladi', category: 'career' },
    ];
    for (const m of careerMilestones) {
      if (m.regex.test(text)) {
        facts.push({ type: 'milestone', value: m.title, category: m.category, confidence: 0.90 });
        break;
      }
    }

    // Education Milestones
    const educationMilestones = [
      { regex: /(?:universitetni|institutni|o'qishni|kollejni)\s+(?:bitirdim|tamomladim|diplom\s+oldim|graduated)\b/i, title: 'O\'qishni tamomladi / Diplom oldi', category: 'education' },
      { regex: /(?:talaba\s+bo'ldim|o'qishga\s+kirdim|universitetga\s+kirdim|enrolled\s+at)\b/i, title: 'Universitetga qabul qilindi', category: 'education' },
      { regex: /(?:magistraturaga\s+kirdim|master\s+degree)\b/i, title: 'Magistraturaga kirdi', category: 'education' },
      { regex: /(?:IELTS(?:\s+dan)?\s*([5-9](?:\.[05])?)\s*(?:oldim|ball))/i, title: 'IELTS sertifikatini oldi', category: 'education' },
      { regex: /(?:sertifikat\s+oldim|got\s+certified|sertifikatlangan)\b/i, title: 'Malaka sertifikatini qo\'lga kiritdi', category: 'education' },
    ];
    for (const m of educationMilestones) {
      const match = text.match(m.regex);
      if (match) {
        const title = match[1] ? `IELTS ${match[1]} ball oldi` : m.title;
        facts.push({ type: 'milestone', value: title, category: m.category, confidence: 0.92 });
        break;
      }
    }

    // Relocation & Travel Milestones
    const relocationMilestones = [
      { regex: /(?:(Toshkent|Samarqand|Buxoro|Namangan|Andijon|Farg'ona|Qo'qon|Nukus|Urganch|Termiz|Qarshi|Jizzax|Guliston|Navoiy|Dubay|Turkiya|AQSH|Germaniya)(?:ga|da)\s+(?:ko'chdim|ish\s+boshladim))/i, title: 'Yangi shaharga ko\'chdi', category: 'relocation' },
      { regex: /\b([A-Z][a-zA-ZÀ-ÿ]{2,15})\s+shahriga\s+ko'chdim/i, title: 'Boshqa shaharga ko\'chdi', category: 'relocation' },
      { regex: /(?:chet\s+elga\s+ketdim|chet\s+elga\s+ko'chdim|relocated\s+abroad)\b/i, title: 'Chet elga ko\'chdi', category: 'relocation' },
      { regex: /\bko'chib\s+o'tdim\b/i, title: 'Boshqa joyga ko\'chib o\'tdi', category: 'relocation' },
    ];
    for (const m of relocationMilestones) {
      const match = text.match(m.regex);
      if (match) {
        const city = match[1] || '';
        const title = city ? `${this.cleanValue(city)} shahriga ko'chdi` : m.title;
        facts.push({ type: 'milestone', value: title, category: m.category, confidence: 0.90 });
        break;
      }
    }

    // Personal & Life Milestones
    const personalMilestones = [
      { regex: /(?:uylandim|turmushga\s+chiqdim|to'yim\s+bo'ldi|nikohim\s+bo'ldi|wedding|got\s+married)\b/i, title: 'Turmush qurdi / To\'y bo\'ldi', category: 'personal' },
      { regex: /(?:farzandli\s+bo'ldim|o'g'illi\s+bo'ldim|qizli\s+bo'ldim|chaqaloq|had\s+a\s+baby)\b/i, title: 'Farzandli bo\'ldi', category: 'personal' },
      { regex: /(?:yangi\s+uy\s+oldim|kvartira\s+sotib\s+oldim|uy\s+oldik|bought\s+(?:a\s+)?house)\b/i, title: 'Uy / Kvartira sotib oldi', category: 'personal' },
      { regex: /(?:yangi\s+mashina\s+oldim|avtomobil\s+sotib\s+oldim|bought\s+(?:a\s+)?car)\b/i, title: 'Avtomobil sotib oldi', category: 'personal' },
      { regex: /(?:bugun\s+tug'ilgan\s+kunim|tug'ilgan\s+kunim\s+edi|my\s+birthday)\b/i, title: 'Tug\'ilgan kun nishonlandi', category: 'personal' },
    ];
    for (const m of personalMilestones) {
      if (m.regex.test(text)) {
        facts.push({ type: 'milestone', value: m.title, category: m.category, confidence: 0.92 });
        break;
      }
    }

    // Business & Deal Milestones
    const businessMilestones = [
      { regex: /(?:shartnoma\s+(?:tuzdik|imzoladik|yopdik)|kelishuvga\s+erishdik|signed\s+contract)\b/i, title: 'Katta shartnoma imzoladi', category: 'business' },
      { regex: /(?:investitsiya\s+(?:oldik|jalb\s+qildik)|grant\s+yutdim|raised\s+investment)\b/i, title: 'Investitsiya / Grant jalb qildi', category: 'business' },
    ];
    for (const m of businessMilestones) {
      if (m.regex.test(text)) {
        facts.push({ type: 'milestone', value: m.title, category: m.category, confidence: 0.90 });
        break;
      }
    }

    // ==================== 2. KASB / OCCUPATION ====================
    const specificRoles = [
      'backend dasturchi', 'frontend dasturchi', 'fullstack dasturchi', 'mobile dasturchi',
      'ios dasturchi', 'android dasturchi', 'devops muhandis', 'dasturiy injener',
      'grafik dizayner', 'ui/ux dizayner', 'bosh buxgalter', 'buxgalter', 'shifokor',
      'tish shifokori', 'o\'qituvchi', 'huquqshunos', 'advokat', 'arxitektor',
      'loyiha menejeri', 'mahsulot menejeri', 'sotuv menejeri', 'marketing mutaxassisi',
      'tahlilchi', 'tizim administratori', 'tarjimon', 'direktor'
    ];
    for (const role of specificRoles) {
      if (lowerText.includes(role)) {
        const capitalized = role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        facts.push({ type: 'occupation', value: capitalized, confidence: 0.92 });
        break;
      }
    }

    if (!facts.some(f => f.type === 'occupation')) {
      const occupationRegexes = [
        /(?:working as|works as|job is|role is|position is)\s+(?:a|an)?\s*([a-zA-Z\s-]{3,25})(?=\.|,|$|and|at|in)/i,
        /(?:kasbim|soham|mutaxassisligim)\s+([a-zA-ZÀ-ÿ\s-]{3,25})(?=\.|,|$|bilan)/i,
      ];
      for (const reg of occupationRegexes) {
        const match = text.match(reg);
        if (match && match[1]) {
          const val = this.cleanValue(match[1]);
          if (val && val.length >= 3 && !this.STOP_WORDS.has(val.toLowerCase())) {
            facts.push({ type: 'occupation', value: val, confidence: 0.85 });
            break;
          }
        }
      }
    }

    // ==================== 3. KOMPANIYA / COMPANY ====================
    const knownCompanies = [
      'Google', 'EPAM', 'Yandex', 'Uzum', 'Click', 'Payme', 'Beeline', 'Ucell',
      'Mobiuz', 'IT Park', 'TBC', 'Kapitalbank', 'Ipak Yo\'li', 'Orient Finans Bank',
      'Artel', 'Akfa', 'Korzinka', 'Havas', 'Makro', 'Microsoft', 'Amazon', 'Meta', 'Apple'
    ];
    for (const comp of knownCompanies) {
      const compRegex = new RegExp(`\\b${comp.replace(/[']/g, "['’`]")}\\b`, 'i');
      if (compRegex.test(text)) {
        facts.push({ type: 'company', value: comp, confidence: 0.95 });
        break;
      }
    }

    if (!facts.some(f => f.type === 'company')) {
      const companyRegexes = [
        /(?:work at|working at|started at|employed at)\s+([A-Z][a-zA-Z0-9\s&]{2,25})/i,
        /([A-Z][a-zA-Z0-9\s&]{2,25})\s+(?:kompaniyasida|firmasida|da ishlayapman|ga ishga kirdim)/i,
      ];
      for (const reg of companyRegexes) {
        const match = text.match(reg);
        if (match && match[1]) {
          const val = this.cleanValue(match[1]);
          if (val && val.length >= 3 && !this.STOP_WORDS.has(val.toLowerCase())) {
            facts.push({ type: 'company', value: val, confidence: 0.85 });
            break;
          }
        }
      }
    }

    // ==================== 4. TA'LIM / EDUCATION ====================
    const knownUniversities = [
      'TATU', 'INHA', 'WIUT', 'Vestminster', 'MDIST', 'Singapur', 'Amity', 'TDIU',
      'O\'zMU', 'SamDU', 'JIDU', 'ToshDTU', 'Turin', 'Akfa Universiteti', 'Cambridge'
    ];
    for (const uni of knownUniversities) {
      const uniRegex = new RegExp(`\\b${uni}\\b`, 'i');
      if (uniRegex.test(text)) {
        facts.push({ type: 'education', value: uni, confidence: 0.95 });
        break;
      }
    }

    // ==================== 5. JOYLASHUV / LOCATION ====================
    const uzbCities = [
      'Toshkent', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon', 'Farg\'ona',
      'Qo\'qon', 'Nukus', 'Urganch', 'Termiz', 'Qarshi', 'Jizzax', 'Guliston', 'Navoiy'
    ];
    for (const city of uzbCities) {
      const cityRegex = new RegExp(`\\b${city.replace(/[']/g, "['’`]")}\\b`, 'i');
      if (cityRegex.test(text)) {
        facts.push({ type: 'location', value: city, confidence: 0.92 });
        break;
      }
    }

    // ==================== 6. KO'NIKMALAR / SKILLS ====================
    const skillKeywords = [
      'nestjs', 'nodejs', 'express', 'react', 'vue', 'angular', 'nextjs', 'typescript',
      'javascript', 'python', 'django', 'fastapi', 'java', 'spring', 'go', 'golang',
      'c++', 'c#', 'rust', 'mongodb', 'postgresql', 'mysql', 'docker', 'kubernetes',
      'aws', 'gcp', 'git', 'redis', 'graphql', 'flutter', 'swift', 'kotlin',
      '1c', 'bitrix', 'wordpress', 'php', 'laravel', 'figma'
    ];
    const skillDisplayNames: Record<string, string> = {
      nestjs: 'NestJS', nextjs: 'Next.js', nodejs: 'Node.js',
      'c++': 'C++', 'c#': 'C#', golang: 'Go',
      '1c': '1C', bitrix: 'Bitrix', figma: 'Figma', ui: 'UI/UX'
    };
    for (const skill of skillKeywords) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = /\w$/.test(skill)
        ? `\\b${escaped}\\b`
        : `(?:^|\\s|\\b)${escaped}(?:$|\\s|\\b|[.,!?])`;
      const reg = new RegExp(pattern, 'i');
      if (reg.test(text)) {
        const displayName = skillDisplayNames[skill] || skill.charAt(0).toUpperCase() + skill.slice(1);
        facts.push({ type: 'skill', value: displayName, confidence: 0.90 });
      }
    }

    // ==================== 7. QIZIQISHLAR / INTERESTS ====================
    const interestKeywords: Record<string, string> = {
      'formula 1': 'Formula 1',
      'football': 'Futbol',
      'futbol': 'Futbol',
      'shaxmat': 'Shaxmat',
      'chess': 'Shaxmat',
      'crypto': 'Kriptovalyuta',
      'bitcoin': 'Kriptovalyuta',
      'artificial intelligence': 'Sun\'iy Intellekt',
      'machine learning': 'Machine Learning',
      'sayohat': 'Sayohat',
      'travel': 'Sayohat',
      'fotografiya': 'Fotografiya',
      'photography': 'Fotografiya',
      'kino': 'Kino',
      'kitob': 'Kitob mutolaasi',
      'gaming': 'Kiber sport / O\'yinlar',
      'tennis': 'Tennis',
      'suzish': 'Suzish',
      'fitness': 'Fitnes / Sport'
    };
    for (const [kw, label] of Object.entries(interestKeywords)) {
      if (lowerText.includes(kw)) {
        facts.push({
          type: 'interest',
          value: label,
          confidence: 0.85,
        });
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
