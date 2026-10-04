/**
 * Knowledge base for the Metropolitan chatbot.
 *
 * Every answer is assembled from the website's own content (src/content/pages and the
 * Arabic translations), so the bot can only say what the site says. Prices, people and
 * anything the site does not state are deliberately absent.
 */
import { getLocalizedContent } from '../i18n/content';
import enLocale from '../../locales/en.json';
import arLocale from '../../locales/ar.json';
import type { ChatLang } from './text';

export interface KbEntry {
  id: string;
  /** Search phrases (EN + AR). Longer, more specific phrases win. */
  keys: string[];
  answer: string;
  /** Optional page path (without language prefix) the visitor can open for more detail. */
  page?: string;
}

/** Extra search phrases per service id, on top of the service title. */
const SERVICE_KEYS: Record<string, string[]> = {
  'svc-01': ['social media management', 'manage social media', 'manage my accounts', 'manage pages', 'community management', 'ادارة وسائل التواصل', 'ادارة حسابات', 'ادارة صفحات', 'ادارة السوشيال', 'ادارة المنشورات', 'ادارة الصفحات'],
  'svc-02': ['content creation', 'social media content', 'reels', 'shorts', 'صناعه محتوي', 'انتاج محتوي', 'محتوي السوشيال', 'ريلز'],
  'svc-03': ['video production', 'cinematic video', 'commercial film', 'tv commercial', 'brand film', 'corporate film', 'انتاج فيديو', 'فيديو سينمائي', 'تصوير فيديو', 'اعلان تلفزيوني', 'فيلم'],
  'svc-04': ['3d', 'cgi', 'animation', 'architectural visualization', 'رسوم متحركه', 'ثلاثي الابعاد', 'تحريك', 'تصميم ثلاثي'],
  'svc-05': ['vfx', 'visual effects', 'post production', 'editing', 'color grading', 'motion graphics', 'مؤثرات بصريه', 'مونتاج', 'تصحيح الوان', 'ما بعد الانتاج', 'موشن جرافيك'],
  'svc-06': ['ai creative', 'ai production', 'ai content', 'ai video', 'ai image', 'ذكاء اصطناعي ابداعي', 'محتوي بالذكاء الاصطناعي', 'انتاج بالذكاء الاصطناعي'],
  'svc-07': ['medical content', 'healthcare content', 'doctor video', 'patient education', 'محتوي طبي', 'فيديو طبي', 'محتوي صحي'],
  'svc-08': ['podcast', 'بودكاست', 'بودكاست'],
  'svc-09': ['commercial photography', 'product photography', 'photography', 'photoshoot', 'تصوير تجاري', 'تصوير منتجات', 'تصوير فوتوغرافي', 'تصوير'],
  'svc-10': ['branding', 'brand identity', 'logo', 'graphic design', 'visual identity', 'هويه بصريه', 'شعار', 'تصميم جرافيك', 'تصميم شعار', 'هويه تجاريه'],
  'svc-11': ['website', 'web site', 'website design', 'web design', 'landing page', 'design my website', 'موقع', 'موقعي', 'تصميم مواقع', 'تصميم موقع', 'صفحه هبوط'],
  'svc-12': ['digital marketing', 'online marketing', 'seo', 'lead generation', 'تسويق رقمي', 'تسويق الكتروني', 'تسويق اونلاين', 'حملات تسويقيه'],
  'svc-13': ['scriptwriting', 'script', 'storyboard', 'creative direction', 'كتابه سيناريو', 'سيناريو', 'ستوري بورد', 'ادارة ابداعيه'],
  'svc-14': ['voiceover', 'voice over', 'audio production', 'sound design', 'تعليق صوتي', 'انتاج صوتيات', 'تسجيل صوتي'],
  'svc-15': ['luxury advertising', 'luxury ads', 'اعلان فاخر', 'اعلانات فاخره', 'اعلانات راقيه'],
  'svc-16': ['content creator', 'creators', 'youtuber', 'صانع محتوي', 'صناع محتوي', 'يوتيوبر'],
  'svc-17': ['social media advertising', 'paid ads', 'social media ads', 'ad campaign', 'google ads', 'اعلانات ممولي', 'حملات اعلانيه', 'اعلان علي وسائل التواصل', 'اعلانات السوشيال', 'اعلانات مدفوعه'],
  'svc-18': ['influencer', 'celebrity marketing', 'celebrities', 'مؤثرين', 'مشاهير', 'تسويق مؤثرين', 'انفلونسر'],
  'svc-19': ['integrated advertising', 'integrated digital advertising', 'اعلان متكامل', 'اعلان رقمي متكامل'],
  'svc-20': ['ai website', 'web application', 'web app', 'website development', 'build website', 'develop website', 'بناء موقع', 'تطوير موقع', 'تطبيق ويب', 'تطبيقات ويب', 'تطبيق جوال', 'تطبيقات جوال', 'تطبيقات موبايل', 'mobile app', 'app development', 'موقع الكتروني', 'مواقع الكترونيه', 'موقع انترنت'],
  'svc-21': ['chatbot', 'chat bot', 'ai agent', 'business agent', 'virtual assistant', 'ai assistant', 'روبوت دردشه', 'شات بوت', 'تشات بوت', 'وكيل ذكاء', 'وكلاء ذكاء', 'مساعد افتراضي', 'بوت'],
  'svc-22': ['crm', 'whatsapp automation', 'automation', 'whatsapp business', 'lead management', 'اتمته', 'اتمتة واتساب', 'ادارة علاقات العملاء', 'ربط الحسابات', 'نظام عملاء'],
  'svc-23': ['custom ai system', 'ai system', 'custom software', 'custom system', 'ai ecosystem', 'business software', 'نظام ذكاء اصطناعي', 'انظمه ذكاء', 'نظام مخصص', 'برمجيات مخصصه', 'برمجه مخصصه'],
};

