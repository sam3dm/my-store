/**
 * Conversation engine for "Metropolitan Chatbot".
 *
 * Local and deterministic: it answers only from the website content (knowledge.ts), never quotes
 * prices or discusses individuals, remembers what it has already asked, and steers every answer
 * into a short discovery conversation (sector → needs → details → location → contact) which ends
 * in a report for the team. Anything outside the website gets a polite "I don't know" and an
 * offer to pass the visitor's details to the team.
 */
import {
  ACKS,
  BRIDGES,
  emptyDiscovery,
  extractFacts,
  inGroup,
  mergeUnique,
  QUESTIONS,
  type Discovery,
  type QKey,
} from './discovery';
import { buildKnowledge, matchEntries, type KbEntry } from './knowledge';
import { detectScript, hasAny, hasPhrase, isQuestion, normalize, wordCount, type ChatLang } from './text';

export type Mode = 'idle' | 'leadName' | 'leadMobile' | 'leadPhone' | 'confirmName';
export type Pending = QKey | 'name' | 'contact' | null;

export interface Lead {
  name?: string;
  mobile?: string;
  phone?: string;
  topic?: string;
  voiceUrl?: string;
  discovery?: Discovery;
  lang?: ChatLang;
}

export interface ChatState {
  lang: ChatLang;
  name?: string;
  nameGuess?: string;
  mode: Mode;
  askedName: boolean;
  pending: Pending;
  asked: Partial<Record<string, number>>;
  discovery: Discovery;
  lead: Lead;
  contact?: { mobile?: string; phone?: string };
  reported: boolean;
  turn: number;
  lastQuestion?: string;
  voiceUrl?: string;
}

export interface BotReply {
  text: string;
  /** Further messages sent as separate bubbles right after `text`. */
  extra?: string[];
  /** Page the visitor can open for more detail (path without language prefix). */
  page?: string;
  /** Set when the report is complete and should be sent to the team. */
  submit?: Lead;
}

export interface TurnResult {
  state: ChatState;
  reply: BotReply;
}

export function initialState(lang: ChatLang): ChatState {
  return { lang, mode: 'idle', askedName: false, pending: null, asked: {}, discovery: emptyDiscovery(), lead: {}, reported: false, turn: 0 };
}

/* ── Wording ─────────────────────────────────────────────────────────────── */

