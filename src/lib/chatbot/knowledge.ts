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
import { hasPhrase, normalize, type ChatLang } from './text';

export interface KbEntry {
  id: string;
  /** Search phrases (EN + AR). Longer, more specific phrases win. */
  keys: string[];
  answer: string;
  /** Optional page path (without language prefix) the visitor can open for more detail. */
  page?: string;
  /** Category entries only: the production stages / tools, served when the visitor asks for them. */
  stagesAnswer?: string;
  toolsAnswer?: string;
}

/** Extra search phrases per service id, on top of the service title. */
const SERVICE_KEYS: Record<string, string[]> = {
  'svc-01': ['social media management', 'manage social media', 'manage my accounts', 'manage pages', 'community management', 'ادارة وسائل التواصل', 'ادارة حسابات', 'ادارة صفحات', 'ادارة السوشيال', 'ادارة المنشورات', 'ادارة الصفحات'],
  'svc-02': ['content creation', 'social media content', 'reels', 'shorts', 'صناعه محتوي', 'انتاج محتوي', 'محتوي السوشيال', 'ريلز'],
  'svc-03': ['video production', 'cinematic video', 'cinematic film', 'film', 'films', 'movie', 'commercial film', 'tv commercial', 'brand film', 'corporate film', 'music video', 'video clip', 'فيديو كليب', 'كليبات', 'فيلم سينمائي', 'فلم', 'انتاج فيديو', 'فيديو سينمائي', 'تصوير فيديو', 'اعلان تلفزيوني', 'فيلم'],
  'svc-04': ['3d', 'cgi', 'animation', 'architectural visualization', 'رسوم متحركه', 'ثلاثي الابعاد', 'تحريك', 'تصميم ثلاثي'],
  'svc-05': ['vfx', 'visual effects', 'post production', 'editing', 'color grading', 'motion graphics', 'مؤثرات بصريه', 'مونتاج', 'تصحيح الوان', 'ما بعد الانتاج', 'موشن جرافيك'],
  'svc-06': ['ai creative', 'ai production', 'ai content', 'ai video', 'ai image', 'ذكاء اصطناعي ابداعي', 'محتوي بالذكاء الاصطناعي', 'انتاج بالذكاء الاصطناعي'],
  'svc-07': ['medical content', 'healthcare content', 'doctor video', 'patient education', 'محتوي طبي', 'فيديو طبي', 'محتوي صحي'],
  'svc-08': ['podcast', 'بودكاست', 'بودكاست'],
  'svc-09': ['commercial photography', 'product photography', 'photography', 'photoshoot', 'تصوير تجاري', 'تصوير منتجات', 'تصوير فوتوغرافي', 'تصوير فوتوغرافي للمنتجات'],
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
  'ind-02': ['clinic', 'doctor', 'dentist', 'عياده', 'عيادتي', 'عيادتنا', 'عيادات', 'طبيب', 'دكتور', 'اطباء', 'عيادات طبيه'],
  'ind-03': ['luxury brand', 'luxury', 'علامات فاخره', 'علامه فاخره', 'فخامه'],
  'ind-04': ['automotive', 'car', 'cars', 'vehicle', 'سيارات', 'سياره', 'معارض سيارات'],
  'ind-05': ['real estate', 'property', 'developer', 'عقار', 'عقارات', 'شركه عقاريه', 'مطور عقاري', 'عقاري', 'تطوير عقاري'],
  'ind-06': ['interior design', 'furniture', 'تصميم داخلي', 'اثاث', 'ديكور'],
  'ind-07': ['hotel', 'resort', 'فندق', 'فندقي', 'فندقنا', 'فنادق', 'منتجع', 'منتجعات'],
  'ind-08': ['tourism', 'travel', 'سياحه', 'سفر'],
  'ind-09': ['sports', 'fitness', 'gym', 'رياضه', 'لياقه', 'نادي'],
  'ind-10': ['beauty', 'cosmetics', 'makeup', 'جمال', 'تجميل', 'مكياج'],
  'ind-11': ['perfume', 'fragrance', 'عطر', 'عطور'],
  'ind-12': ['fashion', 'lifestyle', 'ازياء', 'موضه', 'ملابس'],
  'ind-13': ['restaurant', 'dining', 'food', 'cafe', 'مطعم', 'مطعمي', 'مطعمنا', 'مطاعم', 'مأكولات', 'كافيهات', 'كافيه'],
  'ind-14': ['technology', 'tech', 'startup', 'تكنولوجيا', 'تقنيه', 'ابتكار'],
  'ind-15': ['education', 'school', 'university', 'تعليم', 'مدرسه', 'جامعه'],
  'ind-16': ['corporate', 'corporation', 'enterprise', 'مؤسسات', 'قطاع الشركات'],
  'ind-17': ['retail', 'e-commerce', 'ecommerce', 'online store', 'متجري', 'محل تجاري', 'تجزئه', 'تجاره الكترونيه', 'متجر'],
  'ind-18': ['arts', 'entertainment', 'event', 'فنون', 'ترفيه', 'فعاليات'],
};

