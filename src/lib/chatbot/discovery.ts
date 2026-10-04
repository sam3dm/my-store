/**
 * What the bot learns about a visitor during the conversation (sector, services of interest,
 * platforms, location, creative approach) and the questions it asks to find out the rest.
 */
import { hasAny, normalize, type ChatLang } from './text';

export interface Discovery {
  field?: string;
  services: string[];
  platforms: string[];
  location?: string;
  approach?: 'ai' | 'real' | 'mix';
  details: Record<string, string>;
  notes: string[];
}

export const emptyDiscovery = (): Discovery => ({ services: [], platforms: [], details: {}, notes: [] });

const PLATFORMS: [string, string[]][] = [
  ['Instagram', ['instagram', 'insta', 'انستغرام', 'انستجرام', 'انستقرام', 'انستا']],
  ['TikTok', ['tiktok', 'tik tok', 'تيك توك', 'تيكتوك']],
  ['Facebook', ['facebook', 'fb', 'فيسبوك', 'فيس بوك']],
  ['YouTube', ['youtube', 'يوتيوب']],
  ['LinkedIn', ['linkedin', 'لينكدان', 'لينكد ان']],
  ['Snapchat', ['snapchat', 'snap', 'سناب شات', 'سناب']],
  ['X (Twitter)', ['twitter', 'تويتر', 'اكس']],
];

const LOCATIONS: [string, string[]][] = [
  ['Dubai', ['dubai', 'دبي']],
  ['Abu Dhabi', ['abu dhabi', 'abudhabi', 'ابوظبي', 'ابو ظبي']],
  ['Sharjah', ['sharjah', 'الشارقه', 'شارقه']],
  ['Ajman', ['ajman', 'عجمان']],
  ['Ras Al Khaimah', ['ras al khaimah', 'rak', 'راس الخيمه']],
  ['Fujairah', ['fujairah', 'الفجيره']],
  ['UAE', ['uae', 'emirates', 'الامارات', 'امارات']],
  ['Qatar', ['qatar', 'doha', 'قطر', 'الدوحه']],
  ['Saudi Arabia', ['saudi', 'ksa', 'riyadh', 'jeddah', 'السعوديه', 'سعودي', 'الرياض', 'جده']],
  ['Bahrain', ['bahrain', 'البحرين']],
  ['Oman', ['oman', 'muscat', 'عمان', 'مسقط']],
  ['Kuwait', ['kuwait', 'الكويت']],
  ['Egypt', ['egypt', 'cairo', 'مصر', 'القاهره']],
  ['Jordan', ['jordan', 'الاردن', 'عمان الاردن']],
  ['Lebanon', ['lebanon', 'لبنان', 'بيروت']],
];

const AI_WORDS = ['ai', 'ذكاء اصطناعي', 'ذكاء', 'artificial intelligence', 'ai generated', 'مولد'];
const REAL_WORDS = ['real shooting', 'shooting', 'filming', 'real footage', 'real filming', 'real shoot', 'real photography', 'actual filming', 'live action', 'filmed for real', 'تصوير حقيقي', 'تصوير فعلي', 'تصوير حي', 'حقيقي', 'تصوير بالكاميرا', 'تصوير واقعي', 'تصوير'];
const MIX_WORDS = ['mixed', 'mixing', 'combined', 'mix', 'both', 'combine', 'combination', 'hybrid', 'مزيج', 'كلاهما', 'الاثنين', 'دمج', 'خليط', 'مع بعض'];

export const GROUPS = {
  social: ['svc-01', 'svc-02', 'svc-16', 'svc-17', 'svc-18', 'svc-19', 'group-social'],
  video: ['group-shooting', 'svc-03', 'svc-04', 'svc-05', 'svc-08', 'svc-09', 'svc-13', 'svc-14', 'svc-15'],
  ai: ['svc-06', 'svc-21', 'svc-22', 'svc-23'],
  web: ['svc-11', 'svc-20'],
} as const;

export const inGroup = (d: Discovery, g: keyof typeof GROUPS) => d.services.some((s) => (GROUPS[g] as readonly string[]).includes(s));

export interface Extracted {
  platforms: string[];
  location?: string;
  approach?: 'ai' | 'real' | 'mix';
}

/** Pull platform / location / approach mentions out of one message. */
export function extractFacts(q: string): Extracted {
  const platforms = PLATFORMS.filter(([, keys]) => hasAny(q, keys)).map(([n]) => n);
  const loc = LOCATIONS.find(([, keys]) => hasAny(q, keys));
  let approach: Extracted['approach'];
  const ai = hasAny(q, AI_WORDS);
  const real = hasAny(q, REAL_WORDS);
  if (hasAny(q, MIX_WORDS) || (ai && real)) approach = 'mix';
  else if (ai) approach = 'ai';
  else if (real) approach = 'real';
  return { platforms, location: loc?.[0], approach };
}

export function mergeUnique(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])];
}

/* ── Questions ─────────────────────────────────────────────────────────────── */

