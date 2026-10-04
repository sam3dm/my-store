/**
 * Conversation engine for "Metropolitan Chatbot".
 *
 * Deterministic and fully local: it answers only from the website content (see knowledge.ts),
 * never quotes prices, never talks about individuals, and for anything else politely says it
 * does not know and collects the visitor's name and phone numbers so the team can follow up.
 */
import { buildKnowledge, type KbEntry } from './knowledge';
import { detectLang, hasPhrase, normalize, wordCount, type ChatLang } from './text';

export type Mode = 'idle' | 'leadName' | 'leadMobile' | 'leadPhone';

export interface Lead {
  name?: string;
  mobile?: string;
  phone?: string;
  topic?: string;
  voiceUrl?: string;
}

export interface ChatState {
  lang: ChatLang;
  name?: string;
  mode: Mode;
  askedName: boolean;
  awaitingConsent?: boolean;
  /** Contact numbers already given, so a later voice message does not ask again. */
  contact?: { mobile?: string; phone?: string };
  lead: Lead;
  lastQuestion?: string;
  voiceUrl?: string;
}

export interface BotReply {
  text: string;
  /** Page the visitor can open for more detail (path without language prefix). */
  page?: string;
  /** Quick-reply suggestions. */
  chips?: string[];
  /** Set when the lead is complete and should be sent to the team. */
  submit?: Lead;
}

export function initialState(lang: ChatLang): ChatState {
  return { lang, mode: 'idle', askedName: false, lead: {} };
}