const INDUSTRY_KEYS: Record<string, string[]> = {
  'ind-01': ['hospital', 'hospitals', 'healthcare', 'مستشفي', 'مستشفيات', 'رعايه صحيه'],
  'ind-02': ['clinic', 'doctor', 'dentist', 'عياده', 'عيادات', 'طبيب', 'دكتور', 'اطباء', 'عيادات طبيه'],
  'ind-03': ['luxury brand', 'luxury', 'علامات فاخره', 'علامه فاخره', 'فخامه'],
  'ind-04': ['automotive', 'car', 'cars', 'vehicle', 'سيارات', 'سياره', 'معارض سيارات'],
  'ind-05': ['real estate', 'property', 'developer', 'عقار', 'عقارات', 'تطوير عقاري'],
  'ind-06': ['interior design', 'furniture', 'تصميم داخلي', 'اثاث', 'ديكور'],
  'ind-07': ['hotel', 'resort', 'فندق', 'فنادق', 'منتجع', 'منتجعات'],
  'ind-08': ['tourism', 'travel', 'سياحه', 'سفر'],
  'ind-09': ['sports', 'fitness', 'gym', 'رياضه', 'لياقه', 'نادي'],
  'ind-10': ['beauty', 'cosmetics', 'makeup', 'جمال', 'تجميل', 'مكياج'],
  'ind-11': ['perfume', 'fragrance', 'عطر', 'عطور'],
  'ind-12': ['fashion', 'lifestyle', 'ازياء', 'موضه', 'ملابس'],
  'ind-13': ['restaurant', 'dining', 'food', 'cafe', 'مطعم', 'مطاعم', 'مأكولات', 'كافيهات'],
  'ind-14': ['technology', 'tech', 'startup', 'تكنولوجيا', 'تقنيه', 'ابتكار'],
  'ind-15': ['education', 'school', 'university', 'تعليم', 'مدرسه', 'جامعه'],
  'ind-16': ['corporate', 'corporation', 'enterprise', 'مؤسسات', 'قطاع الشركات'],
  'ind-17': ['retail', 'e-commerce', 'ecommerce', 'online store', 'تجزئه', 'تجاره الكترونيه', 'متجر'],
  'ind-18': ['arts', 'entertainment', 'event', 'فنون', 'ترفيه', 'فعاليات'],
};