/** Extra search phrases per portfolio category guide (EN + AR). */
const CATEGORY_KEYS: Record<string, string[]> = {
  cinematic: ['cinematic production', 'short film', 'short films', 'long film', 'feature film', 'documentary', 'documentaries', 'tv advertisement', 'tv advertisements', 'tv ad', 'tv ads', 'tv spot', 'television advert', 'commercials', 'advert', 'انتاج سينمائي', 'فيلم قصير', 'افلام قصيره', 'فيلم طويل', 'افلام طويله', 'فيلم وثائقي', 'افلام وثائقيه', 'اعلان تلفزيوني', 'اعلانات تلفزيونيه', 'اعلانات تجاريه', 'فيلم تجاري'],
  automotive: ['automotive', 'car showroom', 'car film', 'car video', 'car videos', 'dealership', 'car dealer', 'car dealers', 'سيارات', 'افلام سيارات', 'معرض سيارات', 'وكاله سيارات', 'فيديو سيارات'],
  medical: ['medical', 'healthcare', 'hospital', 'hospitals', 'doctor interview', 'doctor interviews', 'interviews with doctors', 'hospital director', 'department head', 'medical video', 'medical videos', 'scientific video', 'cultural video', 'مستشفي', 'مستشفيات', 'طبي', 'طبيه', 'لقاءات الاطباء', 'مقابلات مع الاطباء', 'مدير المستشفي', 'رئيس القسم', 'رؤساء الاقسام', 'فيديو علمي'],
  cgi: ['3d animation', '3d', 'cgi', '3ds max', '3d max', '3dmax', 'blender', 'visual effects', 'ثلاثي الابعاد', 'ثري دي', 'رسوم متحركه', 'تحريك ثلاثي', 'تري دي'],
  ai: ['ai creative', 'ai film', 'ai films', 'ai video', 'ai videos', 'ai ad', 'ai ads', 'ai image', 'ai images', 'ai advert', 'ai commercial', 'ai avatar', 'ai avatars', 'ai dubbing', 'ابداع بالذكاء الاصطناعي', 'فيلم بالذكاء الاصطناعي', 'افلام بالذكاء الاصطناعي', 'اعلان بالذكاء الاصطناعي', 'اعلانات بالذكاء الاصطناعي', 'فيديو بالذكاء الاصطناعي'],
  realestate: ['real estate', 'realestate', 'property', 'properties', 'developer', 'developers', 'off plan', 'off-plan', 'apartment', 'apartments', 'villa', 'villas', 'broker', 'عقار', 'عقارات', 'عقاري', 'شقه', 'شقق', 'فيلا', 'مطور عقاري', 'علي الخارطه', 'وسيط عقاري'],
  interior: ['interior design', 'interior designer', 'interior designers', 'interior', 'walkthrough', 'walk through', 'perspective', 'perspectives', '3d perspective', 'autocad', 'fit out', 'fit-out', 'construction company', 'contractor', 'تصميم داخلي', 'مصمم داخلي', 'مصممين داخلي', 'ديكور', 'ووك ثرو', 'ووك ثرو', 'برسبكتيف', 'اوتوكاد', 'تشطيب', 'تشطيبات', 'مقاولات', 'شركه مقاولات', 'شركات المقاولات'],
  hotel: ['hotel', 'hotels', 'resort', 'resorts', 'restaurant', 'restaurants', 'hospitality', 'cafe', 'فندق', 'فنادق', 'منتجع', 'مطعم', 'مطاعم', 'ضيافه', 'كافيه'],
  beauty: ['perfume', 'perfumes', 'beauty', 'cosmetic', 'cosmetics', 'fragrance', 'salon', 'عطر', 'عطور', 'جمال', 'تجميل', 'صالون', 'صالونات', 'مستحضرات'],
  social: ['social media strategy', 'content calendar', 'social media campaign', 'social campaigns', 'page management', 'تقويم محتوي', 'جدول محتوي', 'استراتيجيه التواصل', 'حملات التواصل'],
};