export type QKey = 'name' | 'field' | 'need' | 'plat' | 'mgmt' | 'projtype' | 'aidetail' | 'webdetail' | 'location' | 'approach';

type Q = Record<ChatLang, string>;
export const QUESTIONS: Record<QKey, Q> = {
  name: { ar: 'وإن سمحت لي، ممكن أعرف اسمك الكريم؟', en: 'And if I may, what is your name?' },
  field: {
    ar: 'ولكي أخدمك على أفضل وجه، في أي مجال أو قطاع تعمل شركتك أو مشروعك؟ (مثلاً: عقارات، مطاعم، عيادات، سيارات، أزياء، عطور…)',
    en: 'So that I can assist you in the best possible way, which field or sector does your business or project operate in? (for example real estate, restaurants, clinics, automotive, fashion, fragrance…)',
  },
  need: {
    ar: 'ما الذي تبحث عنه معنا؟ هل تفكّر في إدارة حساباتك على وسائل التواصل الاجتماعي، أم في صناعة المحتوى والتصوير، أم الحملات الإعلانية، أم حلول الذكاء الاصطناعي، أم شيء آخر؟',
    en: 'What are you looking for from us? Are you thinking of social media management, content creation and filming, advertising campaigns, AI solutions — or something else?',
  },
  plat: {
    ar: 'على أي المنصات تنشطون حالياً أو تودّون التواجد؟ إنستغرام، تيك توك، فيسبوك، يوتيوب، لينكدإن أو سناب شات؟',
    en: 'Which platforms are you active on, or would you like to be on? Instagram, TikTok, Facebook, YouTube, LinkedIn or Snapchat?',
  },
  mgmt: {
    ar: 'هل تودّ أن نتولّى إدارة صفحاتك ومنشوراتك بالكامل، أم صناعة المحتوى فقط، أم تضيف إليها الحملات الإعلانية المموّلة؟ وهل لديكم حالياً فريق متخصص في التواصل الاجتماعي؟',
    en: 'Would you like us to take over the full management of your pages and posts, produce the content only, or add paid advertising campaigns as well? And do you currently have a social media team in-house?',
  },
  projtype: {
    ar: 'ما نوع الإنتاج الذي يدور في ذهنك؟ إعلان تجاري، فيلم سينمائي أو فيلم تعريفي بالعلامة، تصوير فوتوغرافي، بودكاست، أم محتوى لوسائل التواصل؟',
    en: 'What type of production do you have in mind? A commercial, a cinematic or brand film, photography, a podcast, or content for social media?',
  },
  aidetail: {
    ar: 'بخصوص الذكاء الاصطناعي، هل تفكّر في استخدامه في الإنتاج والمرئيات، أم في نظام مخصص لشركتك مثل روبوت دردشة أو ربط CRM أو أتمتة واتساب؟',
    en: 'Regarding AI, are you thinking of using it in production and visuals, or a custom system for your company such as a chatbot, CRM integration or WhatsApp automation?',
  },
  webdetail: {
    ar: 'هل هو موقع جديد أم إعادة تصميم لموقع قائم، أم تطبيق ويب؟ وهل لديكم هوية بصرية جاهزة؟',
    en: 'Is it a brand-new website, a redesign of an existing one, or a web application? And do you already have a brand identity?',
  },
  location: {
    ar: 'أين يقع مشروعك أو نشاطك؟ في دبي، أبوظبي، إمارة أخرى، أم في دولة أخرى مثل السعودية أو قطر أو البحرين أو عُمان؟',
    en: 'Where is your project or business based? Dubai, Abu Dhabi, another emirate, or another country such as Saudi Arabia, Qatar, Bahrain or Oman?',
  },
  approach: {
    ar: 'فيما يخص أسلوب التنفيذ، هل تفضّل التصوير الحقيقي، أم مرئيات مصنوعة بالذكاء الاصطناعي، أم مزيجاً من الاثنين؟',
    en: 'As for the creative approach, would you prefer real filming and photography, AI-generated visuals, or a mix of both?',
  },
};

export const ACKS: Record<ChatLang, string[]> = {
  ar: ['ممتاز، شكراً لك.', 'جميل جداً، سجّلتُ ذلك.', 'شكراً لك، هذه معلومة مفيدة.', 'رائع، وضّحت الصورة لي.', 'تمام، شكراً لمشاركتك ذلك.'],
  en: ['Excellent, thank you.', 'Wonderful, I have noted that.', 'Thank you, that is very helpful.', 'Great, that gives me a clearer picture.', 'Perfect, thanks for sharing that.'],
};

export const BRIDGES: Record<ChatLang, string[]> = {
  ar: ['وإن سمحت لي بسؤال: ', 'ولكي أفهم احتياجك أكثر: ', 'وبالمناسبة: '],
  en: ['If I may ask: ', 'To understand your needs better: ', 'By the way: '],
};

export const normalizeForStore = (s: string) => normalize(s);