const bullets = (items: string[]) => items.map((i) => `• ${i}`).join('\n');

export function buildKnowledge(lang: ChatLang): { entries: KbEntry[]; services: string[]; industries: string[] } {
  const services = getLocalizedContent('services', lang).services;
  const industries = getLocalizedContent('industries', lang).industries;
  const about = getLocalizedContent('about', lang);
  const contact = getLocalizedContent('contact', lang);
  const portfolio = getLocalizedContent('portfolio', lang);
  const locale = (lang === 'ar' ? arLocale : enLocale) as typeof enLocale;
  const ar = lang === 'ar';

  const entries: KbEntry[] = [];

  for (const s of services) {
    const en = getLocalizedContent('services', 'en').services.find((x) => x.id === s.id);
    entries.push({
      id: s.id,
      keys: [s.title, en?.title ?? '', ...(SERVICE_KEYS[s.id] ?? [])].filter(Boolean),
      answer: `${s.title} — ${s.tagline}\n\n${s.description}\n\n${bullets(s.deliverables)}`,
      page: '/services',
    });
  }

  for (const i of industries) {
    const en = getLocalizedContent('industries', 'en').industries.find((x) => x.id === i.id);
    entries.push({
      id: i.id,
      keys: [i.title, en?.title ?? '', ...(INDUSTRY_KEYS[i.id] ?? [])].filter(Boolean),
      answer: `${i.title} — ${i.tagline}\n\n${i.description}\n\n${bullets(i.capabilities)}`,
      page: '/industries',
    });
  }

  // Social media umbrella: several services share this topic.
  const socialIds = ['svc-01', 'svc-02', 'svc-17', 'svc-18'];
  entries.push({
    id: 'group-social',
    keys: ['social media', 'instagram', 'tiktok', 'facebook', 'youtube', 'snapchat', 'linkedin', 'سوشيال ميديا', 'وسائل التواصل', 'التواصل الاجتماعي', 'انستغرام', 'انستجرام', 'انستقرام', 'تيك توك', 'فيسبوك', 'يوتيوب'],
    answer:
      (ar
        ? 'نعم، نقدّم عدة خدمات متعلقة بوسائل التواصل الاجتماعي، وهي:\n'
        : 'Yes, we offer several social-media services:\n') +
      bullets(socialIds.map((id) => services.find((s) => s.id === id)?.title ?? '')) +
      (ar
        ? '\n\nأخبرني أيّها يهمّك لأشرحه لك بالتفصيل.'
        : '\n\nTell me which one interests you and I will explain it in detail.'),
    page: '/services',
  });

  const instagram = contact.social.instagram.href;
  const m = contact.methods;
  entries.push(
    {
      id: 'contact',
      keys: ['contact', 'phone', 'number', 'call', 'whatsapp', 'email', 'reach you', 'get in touch', 'تواصل', 'اتصال', 'رقم', 'هاتف', 'تلفون', 'جوال', 'واتساب', 'واتس اب', 'ايميل', 'بريد', 'كيف اتواصل'],
      answer: ar
        ? `يسعدنا تواصلك معنا:\n• واتساب: ${m.whatsapp.number}\n• الهاتف: ${m.phone.number}\n• البريد الإلكتروني: ${m.email.address}\n• إنستغرام: ${instagram}`
        : `We'd be glad to hear from you:\n• WhatsApp: ${m.whatsapp.number}\n• Phone: ${m.phone.number}\n• Email: ${m.email.address}\n• Instagram: ${instagram}`,
      page: '/contact',
    },
    {
      id: 'instagram',
      keys: ['instagram account', 'your instagram', 'insta', 'social accounts', 'follow you', 'حسابكم', 'حساب انستغرام', 'حساب انستجرام', 'حساب انستقرام', 'صفحتكم', 'انستغرامكم', 'do you have instagram', 'عندكم انستغرام', 'عندكم انستقرام', 'عندكم انستجرام', 'لديكم انستغرام'],
      answer: ar ? `يمكنك متابعتنا على إنستغرام:\n${instagram}` : `You can follow us on Instagram:\n${instagram}`,
    },
    {
      id: 'location',
      keys: ['where are you', 'location', 'address', 'based', 'office', 'dubai', 'uae', 'emirates', 'country', 'وين', 'اين', 'موقعكم', 'عنوان', 'مكتب', 'دبي', 'الامارات', 'مقر', 'فرع'],
      answer: ar
        ? `مقرّنا في ${contact.location.city}، ${contact.location.country}. ${contact.location.detail}.`
        : `We are based in ${contact.location.city}, ${contact.location.country}. ${contact.location.detail}.`,
      page: '/contact',
    },
    {
      id: 'about',
      keys: ['about', 'company', 'who are you', 'tell me about', 'what is metropolitan', 'studio', 'story', 'من انتم', 'عن الشركه', 'عن متروبوليتان', 'نبذه', 'قصتكم', 'ما هي متروبوليتان', 'تعريف'],
      answer: `${locale.home.introBody}\n\n${locale.home.introBody2}`,
      page: '/about',
    },
    {
      id: 'vision',
      keys: ['vision', 'mission', 'goal', 'values', 'رؤيه', 'رسالتكم', 'مهمتكم', 'هدفكم', 'قيمكم'],
      answer: `${about.vision.headline}\n${about.vision.body}\n\n${about.mission.headline}\n${about.mission.body}`,
      page: '/about',
    },
    {
      id: 'experience',
      keys: ['experience', 'years', 'how long', 'خبره', 'سنوات', 'منذ متي'],
      answer: locale.home.introBody2,
      page: '/about',
    },
    {
      id: 'process',
      keys: ['process', 'how do you work', 'workflow', 'steps', 'methodology', 'how it works', 'مراحل', 'خطوات', 'كيف تعملون', 'طريقه عملكم', 'منهجيه', 'اسلوب عملكم'],
      answer: about.process.headline + '\n\n' + about.process.steps.map((s) => `${s.number}. ${s.title} — ${s.description}`).join('\n'),
      page: '/about',
    },
    {
      id: 'whyus',
      keys: ['why choose', 'why you', 'what makes you', 'difference', 'advantage', 'لماذا انتم', 'لماذا نختاركم', 'ميزتكم', 'ما يميزكم', 'ما الذي يميزكم'],
      answer: about.whyUs.headline + '\n\n' + about.whyUs.points.map((p) => `• ${p.title} — ${p.description}`).join('\n'),
      page: '/about',
    },
    {
      id: 'portfolio',
      keys: ['portfolio', 'previous work', 'your work', 'projects', 'examples', 'samples', 'showcase', 'اعمالكم', 'اعمال سابقه', 'مشاريعكم', 'نماذج', 'امثله', 'معرض اعمال'],
      answer:
        (ar ? 'نعرض في صفحة الأعمال نماذج في المجالات التالية:\n' : 'Our portfolio page shows work in these areas:\n') +
        bullets(portfolio.categories.filter((c) => c.id !== 'all').map((c) => c.label)) +
        `\n\n${locale.ui.portfolioNote}`,
      page: '/portfolio',
    },
    {
      id: 'languages',
      keys: ['language', 'languages', 'arabic', 'english', 'لغات', 'لغه', 'عربي', 'انجليزي'],
      answer: ar
        ? 'يتوفر موقعنا بتسع لغات: الإنجليزية، العربية، الروسية، الصينية المبسّطة، التركية، الفرنسية، الإيطالية، الإسبانية والهندية.'
        : 'Our website is available in nine languages: English, Arabic, Russian, Simplified Chinese, Turkish, French, Italian, Spanish and Hindi.',
    },
  );

  return {
    entries,
    services: services.map((s) => `${s.number}. ${s.title}`),
    industries: industries.map((i) => `• ${i.title}`),
  };
}