const bullets = (items: string[]) => items.map((i) => `• ${i}`).join('\n');

export function matchEntries(entries: KbEntry[], q: string, minScore = 3): { entry: KbEntry; score: number }[] {
  const out: { entry: KbEntry; score: number }[] = [];
  for (const entry of entries) {
    let best = 0;
    for (const key of entry.keys) {
      const nk = normalize(key);
      if (nk && hasPhrase(q, key)) best = Math.max(best, nk.split(' ').length * 3 + Math.min(nk.length, 20) / 20);
    }
    if (best >= minScore) out.push({ entry, score: best });
  }
  return out.sort((a, b) => b.score - a.score);
}

export function buildKnowledge(lang: ChatLang): { entries: KbEntry[]; services: string[]; industries: string[] } {
  const services = getLocalizedContent('services', lang).services;
  const industries = getLocalizedContent('industries', lang).industries;
  const about = getLocalizedContent('about', lang);
  const contact = getLocalizedContent('contact', lang);
  const portfolio = getLocalizedContent('portfolio', lang);
  const locale = (lang === 'ar' ? arLocale : enLocale) as typeof enLocale;
  const ar = lang === 'ar';

  const entries: KbEntry[] = [];


  // Portfolio category guides (intro, services, production stages, tools). Placed first so a
  // specific question about a specialty gets the richer guide before the generic industry text.
  const guideEntries: KbEntry[] = [];
  const guideUi = portfolio.guideUi;
  for (const g of portfolio.guides) {
    const cat = portfolio.categories.find((c) => c.id === g.id);
    const enCat = getLocalizedContent('portfolio', 'en').categories.find((c) => c.id === g.id);
    const label = cat?.label ?? g.id;
    guideEntries.push({
      id: `cat-${g.id}`,
      keys: [label, enCat?.label ?? '', ...(CATEGORY_KEYS[g.id] ?? [])].filter(Boolean),
      answer:
        `${label} — ${g.headline}\n\n${g.intro.join('\n\n')}\n\n${guideUi.servicesTitle}:\n` +
        bullets(g.services.map((x) => `${x.title}: ${x.text}`)) +
        (ar
          ? '\n\nيمكنني أيضاً أن أشرح لك مراحل العمل والبرامج التي نستخدمها في هذا المجال، فقط اسألني.'
          : '\n\nI can also walk you through our production stages and the software we use for this — just ask.'),
      stagesAnswer: `${label} — ${guideUi.stagesTitle}\n\n` + g.stages.map((t, i) => `${i + 1}. ${guideUi.stageNames[i]} — ${t}`).join('\n'),
      toolsAnswer: `${label} — ${guideUi.toolsTitle}\n\n${g.tools}`,
      page: '/portfolio',
    });
  }
  entries.push(...guideEntries);

  entries.push(
    {
      id: 'stages',
      keys: ['production stages', 'work stages', 'stages of work', 'project stages', 'stages', 'مراحل الانتاج', 'مراحل العمل', 'مراحل المشروع', 'مراحل التنفيذ', 'مراحل'],
      answer: ar
        ? 'نعمل في كل مشروع وفق مراحل إنتاج معتمدة عالمياً: 1) الدراسة والاستكشاف، 2) الفكرة والسيناريو، 3) التحضير، 4) التنفيذ والتصوير، 5) ما بعد الإنتاج، 6) التسليم والنمو. وتختلف تفاصيل كل مرحلة بحسب التخصص (عقارات، تصميم داخلي، مستشفيات، سينما، 3D…). أخبرني أيّ تخصص يهمّك لأشرح لك مراحله.'
        : 'Every project follows the internationally recognised production stages: 1) Study & discovery, 2) Concept & script, 3) Preparation, 4) Production, 5) Post-production, 6) Delivery & growth. The details of each stage depend on the specialty (real estate, interior design, hospitals, cinema, 3D…). Tell me which specialty interests you and I will walk you through its stages.',
      page: '/portfolio',
    },
    {
      id: 'tools',
      keys: ['software', 'programs', 'what software', 'which software', 'what programs', 'which programs', 'what tools', 'which tools', 'premiere', 'after effects', 'davinci', 'برامج', 'برنامج', 'اي برامج', 'ما البرامج', 'ما هي البرامج', 'ادوات', 'ما الادوات'],
      answer: ar
        ? 'نستخدم برامج احترافية عالمية بحسب نوع العمل: AutoCAD للمخططات والرسومات الهندسية، و3ds Max وBlender للنمذجة والإضاءة والرندر ثلاثي الأبعاد، وAdobe Premiere Pro وAfter Effects وDaVinci Resolve للمونتاج والمؤثرات وتصحيح الألوان، إضافة إلى كاميرات سينمائية ودرون وجيمبال في التصوير، والبرامج الهندسية التي يستخدمها استشاريوكم. اسألني عن تخصص معيّن لأذكر لك أدواته.'
        : 'We use professional, industry-standard tools depending on the job: AutoCAD for plans and engineering drawings, 3ds Max and Blender for 3D modelling, lighting and rendering, Adobe Premiere Pro, After Effects and DaVinci Resolve for editing, effects and colour grading, plus cinema cameras, drones and gimbals for filming — and the engineering programs your consultants already use. Ask me about a specific specialty and I will list its tools.',
      page: '/portfolio',
    },
  );

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

  const shootIds = ['svc-03', 'svc-09'];
  entries.push({
    id: 'group-shooting',
    keys: ['filming', 'shooting', 'film', 'videography', 'photography', 'photoshoot', 'video', 'videos', 'photo', 'photos', 'تصوير', 'تصوير فيديو', 'تصوير ميديا', 'فيديو', 'فيديوهات', 'صور', 'ميديا', 'انتاج مرئي'],
    answer:
      (ar ? 'نعم، يشمل ذلك:\n' : 'Yes, we cover that:\n') +
      shootIds
        .map((id) => {
          const sv = services.find((x) => x.id === id);
          return sv ? `• ${sv.title} — ${sv.tagline}` : '';
        })
        .join('\n') +
      (ar ? '\n\nأخبرني ما نوع التصوير الذي تفكّر فيه لأوضّح لك التفاصيل.' : '\n\nTell me what kind of shoot you have in mind and I will explain the details.'),
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
      keys: ['where are you', 'location', 'address', 'based', 'office', 'dubai', 'uae', 'emirates', 'country', 'qatar', 'saudi', 'saudi arabia', 'bahrain', 'oman', 'kuwait', 'egypt', 'abroad', 'outside', 'international', 'internationally', 'worldwide', 'abu dhabi', 'sharjah', 'وين', 'اين', 'موقعكم', 'عنوان', 'مكتب', 'دبي', 'الامارات', 'مقر', 'فرع', 'قطر', 'السعوديه', 'سعودي', 'البحرين', 'عمان', 'الكويت', 'مصر', 'خارج', 'ابوظبي', 'ابو ظبي', 'الشارقه'],
      answer: ar
        ? `مقرّنا في ${contact.location.city}، ${contact.location.country}. ${contact.location.detail}.`
        : `We are based in ${contact.location.city}, ${contact.location.country}. ${contact.location.detail}.`,
      page: '/contact',
    },
    {
      id: 'hours',
      keys: ['working hours', 'work hours', 'opening hours', 'opening times', 'office hours', 'business hours', 'what time do you open', 'what time do you close', 'when do you open', 'when are you open', 'are you open', 'open on saturday', 'open on sunday', 'open on friday', 'on saturday', 'on sunday', 'weekend', 'weekends', 'holiday', 'days off', 'اوقات العمل', 'اوقات الدوام', 'ساعات العمل', 'ساعات الدوام', 'موعد الدوام', 'مواعيد الدوام', 'مواعيد العمل', 'الدوام', 'دوامكم', 'متي تفتحون', 'متي تغلقون', 'متي تعملون', 'وقت العمل', 'ايام العمل', 'اجازه', 'اجازتكم', 'عطله', 'عطلتكم', 'يوم السبت', 'يوم الاحد', 'يوم الجمعه', 'السبت', 'الاحد'],
      answer: ar
        ? `ساعات العمل لدينا: ${contact.hours.days}، ${contact.hours.time}. ${contact.hours.closed}.\nيمكنك مراسلتنا في أي وقت، وسيردّ عليك الفريق في أقرب وقت خلال أيام العمل.`
        : `Our working hours: ${contact.hours.days}, ${contact.hours.time}. ${contact.hours.closed}.\nYou can message us at any time and the team will reply as soon as possible on working days.`,
      page: '/contact',
    },
    {
      id: 'about',
      keys: ['about', 'company', 'what is your company', 'your company', 'what company', 'شركتكم', 'شركتك', 'عن شركتكم', 'ما هي شركتكم', 'ماهي شركتكم', 'who are you', 'tell me about', 'what is metropolitan', 'studio', 'story', 'من انتم', 'عن الشركه', 'عن متروبوليتان', 'نبذه', 'قصتكم', 'ما هي متروبوليتان', 'تعريف'],
      answer: `${locale.home.introBody}\n\n${locale.home.introBody2}`,
      page: '/about',
    },
    {
      id: 'mission',
      keys: ['mission', 'our mission', 'your mission', 'values', 'our values', 'goal', 'goals', 'commitment', 'quality', 'what do you stand for', 'رسالتكم', 'رسالتنا', 'مهمتكم', 'هدفكم', 'قيمكم', 'قيمنا', 'التزامكم', 'جودتكم', 'ما هي رسالتكم'],
      answer: ar
        ? 'رسالتنا في متروبوليتان ديجيتال ماركتينج أن نصنع لكل عميل أفضل عمل ممكن، وأن ننال رضاه بجودة عالية وتقنيات متقدمة والتزام دقيق بالمواعيد.\n\nنجمع بين الذكاء التسويقي والسرد السينمائي والابتكار الإبداعي، ونعمل مع نخبة من المبدعين الذين يطوّرون مهاراتهم باستمرار، ونقدّم خدمة عملاء راقية ومتابعة صادقة في كل مرحلة من مراحل المشروع.'
        : 'Our mission at Metropolitan Digital Marketing is to create the best possible work for every client and to earn their complete satisfaction through high quality, advanced technology and a firm commitment to deadlines.\n\nWe combine marketing intelligence, cinematic storytelling and creative innovation, work with a team of exceptional creatives who keep developing their skills, and offer attentive, first-class client service at every stage of a project.',
      page: '/about',
    },
    {
      id: 'vision',
      keys: ['vision', 'our vision', 'your vision', 'future', 'رؤيه', 'رؤيتكم', 'رؤيتنا'],
      answer: ar
        ? 'رؤيتنا عالم تصل فيه كل علامة تجارية، في أي قطاع، إلى إنتاج إبداعي بجودة سينمائية، ونعمل على تحقيق ذلك مشروعاً استثنائياً تلو الآخر.'
        : 'Our vision is a world where every brand, in any industry, has access to cinematic-quality creative production — and we are building that future one exceptional project at a time.',
      page: '/about',
    },
    {
      id: 'experience',
      keys: ['experience', 'years', 'how long have you', 'how many years', 'خبره', 'سنوات', 'منذ متي'],
      answer: locale.home.introBody2,
      page: '/about',
    },
    {
      id: 'timeline',
      keys: ['how long does it take', 'how long will it take', 'delivery time', 'turnaround', 'timeline', 'how many days', 'how soon', 'deadline', 'deadlines', 'when will it be ready', 'كم تستغرق', 'كم يستغرق', 'كم المده', 'مده التنفيذ', 'مده التسليم', 'متي يجهز', 'متي نستلم', 'كم يوم', 'كم اسبوع', 'مواعيد التسليم'],
      answer: ar
        ? 'مدة التنفيذ تختلف بحسب نوع المشروع وحجمه (فيلم قصير يختلف عن إدارة صفحات لمدة شهر أو مشهد ثلاثي الأبعاد). بعد مرحلة الدراسة يحدّد لك الفريق جدولاً زمنياً واضحاً، ونلتزم بالمواعيد التزاماً دقيقاً. إن أخبرتني بنوع مشروعك أنقل ذلك للفريق ليتواصل معك بالتفاصيل.'
        : 'The timeline depends on the type and size of the project — a short film differs from a month of page management or a 3D scene. After the study stage the team gives you a clear schedule, and we keep to deadlines very strictly. If you tell me about your project I will pass it on so the team can contact you with details.',
      page: '/contact',
    },
    {
      id: 'process',
      keys: ['process', 'how do you work', 'workflow', 'steps', 'methodology', 'how it works', 'مراحل', 'خطوات', 'كيف تعملون', 'طريقه عملكم', 'منهجيه', 'اسلوب عملكم'],
      answer: about.process.headline + '\n\n' + about.process.steps.map((s) => `${s.number}. ${s.title} — ${s.description.split(/(?<=[.。])\s/)[0]}`).join('\n'),
      page: '/about',
    },
    {
      id: 'whyus',
      keys: ['why choose', 'why you', 'what makes you', 'difference', 'advantage', 'لماذا انتم', 'لماذا نختاركم', 'ميزتكم', 'ما يميزكم', 'ما الذي يميزكم'],
      answer: about.whyUs.headline + '\n\n' + about.whyUs.points.map((p) => `• ${p.title}`).join('\n'),
      page: '/about',
    },
    {
      id: 'law',
      keys: ['uae law', 'uae laws', 'laws of the uae', 'under uae law', 'within the law', 'قوانين الامارات', 'قوانين دوله الامارات', 'قانون الامارات', 'ضمن القانون', 'ضمن قوانين', 'حسب القانون', 'laws', 'is it legal', 'legal', 'legally', 'licensed', 'license', 'licence', 'regulations', 'compliance', 'comply', 'ethics', 'ethical', 'lawful', 'قانون', 'قوانين', 'قانوني', 'قانونيه', 'مرخص', 'مرخصين', 'ترخيص', 'رخصه', 'اخلاقي', 'اخلاقيه', 'اخلاقيات', 'التزام', 'تلتزمون'],
      answer: ar
        ? 'نعم، نعمل بالكامل ضمن قوانين دولة الإمارات العربية المتحدة، ونلتزم بكل ما هو قانوني ومرخّص وأخلاقي في عملنا مع عملائنا.'
        : 'Yes — we work entirely within the laws of the United Arab Emirates, and only on what is lawful, licensed and ethical.',
    },
    {
      id: 'clients',
      keys: ['client name', 'client names', 'your clients', 'who are your clients', 'customers', 'past clients', 'اسماء العملاء', 'اسماء عملائكم', 'عملاءكم', 'عملائكم', 'من هم عملاؤكم', 'زبائنكم'],
      answer: ar
        ? 'نعتز بثقة عملائنا، وأعمالهم الخاصة سرّية. يمكن الاطلاع على أعمال العملاء عند الطلب وبموجب اتفاقية عدم إفصاح (NDA)، وسيسعد فريقنا بترتيب ذلك لك.'
        : 'We value the trust of our clients, and their work is confidential. Client work can be viewed on request under a non-disclosure agreement (NDA), and our team would be glad to arrange that for you.',
      page: '/portfolio',
    },
    {
      id: 'portfolio',
      keys: ['portfolio', 'previous work', 'your work', 'our work', 'projects', 'examples', 'samples', 'showcase', 'what have you done', 'اعمالكم', 'اعمالنا', 'اعمال سابقه', 'مشاريعكم', 'نماذج', 'امثله', 'معرض اعمال'],
      answer: ar
        ? 'نفّذنا مشاريع متنوعة في عدة مجالات، منها إدارة صفحات وسائل التواصل الاجتماعي، وتصوير الفيديو كليبات والإعلانات السينمائية والحديثة، وإنتاج البودكاست، والرسوم ثلاثية الأبعاد والمؤثرات البصرية، والمحتوى المصنوع بالذكاء الاصطناعي. وتضم صفحة الأعمال نماذج في: ' +
          portfolio.categories.filter((c) => c.id !== 'all').map((c) => c.label).join('، ') +
          '. يمكن الاطلاع على أعمال العملاء عند الطلب بموجب اتفاقية عدم إفصاح (NDA).'
        : 'We have delivered a wide range of projects, including social media page management, music videos, cinematic and modern advertising, podcast production, 3D animation and VFX, and AI-generated content. Our portfolio page shows work in: ' +
          portfolio.categories.filter((c) => c.id !== 'all').map((c) => c.label).join(', ') +
          '. Client work can be viewed on request under a non-disclosure agreement (NDA).',
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