const S = {
  ar: {
    greetFirst:
      'السلام عليكم ورحمة الله وبركاته، أنا «متروبوليتان تشات بوت»، المساعد الافتراضي لشركة متروبوليتان ديجيتال ماركتينج في دبي. يسعدني التعرّف عليك، فما اسمك الكريم؟ وكيف يمكنني مساعدتك اليوم؟',
    salaamBack: 'وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً بك! أنا «متروبوليتان تشات بوت»، المساعد الافتراضي لمتروبوليتان ديجيتال ماركتينج. ',
    hello: 'مرحباً بك! أنا «متروبوليتان تشات بوت»، المساعد الافتراضي لمتروبوليتان ديجيتال ماركتينج. ',
    askName: 'يسعدني أن أتعرّف عليك، ما هو اسمك الكريم؟',
    howAreYou: 'بخير والحمد لله، شكراً لسؤالك الكريم! ',
    niceToMeet: (n: string) => `تشرّفنا بك يا ${n}! `,
    helpQ: 'كيف يمكنني مساعدتك؟ يمكنك أن تسألني عن خدماتنا، أو القطاعات التي نعمل معها، أو أعمالنا، أو طرق التواصل معنا.',
    anythingElse: 'هل لديك سؤال آخر أو استفسار عن شركتنا أو أعمالنا أو الخدمات التي نقدّمها؟',
    thanks: 'العفو، هذا من دواعي سروري! ',
    bye: 'شكراً لتواصلك مع متروبوليتان ديجيتال ماركتينج، ويسعدنا خدمتك في أي وقت. إلى اللقاء!',
    identity: 'أنا «متروبوليتان تشات بوت»، المساعد الافتراضي لشركة متروبوليتان ديجيتال ماركتينج، استوديو للإنتاج الإبداعي في دبي. أجيب عن الأسئلة المتعلقة بخدماتنا وأعمالنا وطرق التواصل معنا.',
    listServices: 'تقدّم متروبوليتان ديجيتال ماركتينج الخدمات التالية:\n',
    listIndustries: 'نعمل مع القطاعات التالية:\n',
    price:
      'أشكرك على اهتمامك. لا أملك تفاصيل الأسعار، فالتكلفة تختلف بحسب طبيعة كل مشروع ونطاقه، وسيقوم فريقنا بتجهيز عرض مناسب لك. ',
    unknown:
      'شكراً على سؤالك. لا علم لي بهذه المعلومة، فهي ليست ضمن المعلومات المتوفرة على موقعنا. ',
    handoff: 'سيتواصل معك فريق العمل في أقرب وقت ممكن. هل تودّ أن أسجّل بياناتك؟',
    leadIntro: 'بكل سرور! ',
    askLeadName: 'ما هو اسمك الكريم؟',
    askMobile: (n: string) => `شكراً يا ${n}. ما هو رقم جوالك (يفضّل أن يكون عليه واتساب)؟`,
    askMobileNoName: 'ما هو رقم جوالك (يفضّل أن يكون عليه واتساب)؟',
    askPhone: 'وما هو رقم هاتفك الآخر للتواصل؟ إن لم يكن لديك رقم آخر فاكتب «لا يوجد».',
    badMobile: 'يبدو أن الرقم غير مكتمل، هل تتفضّل بكتابته مع رمز الدولة؟ مثال: 971501234567+',
    done: (n: string) => `شكراً جزيلاً يا ${n}، تم تسجيل بياناتك بنجاح. سيتواصل معك فريق متروبوليتان ديجيتال ماركتينج في أقرب وقت ممكن. `,
    declineLead: 'لا بأس إطلاقاً. وإن رغبت في أي وقت فيمكنك التواصل معنا مباشرة عبر واتساب أو صفحة «تواصل معنا». ',
    voiceGot:
      'وصلتني رسالتك الصوتية، شكراً لك. أنا مساعد كتابي ولا أستطيع سماع الرسائل الصوتية، لكنني سأحوّلها إلى فريقنا ليستمع إليها ويردّ عليك. ',
    voiceFail: 'عذراً، تعذّر إرسال الرسالة الصوتية. يمكنك كتابة رسالتك أو التواصل معنا عبر واتساب.',
    privacy: 'أعتذر، لا أستطيع الحديث عن معلومات شخصية. ',
    chips: ['خدماتنا', 'القطاعات', 'أعمالنا', 'طرق التواصل', 'التحدث مع الفريق'],
    sorryLang: '',
  },
  en: {
    greetFirst:
      "Hello and welcome! I'm Metropolitan Chatbot, the virtual assistant of Metropolitan Digital Marketing in Dubai. It's a pleasure to meet you — may I know your name, and how can I help you today?",
    salaamBack: 'Wa alaykum assalam, and a warm welcome! I\'m Metropolitan Chatbot, the virtual assistant of Metropolitan Digital Marketing. ',
    hello: "Hello, and welcome! I'm Metropolitan Chatbot, the virtual assistant of Metropolitan Digital Marketing. ",
    askName: "I'd love to get to know you — may I have your name, please?",
    howAreYou: "I'm doing very well, thank you for asking! ",
    niceToMeet: (n: string) => `Lovely to meet you, ${n}! `,
    helpQ: 'How may I help you? You can ask me about our services, the industries we work with, our work, or how to contact us.',
    anythingElse: 'Do you have another question about our company, our work or the services we offer?',
    thanks: "You're most welcome, it's my pleasure! ",
    bye: 'Thank you for contacting Metropolitan Digital Marketing — we would be glad to help you at any time. Goodbye!',
    identity:
      "I'm Metropolitan Chatbot, the virtual assistant of Metropolitan Digital Marketing, a creative production studio in Dubai. I can answer questions about our services, our work and how to reach us.",
    listServices: 'Metropolitan Digital Marketing offers the following services:\n',
    listIndustries: 'We work with the following industries:\n',
    price:
      "Thank you for your interest. I don't have pricing details, as the cost depends on the nature and scope of each project, and our team will prepare a suitable proposal for you. ",
    unknown:
      "Thank you for your question. I'm afraid I don't have that information, as it isn't part of what is published on our website. ",
    handoff: 'Our team will get in touch with you as soon as possible. Would you like me to take your details?',
    leadIntro: 'With pleasure! ',
    askLeadName: 'May I have your name, please?',
    askMobile: (n: string) => `Thank you, ${n}. What is your mobile number (preferably with WhatsApp)?`,
    askMobileNoName: 'What is your mobile number (preferably with WhatsApp)?',
    askPhone: 'And do you have another phone number we can reach you on? If not, just type "none".',
    badMobile: 'That number looks incomplete — could you please type it with the country code? For example: +971501234567',
    done: (n: string) => `Thank you very much, ${n} — your details have been recorded. The Metropolitan Digital Marketing team will contact you as soon as possible. `,
    declineLead: 'Not a problem at all. Whenever you wish, you can reach us directly on WhatsApp or via the Contact page. ',
    voiceGot:
      "I've received your voice message, thank you. I'm a text assistant and can't listen to voice notes, but I'll pass it to our team so they can listen and get back to you. ",
    voiceFail: "Sorry, your voice message couldn't be sent. You can type your message or reach us on WhatsApp.",
    privacy: "I'm sorry, I'm not able to discuss personal information. ",
    chips: ['Our services', 'Industries', 'Our work', 'Contact details', 'Talk to the team'],
    sorryLang: '',
  },
} as const;