const S = {
  ar: {
    greetFirst:
      'السلام عليكم ورحمة الله وبركاته، يسعدني حضورك. أنا «متروبوليتان تشات بوت»، المساعد الافتراضي لشركة متروبوليتان ديجيتال ماركتينج في دبي. ممكن نتعرّف على حضرتك؟ ما هو اسمك الكريم، وكيف يمكنني خدمتك اليوم؟',
    salaamBack:
      'وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً بك! نتشرّف بالتعرّف على حضرتك. أنا «متروبوليتان تشات بوت»، المساعد الافتراضي لشركة متروبوليتان ديجيتال ماركتينج. ',
    hello: 'مرحباً بك! كيف حالك؟ أنا «متروبوليتان تشات بوت»، المساعد الافتراضي لشركة متروبوليتان ديجيتال ماركتينج. ',
    askName: 'ممكن نتعرّف على حضرتك؟ ما هو اسمك الكريم، وكيف يمكنني خدمتك؟',
    howAreYou: 'بخير والحمد لله، شكراً لسؤالك الكريم! ',
    niceToMeet: (n: string) => `تشرّفنا بك يا ${n}! `,
    thanks: 'العفو، هذا من دواعي سروري! ',
    bye: 'شكراً لتواصلك مع متروبوليتان ديجيتال ماركتينج، ويسعدنا خدمتك في أي وقت. إلى اللقاء!',
    identity:
      'أنا «متروبوليتان تشات بوت»، المساعد الافتراضي لشركة متروبوليتان ديجيتال ماركتينج، استوديو للإنتاج الإبداعي في دبي. أجيب عن الأسئلة المتعلقة بخدماتنا وأعمالنا.',
    listServices: 'تقدّم متروبوليتان ديجيتال ماركتينج الخدمات التالية:\n',
    listIndustries: 'نعمل مع القطاعات التالية:\n',
    askAboutService: 'اسألني عن أي خدمة لأشرحها لك بالتفصيل.',
    askAboutIndustry: 'اسألني عن أي قطاع لأوضّح لك ما نقدّمه له.',
    price:
      'أشكرك على اهتمامك. لا أملك تفاصيل الأسعار، فالتكلفة تختلف بحسب طبيعة كل مشروع ونطاقه، وسيعدّ لك فريقنا عرضاً مناسباً بعد أن يطّلع على احتياجك. ',
    privacy: 'أعتذر، لا أستطيع الحديث عن معلومات شخصية أو عن أشخاص. ',
    unknown: 'شكراً على سؤالك. لا علم لي بهذه المعلومة، فهي ليست ضمن المعلومات المتوفرة على موقعنا، وسيتواصل معك فريق العمل في أقرب وقت ممكن. ',
    askLeadName: 'هل تتفضّل بكتابة اسمك الكريم؟',
    askMobile: (n: string) => `${n ? `${n}، ` : ''}ليتمكّن فريقنا من التواصل معك في أقرب وقت ممكن، هل تتفضّل بكتابة رقم جوالك (يفضّل أن يكون عليه واتساب)؟`,
    askMobileShort: 'هل تتفضّل بكتابة رقم جوالك (يفضّل أن يكون عليه واتساب)؟',
    askNameFirst: 'هل تتفضّل بكتابة اسمك الكريم أولاً؟',
    askPhone: 'وهل لديك رقم هاتف آخر للتواصل؟ إن لم يكن فاكتب «لا يوجد».',
    badMobile: 'يبدو أن الرقم غير مكتمل، هل تتفضّل بكتابته مع رمز الدولة؟ مثال: 971501234567+',
    didntCatchMobile: 'لم أجد رقماً في رسالتك. هل تتفضّل بكتابة رقم جوالك؟ وإن فضّلت عدم ترك رقمك الآن فلا بأس إطلاقاً.',
    done: (n: string) => `شكراً جزيلاً${n ? ` يا ${n}` : ''}، تم تسجيل بياناتك وتفاصيل طلبك بنجاح، وسيتواصل معك فريق متروبوليتان ديجيتال ماركتينج في أقرب وقت ممكن. `,
    declineContact: 'لا بأس إطلاقاً. متى رغبت يمكنك التواصل معنا مباشرة عبر واتساب أو صفحة «تواصل معنا». ',
    anythingElse: 'وإن كان لديك أي سؤال آخر عن شركتنا أو أعمالنا أو خدماتنا فأنا في خدمتك.',
    voiceGot: 'وصلتني رسالتك الصوتية، شكراً لك. أنا مساعد كتابي ولا أستطيع سماع الرسائل الصوتية، لكنني سأحوّلها إلى فريقنا ليستمعوا إليها ويردّوا عليك. ',
    voiceFail: 'عذراً، تعذّر إرسال الرسالة الصوتية. يمكنك كتابة رسالتك أو التواصل معنا عبر واتساب.',
    otherLang: 'شكراً لرسالتك. يمكنني خدمتك باللغتين العربية والإنجليزية فقط، ويسعدني أن تكتب لي بأيٍّ منهما.',
    nameGuess: (n: string) => `تشرّفنا! هل اسمك «${n}»؟`,
    nameNo: 'عذراً على سوء الفهم، ما هو اسمك الكريم إذاً؟',
    recap: 'ملخص ما فهمته منك: ',
    labels: { field: 'المجال', services: 'الخدمات', platforms: 'المنصات', location: 'الموقع', approach: 'الأسلوب', approachV: { ai: 'ذكاء اصطناعي', real: 'تصوير حقيقي', mix: 'مزيج من الاثنين' } },
    contactAsk: 'ولكي يجهّز فريقنا لك عرضاً مناسباً ويتواصل معك في أقرب وقت ممكن، ',
    teamAsk: 'بكل سرور! ',
  },
  en: {
    greetFirst:
      "Hello and welcome! I'm Metropolitan Chatbot, the virtual assistant of Metropolitan Digital Marketing in Dubai. It's a pleasure to meet you — may I know your name, and how can I help you today?",
    salaamBack:
      "Wa alaykum assalam wa rahmatullah, and a warm welcome! It's an honour to get to know you. I'm Metropolitan Chatbot, the virtual assistant of Metropolitan Digital Marketing. ",
    hello: "Hello and welcome, I hope you're well! I'm Metropolitan Chatbot, the virtual assistant of Metropolitan Digital Marketing. ",
    askName: "May I know your name, and how can I help you today?",
    howAreYou: "I'm doing very well, thank you for asking! ",
    niceToMeet: (n: string) => `It's a pleasure to meet you, ${n}! `,
    thanks: "You're most welcome, it's my pleasure! ",
    bye: 'Thank you for contacting Metropolitan Digital Marketing — we would be glad to help you at any time. Goodbye!',
    identity:
      "I'm Metropolitan Chatbot, the virtual assistant of Metropolitan Digital Marketing, a creative production studio in Dubai. I answer questions about our services and our work.",
    listServices: 'Metropolitan Digital Marketing offers the following services:\n',
    listIndustries: 'We work with the following industries:\n',
    askAboutService: 'Ask me about any service and I will explain it in detail.',
    askAboutIndustry: 'Ask me about any sector and I will tell you what we offer it.',
    price:
      "Thank you for your interest. I don't have pricing details, as the cost depends on the nature and scope of each project, and our team will prepare a suitable proposal once they understand your needs. ",
    privacy: "I'm sorry, I'm not able to discuss personal information or individuals. ",
    unknown:
      "Thank you for your question. I'm afraid I don't have that information, as it isn't part of what is published on our website, and our team will be glad to get in touch with you as soon as possible. ",
    askLeadName: 'May I have your name, please?',
    askMobile: (n: string) => `${n ? `${n}, ` : ''}so that our team can get in touch with you as soon as possible, may I have your mobile number (preferably with WhatsApp)?`,
    askMobileShort: 'may I have your mobile number (preferably with WhatsApp)?',
    askNameFirst: 'may I have your name, please?',
    askPhone: 'And do you have another phone number we can reach you on? If not, just type "none".',
    badMobile: 'That number looks incomplete — could you please type it with the country code? For example: +971501234567',
    didntCatchMobile: "I couldn't find a number in your message. Could you type your mobile number? If you'd rather not leave it now, that's perfectly fine.",
    done: (n: string) => `Thank you very much${n ? `, ${n}` : ''} — your details and request have been recorded, and the Metropolitan Digital Marketing team will contact you as soon as possible. `,
    declineContact: 'Not a problem at all. Whenever you wish, you can reach us directly on WhatsApp or via the Contact page. ',
    anythingElse: 'If you have any other question about our company, our work or our services, I am at your service.',
    voiceGot:
      "I've received your voice message, thank you. I'm a text assistant and can't listen to voice notes, but I'll pass it to our team so they can listen and get back to you. ",
    voiceFail: "Sorry, your voice message couldn't be sent. You can type your message or reach us on WhatsApp.",
    otherLang: 'Thank you for your message. I can assist in Arabic and English only — please write to me in either and I will gladly help.',
    nameGuess: (n: string) => `Lovely to meet you! Is your name "${n}"?`,
    nameNo: 'Apologies for the misunderstanding — what is your name, then?',
    recap: "Here's what I understood: ",
    labels: { field: 'Field', services: 'Services', platforms: 'Platforms', location: 'Location', approach: 'Approach', approachV: { ai: 'AI-generated', real: 'real filming', mix: 'a mix of both' } },
    contactAsk: 'So that our team can prepare a suitable proposal and get in touch with you as soon as possible, ',
    teamAsk: 'With pleasure! ',
  },
} as const;

/* ── Phrase lists ─────────────────────────────────────────────────────────── */

const SALAAM = ['السلام عليكم', 'سلام عليكم', 'assalam', 'salam', 'assalamu alaikum', 'peace be upon'];
const GREETING = ['مرحبا', 'اهلا', 'هلا', 'هلو', 'سلام', 'صباح الخير', 'مساء الخير', 'hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'greetings', 'hola'];
const HOW_ARE_YOU = ['كيف حالك', 'كيفك', 'شلونك', 'اخبارك', 'how are you', "how's it going", 'how do you do'];
const THANKS = ['شكرا', 'يعطيك العافيه', 'مشكور', 'thanks', 'thank you', 'thx'];
const BYE = ['مع السلامه', 'الي اللقاء', 'باي', 'bye', 'goodbye', 'see you'];
const IDENTITY = ['من انت', 'ما اسمك', 'شو اسمك', 'what is your name', 'who are you', 'your name', 'are you a bot', 'هل انت روبوت', 'هل انت بوت'];
const PRICE = ['charge', 'charges', 'charging', 'expensive', 'cheap', 'affordable', 'تتقاضون', 'رسوم', 'غالي', 'رخيص', 'اسعاركم', 'سعركم', 'تكلفتكم', 'سعر', 'اسعار', 'تكلفه', 'تكاليف', 'كم يكلف', 'كم التكلفه', 'كم السعر', 'بكم', 'ميزانيه', 'عرض سعر', 'price', 'prices', 'pricing', 'cost', 'costs', 'how much', 'quote', 'quotation', 'budget', 'rate', 'fee', 'fees', 'package', 'packages', 'باقات', 'باقه'];
const PERSONAL = ['مؤسس', 'اسس', 'مالك', 'صاحب الشركه', 'المدير', 'مدير', 'رئيس', 'موظف', 'موظفين', 'راتب', 'عمر', 'ديانه', 'owner', 'founder', 'founded', 'who owns', 'who started', 'ceo', 'manager', 'employee', 'staff', 'salary', 'married', 'age', 'personal', 'home address', 'مين صاحب', 'من يملك'];
const TEAM = ['talk to the team', 'speak to someone', 'speak to a human', 'human', 'agent', 'representative', 'call me', 'contact me', 'تحدث مع الفريق', 'التحدث مع الفريق', 'اتصلوا بي', 'تواصلوا معي', 'اريد التحدث', 'موظف خدمه', 'بشري', 'ممثل'];
const LIST_SERVICES = ['services', 'service', 'what do you offer', 'what do you do', 'what you do', 'offer', 'خدمات', 'خدماتكم', 'خدماتنا', 'ماذا تقدمون', 'ماذا تقدم', 'شو تقدمون', 'شو الخدمات', 'ماذا تفعلون', 'شو شغلكم', 'ما هي خدماتكم', 'ايش تقدمون'];
const LIST_INDUSTRIES = ['industries', 'industry', 'sectors', 'sector', 'who do you work with', 'قطاعات', 'القطاعات', 'مجالات', 'من تخدمون', 'لمن تقدمون'];
const YES = ['نعم', 'ايوه', 'ايه', 'اجل', 'تمام', 'اكيد', 'طبعا', 'بالتاكيد', 'yes', 'yeah', 'sure', 'ok', 'okay', 'please', 'yep', 'of course', 'correct', 'right', 'صحيح', 'هو'];
const NO = ['لا', 'كلا', 'لا شكرا', 'لا اريد', 'no', 'nope', 'no thanks', 'not now', 'later', 'ليس الان', 'مو الان', 'مش الان'];
const DONE = ['ما احتاج', 'لا احتاج', 'مو محتاج', 'ما ابي', 'ما ابغي', "don't need", 'dont need', 'not interested', 'مش محتاج', 'that is all', "that's all", 'thats all', 'nothing else', 'no more', 'enough', 'خلاص', 'هذا كل شيء', 'هذا كافي', 'كفايه', 'لا شيء اخر', 'ما في شيء', 'لا شكرا', 'no thanks', 'no thank you'];
const NAME_STOP = new Set(['yes', 'no', 'ok', 'okay', 'hello', 'hi', 'hey', 'thanks', 'نعم', 'لا', 'اوك', 'تمام', 'مرحبا', 'اهلا', 'شكرا', 'خدمات', 'services', 'help', 'مساعده', 'price', 'سعر']);

const has = hasAny;

/* ── Knowledge ───────────────────────────────────────────────────────────── */

let kbCache: Partial<Record<ChatLang, ReturnType<typeof buildKnowledge>>> = {};
function kb(lang: ChatLang) {
  return (kbCache[lang] ??= buildKnowledge(lang));
}
export function resetKnowledgeCache() {
  kbCache = {};
}

function enTitle(id: string): string {
  if (id === 'group-social') return 'Social media services';
  if (id === 'group-shooting') return 'Filming & photography';
  return kb('en').entries.find((e) => e.id === id)?.answer.split(' — ')[0] ?? id;
}
export const serviceTitles = (ids: string[]) => ids.map(enTitle);
const titleIn = (id: string, lang: ChatLang) =>
  id === 'group-social' ? (lang === 'ar' ? 'خدمات وسائل التواصل الاجتماعي' : 'Social media services') : id === 'group-shooting' ? (lang === 'ar' ? 'التصوير والإنتاج المرئي' : 'Filming & photography') : (kb(lang).entries.find((e) => e.id === id)?.answer.split(' — ')[0] ?? id);

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const westernDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
const hasDigits = (s: string) => /\d/.test(westernDigits(s));
const isMobile = (s: string) => s.replace(/[^\d]/g, '').length >= 7 && /^[+\d\s()\-.]+$/.test(s.trim());

function cleanName(n: string) {
  return n
    .trim()
    .split(/\s+/)
    .map((w) => (/[a-z]/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Only an explicit "my name is …" / "اسمي …" statement counts. */
function explicitName(raw: string): string | null {
  const text = raw.trim().replace(/[.!؟?،,]+$/g, '');
  const m = text.match(/^(?:اسمي|انا اسمي|أنا اسمي|my name is|call me|name'?s)\s+([\p{L}][\p{L}\s]{1,30})$/iu);
  return m && wordCount(m[1]!) <= 3 ? cleanName(m[1]!) : null;
}

function extractName(raw: string, strict = false): string | null {
  const text = raw.trim().replace(/[.!؟?،,]+$/g, '');
  const patterns = [
    /(?:اسمي|انا اسمي|أنا اسمي|معك|انا|أنا)\s+([\p{L}][\p{L}\s]{1,30})$/u,
    /(?:my name is|i am|i'm|this is|name'?s|call me)\s+([\p{L}][\p{L}\s]{1,30})$/iu,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && wordCount(m[1]!) <= 3) return cleanName(m[1]!);
  }
  if (wordCount(text) <= (strict ? 2 : 3) && /^[\p{L}\s.'-]{2,30}$/u.test(text) && !NAME_STOP.has(normalize(text))) return cleanName(text);
  return null;
}

const pick = <T,>(arr: readonly T[], n: number): T => arr[n % arr.length]!;

function nextQuestion(state: ChatState): QKey | 'contact' | null {
  const d = state.discovery;
  const a = state.asked;
  const fresh = (k: string) => (a[k] ?? 0) < 1;
  if (!state.name && (a.name ?? 0) < 2 && state.turn >= 2) return 'name';
  if (!d.field && fresh('field')) return 'field';
  if (d.services.length === 0 && fresh('need')) return 'need';
  if (inGroup(d, 'social') && d.platforms.length === 0 && fresh('plat')) return 'plat';
  if (inGroup(d, 'social') && !d.details.mgmt && fresh('mgmt')) return 'mgmt';
  if (inGroup(d, 'video') && !d.details.projtype && fresh('projtype')) return 'projtype';
  if (inGroup(d, 'ai') && !d.details.aidetail && fresh('aidetail')) return 'aidetail';
  if (inGroup(d, 'web') && !d.details.webdetail && fresh('webdetail')) return 'webdetail';
  if (!d.location && fresh('location')) return 'location';
  if ((inGroup(d, 'social') || inGroup(d, 'video') || inGroup(d, 'ai')) && !d.approach && fresh('approach')) return 'approach';
  if (!state.reported && !state.contact?.mobile && (a.contact ?? 0) < 2) return 'contact';
  return null;
}

/** Ask the next question (marking it as asked so it is never repeated). Returns the text to append. */
function steer(state: ChatState, lang: ChatLang, first = false, force?: 'contact', plain = false): string {
  const k = force ?? nextQuestion(state);
  const t = S[lang];
  if (!k) return '';
  state.asked[k] = (state.asked[k] ?? 0) + 1;
  state.pending = k;
  if (k === 'contact') {
    if (state.name) {
      state.mode = 'leadMobile';
      state.lead.name = state.name;
      return (plain ? '' : t.contactAsk) + (plain ? t.askMobileShort.replace(/^./, (c) => c.toUpperCase()) : t.askMobileShort);
    }
    state.mode = 'leadName';
    return (plain ? '' : t.contactAsk) + (plain ? t.askNameFirst.replace(/^./, (c) => c.toUpperCase()) : t.askNameFirst);
  }
  const bridge = first || k === 'name' || k === 'field' ? '' : pick(BRIDGES[lang], state.turn);
  return bridge + QUESTIONS[k][lang];
}

const AR_PLACES: Record<string, string> = { Dubai: 'دبي', 'Abu Dhabi': 'أبوظبي', Sharjah: 'الشارقة', Ajman: 'عجمان', 'Ras Al Khaimah': 'رأس الخيمة', Fujairah: 'الفجيرة', UAE: 'الإمارات', Qatar: 'قطر', 'Saudi Arabia': 'السعودية', Bahrain: 'البحرين', Oman: 'عُمان', Kuwait: 'الكويت', Egypt: 'مصر', Jordan: 'الأردن', Lebanon: 'لبنان' };

function ackText(state: ChatState, ids: string[], lang: ChatLang): string {
  if (!ids.length) return `${pick(ACKS[lang], state.turn)} `;
  const names = ids.slice(0, 3).map((id) => titleIn(id, lang));
  return lang === 'en'
    ? `Wonderful — ${names.join(', ')} ${ids.length > 1 ? 'are' : 'is'} among the services we offer. `
    : `رائع، فهذه من الخدمات التي نقدّمها: ${names.join('، ')}. `;
}

function recap(state: ChatState, lang: ChatLang): string {
  const d = state.discovery;
  const L = S[lang].labels;
  const parts: string[] = [];
  const fieldId = d.field ? kb('en').entries.find((e) => e.id.startsWith('ind-') && e.answer.startsWith(`${d.field} —`))?.id : undefined;
  if (d.field) parts.push(`${L.field}: ${fieldId ? titleIn(fieldId, lang) : d.field}`);
  if (d.services.length) parts.push(`${L.services}: ${d.services.map((id) => titleIn(id, lang)).join(lang === 'ar' ? '، ' : ', ')}`);
  if (d.platforms.length) parts.push(`${L.platforms}: ${d.platforms.join(lang === 'ar' ? '، ' : ', ')}`);
  if (d.location) parts.push(`${L.location}: ${lang === 'ar' ? (AR_PLACES[d.location] ?? d.location) : d.location}`);
  if (d.approach) parts.push(`${L.approach}: ${L.approachV[d.approach]}`);
  return parts.length ? `${S[lang].recap}${parts.join(lang === 'ar' ? '؛ ' : '; ')}.` : '';
}

function absorbFacts(state: ChatState, text: string, q: string, entries: KbEntry[]) {
  const d = state.discovery;
  const before = JSON.stringify([d.field, d.services, d.platforms, d.location, d.approach]);
  const question = isQuestion(text);
  const facts = extractFacts(q);
  const hits = matchEntries(entries, q);
  const svc = hits.filter((h) => h.entry.id.startsWith('svc-') || h.entry.id.startsWith('group-')).map((h) => h.entry.id);
  // Social umbrella is redundant once a specific social service is known.
  const specific = svc.filter((s) => !s.startsWith('group-'));
  d.services = mergeUnique(d.services, specific.length ? specific : svc);
  if (facts.platforms.length) d.platforms = mergeUnique(d.platforms, facts.platforms);
  const ind = hits.find((h) => h.entry.id.startsWith('ind-'));
  if (ind && !d.field && (state.pending === 'field' || !question)) d.field = enTitle(ind.entry.id);
  if (facts.location && (state.pending === 'location' || !question)) d.location = facts.location;
  if (facts.approach && (state.pending === 'approach' || !question)) d.approach = facts.approach;
  const learned = before !== JSON.stringify([d.field, d.services, d.platforms, d.location, d.approach]);
  return { hits, newServices: specific.length ? specific : svc, learned };
}

/** Does this message plausibly answer the question we asked? */
function fitsPending(p: QKey, raw: string, q: string, hits: ReturnType<typeof matchEntries>): boolean {
  const f = extractFacts(q);
  const words = wordCount(raw);
  const hasService = hits.some((h) => h.entry.id.startsWith('svc-') || h.entry.id.startsWith('group-'));
  switch (p) {
    case 'location':
      return Boolean(f.location) || (words <= 3 && hits.length === 0);
    case 'field':
      return hits.some((h) => h.entry.id.startsWith('ind-')) || (words <= 6 && !hasService);
    case 'plat':
      return f.platforms.length > 0 || (words <= 4 && hits.length === 0);
    case 'approach':
      return Boolean(f.approach);
    case 'need':
      return hasService || words <= 12;
    default:
      return words <= 40 && !(f.location && words <= 3);
  }
}

/** The visitor answered the question we had asked: store the answer (parsed or verbatim). */
function absorbAnswer(state: ChatState, raw: string, hits: ReturnType<typeof matchEntries>) {
  const d = state.discovery;
  const p = state.pending;
  const q = normalize(raw);
  const f = extractFacts(q);
  const note = raw.trim().slice(0, 220);
  switch (p) {
    case 'field': {
      const ind = hits.find((h) => h.entry.id.startsWith('ind-'));
      if (!d.field) d.field = ind ? enTitle(ind.entry.id) : note;
      break;
    }
    case 'need':
      if (d.services.length === 0) d.notes.push(note);
      break;
    case 'plat':
      if (!f.platforms.length) d.details.plat = note;
      break;
    case 'location':
      if (!d.location) d.location = f.location ?? note;
      break;
    case 'approach':
      if (!d.approach) d.notes.push(note);
      break;
    case 'mgmt':
    case 'projtype':
    case 'aidetail':
    case 'webdetail':
      d.details[p] = note;
      break;
    default:
  }
  state.pending = null;
}

function leadFrom(state: ChatState): Lead {
  return {
    name: state.lead.name ?? state.name,
    mobile: state.lead.mobile ?? state.contact?.mobile,
    phone: state.lead.phone ?? state.contact?.phone,
    topic: state.lastQuestion,
    voiceUrl: state.voiceUrl,
    discovery: state.discovery,
    lang: state.lang,
  };
}

/** Called when the panel is closed / page left: sends whatever has been collected (once). */
export function finalizeLead(prev: ChatState): { state: ChatState; lead: Lead | null } {
  const state = { ...prev, lead: { ...prev.lead } };
  if (state.reported || !state.lead.mobile) return { state, lead: null };
  const lead = leadFrom(state);
  state.reported = true;
  state.contact = { mobile: lead.mobile, phone: lead.phone };
  state.mode = 'idle';
  state.lead = {};
  return { state, lead };
}

/* ── Main turn ───────────────────────────────────────────────────────────── */

export function respond(prev: ChatState, input: string): TurnResult {
  const text = input.trim();
  const script = detectScript(text);
  const state: ChatState = { ...prev, discovery: { ...prev.discovery, details: { ...prev.discovery.details }, notes: [...prev.discovery.notes] }, asked: { ...prev.asked }, lead: { ...prev.lead }, turn: prev.turn + 1 };

  if (script === 'other') {
    return { state, reply: { text: S.en.otherLang, extra: [S.ar.otherLang] } };
  }
  const lang: ChatLang = script ?? prev.lang;
  state.lang = lang;
  const t = S[lang];
  const q = normalize(text);
  const entries = kb(lang).entries;
  const question = isQuestion(text);

  // ── Confirming a guessed name ("Is your name Sam?") ──────────────────────
  if (state.mode === 'confirmName' && state.nameGuess) {
    if (has(q, YES) && !question) {
      state.name = state.nameGuess;
      state.lead.name = state.name;
      state.nameGuess = undefined;
      state.mode = 'idle';
      return { state, reply: { text: t.niceToMeet(state.name) + steer(state, lang, true) } };
    }
    if (has(q, NO) && !question) {
      state.nameGuess = undefined;
      state.mode = 'idle';
      state.pending = 'name';
      return { state, reply: { text: t.nameNo } };
    }
    state.mode = 'idle';
    state.nameGuess = undefined;
  }

  // ── Contact collection ───────────────────────────────────────────────────
  if (state.mode === 'leadName') {
    const n = extractName(text);
    if (n && !question) {
      state.name = n;
      state.lead.name = n;
      state.mode = 'leadMobile';
      state.pending = 'contact';
      return { state, reply: { text: `${t.niceToMeet(n)}${t.contactAsk}${t.askMobileShort}` } };
    }
    if (has(q, NO) && !question) {
      state.mode = 'idle';
      state.pending = null;
      state.asked.contact = 9;
      return { state, reply: { text: t.declineContact + t.anythingElse } };
    }
    state.mode = 'idle';
  } else if (state.mode === 'leadMobile' || state.mode === 'leadPhone') {
    const num = westernDigits(text);
    if (hasDigits(text) && wordCount(text) <= 8) {
      if (!isMobile(num)) return { state, reply: { text: t.badMobile } };
      if (state.mode === 'leadMobile') {
        state.lead.mobile = num.trim();
        state.mode = 'leadPhone';
        return { state, reply: { text: t.askPhone } };
      }
      state.lead.phone = num.trim();
    } else if (state.mode === 'leadPhone' && has(q, ['لا يوجد', 'ما عندي', 'لا', 'none', 'no', 'nope', 'same', 'نفسه', 'نفس الرقم', 'ما في'])) {
      /* no second number */
    } else if (has(q, NO) && !question) {
      // Declined to leave a number now. If we already have the mobile, keep it and finish.
      if (state.lead.mobile) {
        /* fall through to completion below */
      } else {
        state.mode = 'idle';
        state.pending = null;
        state.asked.contact = 9;
        return { state, reply: { text: t.declineContact + t.anythingElse } };
      }
    } else {
      // Not a number. One bare word is taken as a name correction ("Sam"); facts and questions are
      // handled as normal conversation; anything else gets a gentle reminder.
      const probe = matchEntries(entries, q);
      const facts = extractFacts(q);
      const gaveFacts = probe.length > 0 || facts.platforms.length > 0 || Boolean(facts.location) || Boolean(facts.approach);
      const n = explicitName(text) ?? (!question && !gaveFacts && wordCount(text) === 1 ? extractName(text, true) : null);
      if (n && n !== state.name) {
        state.name = n;
        state.lead.name = n;
        return { state, reply: { text: t.niceToMeet(n) + (state.mode === 'leadMobile' ? t.didntCatchMobile : t.askPhone) } };
      }
      if (!question && !gaveFacts) {
        return { state, reply: { text: state.mode === 'leadMobile' ? t.didntCatchMobile : t.askPhone } };
      }
      state.mode = 'idle'; // carry on with the conversation below; contact is asked again later at most once
      state.pending = null;
    }
    if (state.mode === 'leadMobile' || state.mode === 'leadPhone') {
      const lead = leadFrom(state);
      state.reported = true;
      state.contact = { mobile: lead.mobile, phone: lead.phone };
      state.mode = 'idle';
      state.pending = null;
      state.lead = {};
      state.voiceUrl = undefined;
      const sum = recap(state, lang);
      return { state, reply: { text: t.done(lead.name ?? '') + (sum ? `${sum} ` : '') + t.anythingElse, submit: lead } };
    }
  }

  // ── A phone number volunteered without being asked ───────────────────────
  if (state.mode === 'idle' && hasDigits(text) && wordCount(text) <= 4 && isMobile(westernDigits(text)) && !state.reported) {
    state.lead.name = state.name;
    state.lead.mobile = westernDigits(text).trim();
    state.mode = 'leadPhone';
    state.pending = 'contact';
    return { state, reply: { text: `${lang === 'ar' ? 'شكراً لك، سجّلتُ رقمك. ' : 'Thank you, I have noted your number. '}${t.askPhone}` } };
  }

  // ── Greetings and small talk ─────────────────────────────────────────────
  const short = wordCount(text) <= 6;
  const needName = !state.name && (state.asked.name ?? 0) < 2;
  const askNameOrSteer = (first: boolean) => {
    if (needName) {
      state.asked.name = (state.asked.name ?? 0) + 1;
      state.askedName = true;
      state.pending = 'name';
      return t.askName;
    }
    return steer(state, lang, first);
  };

  if (short && has(q, SALAAM) && !has(q, ['خدمات', 'services'])) {
    return { state, reply: { text: S.ar.salaamBack + (needName ? (state.asked.name = (state.asked.name ?? 0) + 1, state.pending = 'name', S.ar.askName) : steer(state, 'ar', true)) } };
  }
  if (short && has(q, HOW_ARE_YOU)) {
    return { state, reply: { text: t.howAreYou + (needName ? t.hello.replace(/^[^!]*!\s*/, '') : '') + askNameOrSteer(true) } };
  }
  if (wordCount(text) <= 5 && has(q, GREETING) && !question) {
    if (state.name || state.turn > 3) {
      const again = lang === 'ar' ? `أهلاً بك مجدداً${state.name ? ` يا ${state.name}` : ''}! ` : `Hello again${state.name ? `, ${state.name}` : ''}! `;
      return { state, reply: { text: again + askNameOrSteer(true) } };
    }
    return { state, reply: { text: t.hello + askNameOrSteer(true) } };
  }
  // ── Visitor says they are done / not interested in more questions ────────
  if (short && has(q, DONE) && state.pending && state.pending !== 'contact') {
    state.pending = null;
    for (const k of ['field', 'need', 'plat', 'mgmt', 'projtype', 'aidetail', 'webdetail', 'location', 'approach']) state.asked[k] = 9;
    const s = steer(state, lang, true);
    return { state, reply: { text: (s ? '' : t.anythingElse) + s } };
  }

  if (short && has(q, THANKS) && !question) {
    return { state, reply: { text: t.thanks + t.anythingElse } };
  }
  if (short && has(q, BYE) && !question) {
    return { state, reply: { text: t.bye } };
  }
  if (has(q, IDENTITY)) {
    return { state, reply: { text: t.identity + (needName ? ` ${t.askName}` : '') } };
  }

  // ── Talk to the team ─────────────────────────────────────────────────────
  if (has(q, TEAM)) {
    for (const k of ['field', 'need', 'plat', 'mgmt', 'projtype', 'aidetail', 'webdetail', 'location', 'approach']) state.asked[k] = Math.max(state.asked[k] ?? 0, 1);
    state.asked.contact = Math.min(state.asked.contact ?? 0, 1);
    const s = steer(state, lang, true, 'contact');
    return { state, reply: { text: t.teamAsk + s } };
  }

  // ── Naming: answer to our "what is your name?" ───────────────────────────
  if (state.pending === 'name' && !state.name) {
    const n = extractName(text);
    const hit = matchEntries(entries, q)[0];
    if (n && !question && !hit) {
      state.name = n;
      state.lead.name = n;
      state.pending = null;
      return { state, reply: { text: t.niceToMeet(n) + steer(state, lang, true) } };
    }
  }

  // ── Facts the visitor gave us (whatever the question was) ────────────────
  const { hits, newServices, learned } = absorbFacts(state, text, q, entries);
  const top = hits[0]?.entry;
  const wantsServices = has(q, LIST_SERVICES);
  const wantsIndustries = has(q, LIST_INDUSTRIES);

  // ── Policy: prices and personal questions ────────────────────────────────
  if (has(q, PRICE)) {
    state.lastQuestion = text;
    const s = steer(state, lang);
    return { state, reply: { text: t.price + s } };
  }
  if (has(q, PERSONAL)) {
    state.lastQuestion = text;
    const s = steer(state, lang);
    return { state, reply: { text: t.privacy + s } };
  }

  // ── The visitor answered the question we asked ───────────────────────────
  const INFO = ['clients', 'contact', 'instagram', 'location', 'about', 'vision', 'experience', 'process', 'whyus', 'portfolio', 'languages'];
  const factAnswer = Boolean(extractFacts(q).location) && wordCount(text) <= 3 && !question;
  const asksInfo = Boolean(top && INFO.includes(top.id)) && !factAnswer;
  const answeringPending = state.pending && state.pending !== 'name' && state.pending !== 'contact' && !question && !asksInfo;
  if (answeringPending) {
    if (fitsPending(state.pending as QKey, text, q, hits)) absorbAnswer(state, text, hits);
    else {
      if (!learned) state.discovery.notes.push(text.slice(0, 220));
      state.pending = null;
    }
    const s = steer(state, lang);
    return { state, reply: { text: ackText(state, newServices, lang) + (s || `${recap(state, lang)} ${t.anythingElse}`.trim()) } };
  }

  // ── The visitor volunteered facts (sector, platform, location…) without being asked ──
  if (!question && learned && (!top || !INFO.includes(top.id)) && !asksInfo && !wantsServices) {
    state.pending = null;
    const s = steer(state, lang);
    return { state, reply: { text: ackText(state, newServices, lang) + (s || `${recap(state, lang)} ${t.anythingElse}`.trim()) } };
  }

  // ── Knowledge answers ────────────────────────────────────────────────────
  if (top && !(wantsServices && top.id.startsWith('group'))) {
    state.pending = state.pending === 'name' ? 'name' : state.pending;
    const s = steer(state, lang);
    return { state, reply: { text: `${top.answer}${s ? `\n\n${s}` : `\n\n${t.anythingElse}`}`, page: top.page } };
  }
  if (wantsServices) {
    const s = steer(state, lang);
    return { state, reply: { text: `${t.listServices}${kb(lang).services.join('\n')}\n\n${t.askAboutService}${s ? `\n\n${s}` : ''}`, page: '/services' } };
  }
  if (wantsIndustries) {
    const s = steer(state, lang);
    return { state, reply: { text: `${t.listIndustries}${kb(lang).industries.join('\n')}\n\n${t.askAboutIndustry}${s ? `\n\n${s}` : ''}`, page: '/industries' } };
  }

  // ── Unprompted short text that looks like a name: ask to confirm it ──────
  if (!state.name && !question && wordCount(text) <= 2 && !hasDigits(text)) {
    const n = extractName(text, true);
    if (n) {
      state.nameGuess = n;
      state.mode = 'confirmName';
      return { state, reply: { text: t.nameGuess(n) } };
    }
  }

  // ── Unknown: say so, then take the visitor's details for the team ────────
  state.lastQuestion = text;
  state.asked.contact = Math.min(state.asked.contact ?? 0, 1);
  const s = state.reported || state.mode !== 'idle' ? '' : steer(state, lang, true, 'contact', true);
  return { state, reply: { text: t.unknown + (s || t.anythingElse) } };
}

export function onVoiceSent(prev: ChatState, url: string | null, lang: ChatLang): TurnResult {
  const t = S[lang];
  const state: ChatState = { ...prev, lang, discovery: { ...prev.discovery }, asked: { ...prev.asked }, lead: { ...prev.lead } };
  if (!url) return { state, reply: { text: t.voiceFail } };
  state.voiceUrl = url;
  state.lastQuestion = lang === 'ar' ? 'رسالة صوتية من الزائر' : 'Voice message from the visitor';
  if (state.name && state.contact?.mobile) {
    const lead = leadFrom(state);
    state.voiceUrl = undefined;
    return { state, reply: { text: t.voiceGot + t.done(state.name) + t.anythingElse, submit: lead } };
  }
  state.asked.contact = Math.min(state.asked.contact ?? 0, 1);
  const s = steer(state, lang, true, 'contact', true);
  return { state, reply: { text: t.voiceGot + s } };
}

export function greeting(lang: ChatLang): BotReply {
  return { text: S[lang].greetFirst };
}

/** Used by the widget to start a conversation: marks that the bot asked for the name. */
export function greetedState(lang: ChatLang): ChatState {
  return { ...initialState(lang), askedName: true, pending: 'name', asked: { name: 1 } };
}

export { hasPhrase };