const GREETING = ['مرحبا', 'اهلا', 'هلا', 'هلو', 'السلام عليكم', 'سلام', 'صباح الخير', 'مساء الخير', 'hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'greetings'];
const SALAAM = ['السلام عليكم', 'سلام عليكم', 'السلام', 'assalam', 'salam', 'peace be upon'];
const HOW_ARE_YOU = ['كيف حالك', 'كيفك', 'شلونك', 'اخبارك', 'how are you', "how's it going", 'how do you do'];
const THANKS = ['شكرا', 'يعطيك العافيه', 'مشكور', 'thanks', 'thank you', 'thx'];
const BYE = ['مع السلامه', 'الي اللقاء', 'باي', 'bye', 'goodbye', 'see you'];
const IDENTITY = ['من انت', 'ما اسمك', 'شو اسمك', 'what is your name', 'who are you', 'your name', 'are you a bot', 'هل انت روبوت', 'هل انت بوت'];
const PRICE = ['سعر', 'اسعار', 'تكلفه', 'تكاليف', 'كم يكلف', 'كم التكلفه', 'كم السعر', 'بكم', 'ميزانيه', 'عرض سعر', 'price', 'prices', 'pricing', 'cost', 'costs', 'how much', 'quote', 'quotation', 'budget', 'rate', 'fee', 'fees', 'package', 'packages', 'باقات', 'باقه'];
const PERSONAL = ['مؤسس', 'اسس', 'مالك', 'صاحب الشركه', 'المدير', 'مدير', 'رئيس', 'موظف', 'موظفين', 'راتب', 'عمر', 'ديانه', 'owner', 'founder', 'founded', 'who owns', 'who started', 'ceo', 'manager', 'employee', 'staff', 'salary', 'married', 'age', 'personal', 'home address', 'مين صاحب', 'من يملك'];
const TEAM = ['talk to the team', 'speak to someone', 'human', 'agent', 'representative', 'call me', 'contact me', 'تحدث مع الفريق', 'التحدث مع الفريق', 'اتصلوا بي', 'تواصلوا معي', 'اريد التحدث', 'موظف خدمه', 'بشري', 'ممثل'];
const LIST_SERVICES = ['services', 'service', 'what do you offer', 'what do you do', 'what you do', 'offer', 'خدمات', 'خدماتكم', 'خدماتنا', 'ماذا تقدمون', 'ماذا تقدم', 'شو تقدمون', 'شو الخدمات', 'ماذا تفعلون', 'شو شغلكم', 'ما هي خدماتكم', 'ايش تقدمون'];
const LIST_INDUSTRIES = ['industries', 'industry', 'sectors', 'sector', 'who do you work with', 'clients', 'قطاعات', 'القطاعات', 'مجالات', 'من تخدمون', 'لمن تقدمون', 'عملاءكم'];
const YES = ['نعم', 'ايوه', 'ايه', 'اجل', 'تمام', 'اكيد', 'طبعا', 'بالتاكيد', 'yes', 'yeah', 'sure', 'ok', 'okay', 'please', 'yep', 'of course'];
const NO = ['لا', 'كلا', 'لا شكرا', 'لا اريد', 'no', 'nope', 'no thanks', 'not now', 'later'];

const has = (q: string, list: string[]) => list.some((p) => hasPhrase(q, p));

let kbCache: Partial<Record<ChatLang, ReturnType<typeof buildKnowledge>>> = {};
function kb(lang: ChatLang) {
  return (kbCache[lang] ??= buildKnowledge(lang));
}
export function resetKnowledgeCache() {
  kbCache = {};
}

function score(q: string, entry: KbEntry): number {
  let best = 0;
  for (const key of entry.keys) {
    const nk = normalize(key);
    if (nk && hasPhrase(q, key)) {
      const words = nk.split(' ').length;
      best = Math.max(best, words * 3 + Math.min(nk.length, 20) / 20);
    }
  }
  return best;
}

function findAnswer(q: string, lang: ChatLang): KbEntry | null {
  let top: KbEntry | null = null;
  let topScore = 0;
  for (const e of kb(lang).entries) {
    const sc = score(q, e);
    if (sc > topScore) {
      topScore = sc;
      top = e;
    }
  }
  return topScore >= 3 ? top : null;
}

function extractName(raw: string): string | null {
  const text = raw.trim().replace(/[.!؟?،,]+$/g, '');
  const patterns = [
    /(?:اسمي|انا اسمي|أنا اسمي|معك|انا|أنا)\s+([\p{L}][\p{L}\s]{1,30})$/u,
    /(?:my name is|i am|i'm|this is|name'?s)\s+([\p{L}][\p{L}\s]{1,30})$/iu,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && wordCount(m[1]) <= 3) return cleanName(m[1]);
  }
  if (wordCount(text) <= 3 && /^[\p{L}\s.'-]{2,30}$/u.test(text)) return cleanName(text);
  return null;
}

function cleanName(n: string) {
  return n
    .trim()
    .split(/\s+/)
    .map((w) => (/[a-z]/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function isMobile(s: string) {
  return s.replace(/[^\d]/g, '').length >= 7 && /^[+\d\s()\-.٠-٩]+$/.test(s.trim());
}

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function westernDigits(s: string) {
  return s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

const chipsFor = (lang: ChatLang) => [...S[lang].chips];

export interface TurnResult {
  state: ChatState;
  reply: BotReply;
}

export function respond(prev: ChatState, input: string): TurnResult {
  const text = input.trim();
  const msgLang = detectLang(text);
  const lang: ChatLang = msgLang ?? prev.lang;
  const t = S[lang];
  const state: ChatState = { ...prev, lang, lead: { ...prev.lead } };
  const q = normalize(text);

  // ── Lead capture flow ────────────────────────────────────────────────────
  // A visitor who asks something else mid-way is never trapped: the flow is dropped and the
  // question answered normally (their name, if given, is kept).
  if (state.mode === 'leadMobile' || state.mode === 'leadPhone') {
    if (!/\d/.test(westernDigits(text)) && !has(q, ['لا يوجد', 'ما عندي', 'none', 'same', 'نفسه', 'نفس الرقم', 'لا', 'no', 'nope'])) {
      state.mode = 'idle';
    }
  } else if (state.mode === 'leadName' && !extractName(text) && !has(q, NO)) {
    state.mode = 'idle';
  }
  if (state.mode !== 'idle') {
    if (has(q, NO) && wordCount(text) <= 3 && state.mode === 'leadName') {
      state.mode = 'idle';
      return { state, reply: { text: t.declineLead + t.anythingElse, chips: chipsFor(lang) } };
    }
    if (state.mode === 'leadName') {
      const n = extractName(text);
      if (!n) return { state, reply: { text: t.askLeadName } };
      state.name = n;
      state.lead.name = n;
      state.mode = 'leadMobile';
      return { state, reply: { text: t.askMobile(n) } };
    }
    if (state.mode === 'leadMobile') {
      const num = westernDigits(text);
      if (!isMobile(num)) return { state, reply: { text: t.badMobile } };
      state.lead.mobile = num.trim();
      state.mode = 'leadPhone';
      return { state, reply: { text: t.askPhone } };
    }
    if (state.mode === 'leadPhone') {
      const num = westernDigits(text);
      const none = has(q, ['لا يوجد', 'ما عندي', 'لا', 'none', 'no', 'nope', 'same', 'نفسه', 'نفس الرقم']);
      if (!none) {
        if (!isMobile(num)) return { state, reply: { text: t.badMobile } };
        state.lead.phone = num.trim();
      }
      state.mode = 'idle';
      const lead: Lead = { ...state.lead, topic: state.lastQuestion, voiceUrl: state.voiceUrl };
      state.contact = { mobile: lead.mobile, phone: lead.phone };
      state.lead = {};
      state.voiceUrl = undefined;
      return {
        state,
        reply: { text: t.done(lead.name ?? state.name ?? (lang === 'ar' ? 'عزيزي العميل' : 'dear customer')) + t.anythingElse, submit: lead, chips: chipsFor(lang) },
      };
    }
  }

  // ── Greetings / small talk ───────────────────────────────────────────────
  if (wordCount(text) <= 6 && has(q, SALAAM) && !has(q, ['خدمات', 'services'])) {
    const askName = !state.name && !state.askedName;
    state.askedName = true;
    return { state, reply: { text: S.ar.salaamBack + (askName ? S.ar.askName : S.ar.helpQ), chips: chipsFor('ar') } };
  }
  if (wordCount(text) <= 6 && has(q, HOW_ARE_YOU)) {
    const askName = !state.name && !state.askedName;
    state.askedName = true;
    return { state, reply: { text: t.howAreYou + (askName ? S[lang].hello + t.askName : t.helpQ), chips: chipsFor(lang) } };
  }
  if (wordCount(text) <= 5 && has(q, GREETING)) {
    const askName = !state.name && !state.askedName;
    state.askedName = true;
    const who = lang === 'ar' ? 'مرحباً بك! كيف حالك؟ ' : 'Hello! I hope you are well. ';
    return { state, reply: { text: who + t.hello.replace(/^[^!]*!\s*/, '') + (askName ? t.askName : t.helpQ), chips: chipsFor(lang) } };
  }
  if (wordCount(text) <= 6 && has(q, THANKS)) {
    return { state, reply: { text: t.thanks + t.anythingElse, chips: chipsFor(lang) } };
  }
  if (wordCount(text) <= 6 && has(q, BYE)) {
    return { state, reply: { text: t.bye } };
  }
  if (has(q, IDENTITY)) {
    return { state, reply: { text: t.identity + ' ' + t.helpQ, chips: chipsFor(lang) } };
  }

  // ── Talk to the team ─────────────────────────────────────────────────────
  if (has(q, TEAM)) {
    return startLead(state, t);
  }

  // ── Policy: prices and personal information ──────────────────────────────
  if (has(q, PRICE)) {
    state.lastQuestion = text;
    state.awaitingConsent = true;
    return { state, reply: { text: t.price + t.handoff, chips: consentChips(lang) } };
  }
  if (has(q, PERSONAL)) {
    state.lastQuestion = text;
    state.awaitingConsent = true;
    return { state, reply: { text: t.privacy + t.handoff, chips: consentChips(lang) } };
  }

  // ── Consent to lead capture ("yes" after handoff question) ───────────────
  if (state.awaitingConsent && (has(q, YES) || /(سجل|take my details|register)/.test(q))) {
    return startLead(state, t);
  }
  if (state.awaitingConsent && has(q, NO)) {
    state.awaitingConsent = false;
    return { state, reply: { text: t.declineLead + t.anythingElse, chips: chipsFor(lang) } };
  }

  // ── Knowledge ────────────────────────────────────────────────────────────
  const hit = findAnswer(q, lang);
  const wantsServices = has(q, LIST_SERVICES);
  const wantsIndustries = has(q, LIST_INDUSTRIES);

  if (hit && !(wantsServices && hit.id.startsWith('group'))) {
    // A specific topic beats a generic "list" intent.
    state.awaitingConsent = false;
    return { state, reply: { text: `${hit.answer}\n\n${t.anythingElse}`, page: hit.page, chips: chipsFor(lang) } };
  }
  if (wantsServices) {
    return { state, reply: { text: t.listServices + kb(lang).services.join('\n') + `\n\n${lang === 'ar' ? 'اسألني عن أي خدمة لأشرحها لك بالتفصيل.' : 'Ask me about any service and I will explain it in detail.'}`, page: '/services', chips: chipsFor(lang) } };
  }
  if (wantsIndustries) {
    return { state, reply: { text: t.listIndustries + kb(lang).industries.join('\n') + `\n\n${lang === 'ar' ? 'اسألني عن أي قطاع لأوضّح لك ما نقدّمه له.' : 'Ask me about any sector and I will tell you what we offer it.'}`, page: '/industries', chips: chipsFor(lang) } };
  }

  // ── Name capture (right after the bot asked for it) ──────────────────────
  if (state.askedName && !state.name) {
    const n = extractName(text);
    if (n) {
      state.name = n;
      return { state, reply: { text: t.niceToMeet(n) + t.helpQ, chips: chipsFor(lang) } };
    }
  }

  // ── Unknown ──────────────────────────────────────────────────────────────
  state.lastQuestion = text;
  state.awaitingConsent = true;
  return { state, reply: { text: t.unknown + t.handoff, chips: consentChips(lang) } };
}

function consentChips(lang: ChatLang) {
  return lang === 'ar' ? ['نعم، سجّل بياناتي', 'لا شكراً'] : ['Yes, take my details', 'No, thanks'];
}

function startLead(state: ChatState, t: (typeof S)['ar'] | (typeof S)['en']): TurnResult {
  state.awaitingConsent = false;
  if (state.name) {
    state.lead.name = state.name;
    state.mode = 'leadMobile';
    return { state, reply: { text: t.leadIntro + t.askMobile(state.name) } };
  }
  state.mode = 'leadName';
  return { state, reply: { text: t.leadIntro + t.askLeadName } };
}

export function onVoiceSent(prev: ChatState, url: string | null, lang: ChatLang): TurnResult {
  const t = S[lang];
  const state: ChatState = { ...prev, lang, lead: { ...prev.lead } };
  if (!url) return { state, reply: { text: t.voiceFail } };
  state.voiceUrl = url;
  state.lastQuestion = lang === 'ar' ? 'رسالة صوتية من الزائر' : 'Voice message from the visitor';
  state.awaitingConsent = false;
  if (state.name && state.contact?.mobile) {
    const lead: Lead = { name: state.name, mobile: state.contact.mobile, phone: state.contact.phone, topic: state.lastQuestion, voiceUrl: url };
    state.voiceUrl = undefined;
    return { state, reply: { text: t.voiceGot + t.done(state.name) + t.anythingElse, submit: lead, chips: chipsFor(lang) } };
  }
  return startLeadAfterVoice(state, t, lang);
}

function startLeadAfterVoice(state: ChatState, t: (typeof S)['ar'] | (typeof S)['en'], lang: ChatLang): TurnResult {
  if (state.name) {
    state.lead.name = state.name;
    state.mode = 'leadMobile';
    return { state, reply: { text: t.voiceGot + t.askMobile(state.name) } };
  }
  state.mode = 'leadName';
  return { state, reply: { text: t.voiceGot + t.askLeadName } };
}

export function greeting(lang: ChatLang): BotReply {
  return { text: S[lang].greetFirst, chips: chipsFor(lang) };
}

/** Map a quick-reply chip to the question it stands for. */
export function chipToQuestion(label: string): string {
  return label;
}
