/**
 * Multilingual SEO metadata for Metropolitan Digital Marketing.
 *
 * Each page × language combination has a unique title (≤60 chars) and
 * meta description (≤160 chars) with natural keyword placement.
 *
 * Titles follow the pattern: [Page Purpose] — [Brand] | [Location keyword]
 * Descriptions lead with the primary keyword for the language/market.
 */

export const SITE_URL = 'https://metropolitandigitalmarketing.com';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const BRAND = 'Metropolitan Digital Marketing';

// ─── Page keys ───────────────────────────────────────────────────────────────
export type PageKey = 'home' | 'about' | 'services' | 'industries' | 'portfolio' | 'contact' | 'luxury-brands';

// ─── Language keys ────────────────────────────────────────────────────────────
export type LangCode =
  | 'en' | 'ar' | 'ru' | 'zh-CN' | 'tr'
  | 'fr' | 'it' | 'es' | 'hi';

export interface PageSeoMeta {
  title: string;
  description: string;
}

// ─── SEO metadata per page × language ────────────────────────────────────────
export const seoMeta: Record<PageKey, Record<LangCode, PageSeoMeta>> = {

  // ── HOME ──────────────────────────────────────────────────────────────────
  home: {
    en: {
      title: 'Digital Marketing Agency Dubai | Metropolitan',
      description: 'Dubai\'s premier digital marketing agency. Cinematic video production, 3D animation, CGI, social media advertising & AI creative solutions. 15+ years of excellence.',
    },
    ar: {
      title: 'شركة تسويق رقمي في دبي | ميتروبوليتان',
      description: 'شركة تسويق إلكتروني رائدة في دبي. إنتاج فيديو سينمائي، رسوم ثلاثية الأبعاد، CGI، إعلانات السوشال ميديا وحلول الذكاء الاصطناعي الإبداعية. أكثر من 15 عاماً من التميز.',
    },
    ru: {
      title: 'Агентство цифрового маркетинга Дубай | Metropolitan',
      description: 'Ведущее агентство цифрового маркетинга в Дубае. Кинематографическое видео, 3D-анимация, CGI, реклама в соцсетях и AI-контент. Более 15 лет опыта.',
    },
    fr: {
      title: 'Agence Marketing Digital Dubaï | Metropolitan',
      description: 'Agence de marketing digital à Dubaï. Production vidéo cinématographique, animation 3D, CGI, publicité sur les réseaux sociaux et solutions IA créatives. 15+ ans d\'excellence.',
    },
    'zh-CN': {
      title: '迪拜数字营销公司 | Metropolitan',
      description: '迪拜领先的数字营销机构。提供电影级视频制作、3D动画、CGI、社交媒体广告及AI创意解决方案，拥有超过15年的卓越经验。',
    },
    hi: {
      title: 'दुबई डिजिटल मार्केटिंग एजेंसी | Metropolitan',
      description: 'दुबई की प्रमुख डिजिटल मार्केटिंग एजेंसी। सिनेमाई वीडियो प्रोडक्शन, 3D एनिमेशन, CGI, सोशल मीडिया विज्ञापन और AI क्रिएटिव सॉल्यूशन। 15+ वर्षों की उत्कृष्टता।',
    },
    es: {
      title: 'Agencia Marketing Digital Dubái | Metropolitan',
      description: 'Agencia de marketing digital líder en Dubái. Producción de video cinematográfico, animación 3D, CGI, publicidad en redes sociales y soluciones creativas con IA. Más de 15 años.',
    },
    it: {
      title: 'Agenzia Marketing Digitale Dubai | Metropolitan',
      description: 'Agenzia di marketing digitale leader a Dubai. Produzione video cinematografica, animazione 3D, CGI, pubblicità sui social media e soluzioni creative con IA. Oltre 15 anni.',
    },
    tr: {
      title: 'Dubai Dijital Pazarlama Ajansı | Metropolitan',
      description: 'Dubai\'nin önde gelen dijital pazarlama ajansı. Sinematik video prodüksiyon, 3D animasyon, CGI, sosyal medya reklamcılığı ve yapay zeka yaratıcı çözümleri. 15+ yıllık deneyim.',
    },
  },

  // ── ABOUT ─────────────────────────────────────────────────────────────────
  about: {
    en: {
      title: 'About Us | Metropolitan Digital Marketing Dubai',
      description: 'Learn about Metropolitan Digital Marketing — Dubai\'s creative production studio with 15+ years delivering cinematic video, CGI, social media & digital campaigns.',
    },
    ar: {
      title: 'من نحن | ميتروبوليتان ديجيتال ماركتينج دبي',
      description: 'تعرف على ميتروبوليتان ديجيتال ماركتينج — استوديو الإنتاج الإبداعي الرائد في دبي. أكثر من 15 عاماً في إنتاج الفيديو السينمائي وإدارة حسابات التواصل الاجتماعي.',
    },
    ru: {
      title: 'О нас | Metropolitan Digital Marketing Дубай',
      description: 'Узнайте о Metropolitan Digital Marketing — ведущей креативной студии Дубая с 15-летним опытом в кинематографическом видео, CGI и цифровом маркетинге.',
    },
    fr: {
      title: 'À propos | Metropolitan Digital Marketing Dubaï',
      description: 'Découvrez Metropolitan Digital Marketing — studio de production créative à Dubaï avec 15+ ans d\'expérience en vidéo cinématographique, CGI et marketing digital.',
    },
    'zh-CN': {
      title: '关于我们 | Metropolitan 迪拜数字营销',
      description: '了解Metropolitan Digital Marketing——迪拜领先的创意制作工作室，拥有超过15年的电影级视频、CGI和数字营销经验。',
    },
    hi: {
      title: 'हमारे बारे में | Metropolitan Digital Marketing दुबई',
      description: 'Metropolitan Digital Marketing के बारे में जानें — दुबई का प्रमुख क्रिएटिव प्रोडक्शन स्टूडियो। 15+ वर्षों का सिनेमाई वीडियो, CGI और डिजिटल मार्केटिंग अनुभव।',
    },
    es: {
      title: 'Sobre Nosotros | Metropolitan Digital Marketing Dubái',
      description: 'Conoce Metropolitan Digital Marketing — estudio de producción creativa en Dubái con más de 15 años de experiencia en video cinematográfico, CGI y marketing digital.',
    },
    it: {
      title: 'Chi Siamo | Metropolitan Digital Marketing Dubai',
      description: 'Scopri Metropolitan Digital Marketing — studio di produzione creativa a Dubai con oltre 15 anni di esperienza in video cinematografico, CGI e marketing digitale.',
    },
    tr: {
      title: 'Hakkımızda | Metropolitan Digital Marketing Dubai',
      description: 'Metropolitan Digital Marketing hakkında bilgi edinin — Dubai\'nin yaratıcı prodüksiyon stüdyosu. 15+ yıllık sinematik video, CGI ve dijital pazarlama deneyimi.',
    },
  },

  // ── SERVICES ──────────────────────────────────────────────────────────────
  services: {
    en: {
      title: 'Creative Services Dubai | Metropolitan Digital',
      description: '19 creative disciplines: social media advertising, cinematic video production, 3D animation, CGI, VFX, AI content, influencer marketing & more. Dubai\'s full-service studio.',
    },
    ar: {
      title: 'خدمات إبداعية في دبي | ميتروبوليتان',
      description: '19 تخصصاً إبداعياً: إعلانات السوشال ميديا، إنتاج فيديو سينمائي، تصميم ثلاثي الأبعاد، CGI، مؤثرات بصرية، محتوى الذكاء الاصطناعي والتسويق عبر المؤثرين في دبي.',
    },
    ru: {
      title: 'Креативные услуги Дубай | Metropolitan Digital',
      description: '19 творческих направлений: реклама в соцсетях, кинематографическое видео, 3D-анимация, CGI, VFX, AI-контент, маркетинг влияния и многое другое в Дубае.',
    },
    fr: {
      title: 'Services Créatifs Dubaï | Metropolitan Digital',
      description: '19 disciplines créatives : publicité sur réseaux sociaux, production vidéo cinématographique, animation 3D, CGI, VFX, contenu IA et marketing d\'influence à Dubaï.',
    },
    'zh-CN': {
      title: '迪拜创意服务 | Metropolitan Digital',
      description: '19项创意服务：社交媒体广告、电影级视频制作、3D动画、CGI、视觉特效、AI内容创作、网红营销等。迪拜全方位创意制作工作室。',
    },
    hi: {
      title: 'दुबई क्रिएटिव सर्विसेज | Metropolitan Digital',
      description: '19 क्रिएटिव डिसिप्लिन: सोशल मीडिया विज्ञापन, सिनेमाई वीडियो प्रोडक्शन, 3D एनिमेशन, CGI, VFX, AI कंटेंट, इन्फ्लुएंसर मार्केटिंग और बहुत कुछ। दुबई का फुल-सर्विस स्टूडियो।',
    },
    es: {
      title: 'Servicios Creativos Dubái | Metropolitan Digital',
      description: '19 disciplinas creativas: publicidad en redes sociales, producción de video cinematográfico, animación 3D, CGI, VFX, contenido IA y marketing de influencers en Dubái.',
    },
    it: {
      title: 'Servizi Creativi Dubai | Metropolitan Digital',
      description: '19 discipline creative: pubblicità sui social media, produzione video cinematografica, animazione 3D, CGI, VFX, contenuti IA e influencer marketing a Dubai.',
    },
    tr: {
      title: 'Dubai Yaratıcı Hizmetler | Metropolitan Digital',
      description: '19 yaratıcı disiplin: sosyal medya reklamcılığı, sinematik video prodüksiyon, 3D animasyon, CGI, VFX, yapay zeka içeriği ve influencer pazarlama. Dubai\'nin tam hizmet stüdyosu.',
    },
  },

  // ── INDUSTRIES ────────────────────────────────────────────────────────────
  industries: {
    en: {
      title: 'Industries We Serve | Metropolitan Dubai',
      description: 'Creative marketing solutions for 18 industries: luxury automotive, healthcare, hospitality, real estate, beauty, fashion, technology & more. Based in Dubai, UAE.',
    },
    ar: {
      title: 'القطاعات التي نخدمها | ميتروبوليتان دبي',
      description: 'حلول تسويقية إبداعية لـ 18 قطاعاً: السيارات الفاخرة، الرعاية الصحية، الضيافة، العقارات، الجمال، الموضة والتكنولوجيا. مقرنا في دبي، الإمارات.',
    },
    ru: {
      title: 'Отрасли | Metropolitan Digital Marketing Дубай',
      description: 'Креативные маркетинговые решения для 18 отраслей: люксовые автомобили, здравоохранение, гостиничный бизнес, недвижимость, красота, мода и технологии. Дубай, ОАЭ.',
    },
    fr: {
      title: 'Secteurs d\'Activité | Metropolitan Dubaï',
      description: 'Solutions marketing créatives pour 18 secteurs : automobile de luxe, santé, hôtellerie, immobilier, beauté, mode et technologie. Basé à Dubaï, Émirats arabes unis.',
    },
    'zh-CN': {
      title: '服务行业 | Metropolitan 迪拜',
      description: '为18个行业提供创意营销解决方案：豪华汽车、医疗健康、酒店业、房地产、美容、时尚和科技。总部位于迪拜，阿联酋。',
    },
    hi: {
      title: 'हम जिन उद्योगों की सेवा करते हैं | Metropolitan दुबई',
      description: '18 उद्योगों के लिए क्रिएटिव मार्केटिंग समाधान: लक्जरी ऑटोमोटिव, हेल्थकेयर, हॉस्पिटैलिटी, रियल एस्टेट, ब्यूटी, फैशन और टेक्नोलॉजी। दुबई, UAE।',
    },
    es: {
      title: 'Industrias que Servimos | Metropolitan Dubái',
      description: 'Soluciones de marketing creativo para 18 industrias: automoción de lujo, salud, hostelería, inmobiliaria, belleza, moda y tecnología. Con sede en Dubái, EAU.',
    },
    it: {
      title: 'Settori che Serviamo | Metropolitan Dubai',
      description: 'Soluzioni di marketing creativo per 18 settori: automotive di lusso, sanità, ospitalità, immobiliare, bellezza, moda e tecnologia. Con sede a Dubai, EAU.',
    },
    tr: {
      title: 'Hizmet Verdiğimiz Sektörler | Metropolitan Dubai',
      description: '18 sektör için yaratıcı pazarlama çözümleri: lüks otomotiv, sağlık, konaklama, gayrimenkul, güzellik, moda ve teknoloji. Dubai, BAE merkezli.',
    },
  },

  // ── PORTFOLIO ─────────────────────────────────────────────────────────────
  portfolio: {
    en: {
      title: 'Creative Portfolio | Metropolitan Digital Dubai',
      description: 'Explore our creative portfolio: cinematic video, 3D CGI, automotive campaigns, luxury hotels, medical content, real estate & AI production. Dubai-based creative studio.',
    },
    ar: {
      title: 'أعمالنا الإبداعية | ميتروبوليتان دبي',
      description: 'استكشف أعمالنا الإبداعية: فيديو سينمائي، CGI ثلاثي الأبعاد، حملات سيارات، فنادق فاخرة، محتوى طبي، عقارات وإنتاج بالذكاء الاصطناعي. استوديو إبداعي في دبي.',
    },
    ru: {
      title: 'Портфолио | Metropolitan Digital Marketing Дубай',
      description: 'Изучите наше портфолио: кинематографическое видео, 3D CGI, автомобильные кампании, роскошные отели, медицинский контент, недвижимость и AI-производство. Дубай.',
    },
    fr: {
      title: 'Portfolio Créatif | Metropolitan Digital Dubaï',
      description: 'Découvrez notre portfolio créatif : vidéo cinématographique, CGI 3D, campagnes automobiles, hôtels de luxe, contenu médical, immobilier et production IA. Dubaï.',
    },
    'zh-CN': {
      title: '创意作品集 | Metropolitan 迪拜',
      description: '探索我们的创意作品集：电影级视频、3D CGI、汽车广告、豪华酒店、医疗内容、房地产和AI制作。迪拜创意制作工作室。',
    },
    hi: {
      title: 'क्रिएटिव पोर्टफोलियो | Metropolitan दुबई',
      description: 'हमारा क्रिएटिव पोर्टफोलियो देखें: सिनेमाई वीडियो, 3D CGI, ऑटोमोटिव कैंपेन, लक्जरी होटल, मेडिकल कंटेंट, रियल एस्टेट और AI प्रोडक्शन। दुबई क्रिएटिव स्टूडियो।',
    },
    es: {
      title: 'Portfolio Creativo | Metropolitan Digital Dubái',
      description: 'Explora nuestro portfolio: video cinematográfico, CGI 3D, campañas de automoción, hoteles de lujo, contenido médico, inmobiliaria y producción con IA. Estudio en Dubái.',
    },
    it: {
      title: 'Portfolio Creativo | Metropolitan Digital Dubai',
      description: 'Esplora il nostro portfolio: video cinematografico, CGI 3D, campagne automotive, hotel di lusso, contenuti medici, immobiliare e produzione IA. Studio a Dubai.',
    },
    tr: {
      title: 'Yaratıcı Portföy | Metropolitan Digital Dubai',
      description: 'Portföyümüzü keşfedin: sinematik video, 3D CGI, otomotiv kampanyaları, lüks oteller, tıbbi içerik, gayrimenkul ve yapay zeka prodüksiyonu. Dubai yaratıcı stüdyosu.',
    },
  },

  // ── CONTACT ───────────────────────────────────────────────────────────────
  contact: {
    en: {
      title: 'Contact Us | Metropolitan Digital Marketing Dubai',
      description: 'Start your project with Metropolitan Digital Marketing. Contact our Dubai team for cinematic video, social media, 3D animation, CGI & digital marketing enquiries.',
    },
    ar: {
      title: 'تواصل معنا | ميتروبوليتان ديجيتال ماركتينج دبي',
      description: 'ابدأ مشروعك مع ميتروبوليتان ديجيتال ماركتينج. تواصل مع فريقنا في دبي لاستفسارات الفيديو السينمائي وإدارة السوشال ميديا والتصميم ثلاثي الأبعاد.',
    },
    ru: {
      title: 'Контакты | Metropolitan Digital Marketing Дубай',
      description: 'Начните проект с Metropolitan Digital Marketing. Свяжитесь с нашей командой в Дубае по вопросам видеопроизводства, соцсетей, 3D-анимации и CGI.',
    },
    fr: {
      title: 'Contactez-nous | Metropolitan Digital Marketing Dubaï',
      description: 'Démarrez votre projet avec Metropolitan Digital Marketing. Contactez notre équipe à Dubaï pour la vidéo cinématographique, les réseaux sociaux, l\'animation 3D et le CGI.',
    },
    'zh-CN': {
      title: '联系我们 | Metropolitan Digital Marketing 迪拜',
      description: '与Metropolitan Digital Marketing开始您的项目。联系我们的迪拜团队，咨询电影级视频、社交媒体、3D动画和CGI服务。',
    },
    hi: {
      title: 'संपर्क करें | Metropolitan Digital Marketing दुबई',
      description: 'Metropolitan Digital Marketing के साथ अपना प्रोजेक्ट शुरू करें। सिनेमाई वीडियो, सोशल मीडिया, 3D एनिमेशन और CGI के लिए हमारी दुबई टीम से संपर्क करें।',
    },
    es: {
      title: 'Contáctenos | Metropolitan Digital Marketing Dubái',
      description: 'Inicia tu proyecto con Metropolitan Digital Marketing. Contacta a nuestro equipo en Dubái para video cinematográfico, redes sociales, animación 3D y CGI.',
    },
    it: {
      title: 'Contattaci | Metropolitan Digital Marketing Dubai',
      description: 'Inizia il tuo progetto con Metropolitan Digital Marketing. Contatta il nostro team a Dubai per video cinematografico, social media, animazione 3D e CGI.',
    },
    tr: {
      title: 'İletişim | Metropolitan Digital Marketing Dubai',
      description: 'Metropolitan Digital Marketing ile projenize başlayın. Sinematik video, sosyal medya, 3D animasyon ve CGI için Dubai ekibimizle iletişime geçin.',
    },
  },

  // ── LUXURY BRANDS ─────────────────────────────────────────────────────────
  'luxury-brands': {
    en: {
      title: 'Luxury Brand Marketing Dubai | Metropolitan',
      description: 'Cinematic advertising, CGI, 3D animation & product photography for luxury watches, fine jewellery and exclusive fragrances. Dubai\'s premium luxury marketing studio.',
    },
    ar: {
      title: 'تسويق العلامات الفاخرة دبي | ميتروبوليتان',
      description: 'إعلانات سينمائية، CGI، رسوم ثلاثية الأبعاد وتصوير منتجات للساعات الفاخرة والمجوهرات الراقية والعطور الحصرية. استوديو التسويق الفاخر الأول في دبي.',
    },
    ru: {
      title: 'Маркетинг люксовых брендов Дубай | Metropolitan',
      description: 'Кинематографическая реклама, CGI, 3D-анимация и предметная съёмка для люксовых часов, ювелирных украшений и эксклюзивных ароматов. Дубай.',
    },
    fr: {
      title: 'Marketing Luxe Dubaï | Metropolitan Digital',
      description: 'Publicité cinématographique, CGI, animation 3D et photographie produit pour montres de luxe, joaillerie fine et parfums exclusifs. Studio premium à Dubaï.',
    },
    'zh-CN': {
      title: '奢侈品牌营销迪拜 | Metropolitan',
      description: '为豪华腕表、精品珠宝和独家香水提供电影级广告、CGI、3D动画和产品摄影服务。迪拜顶级奢侈品营销工作室。',
    },
    hi: {
      title: 'लक्जरी ब्रांड मार्केटिंग दुबई | Metropolitan',
      description: 'लक्जरी घड़ियों, फाइन ज्वेलरी और एक्सक्लूसिव परफ्यूम के लिए सिनेमाई विज्ञापन, CGI, 3D एनिमेशन और प्रोडक्ट फोटोग्राफी। दुबई का प्रीमियम लक्जरी मार्केटिंग स्टूडियो।',
    },
    es: {
      title: 'Marketing Marcas de Lujo Dubái | Metropolitan',
      description: 'Publicidad cinematográfica, CGI, animación 3D y fotografía de producto para relojes de lujo, joyería fina y fragancias exclusivas. Estudio premium en Dubái.',
    },
    it: {
      title: 'Marketing Brand Lusso Dubai | Metropolitan',
      description: 'Pubblicità cinematografica, CGI, animazione 3D e fotografia prodotto per orologi di lusso, gioielleria fine e profumi esclusivi. Studio premium a Dubai.',
    },
    tr: {
      title: 'Lüks Marka Pazarlama Dubai | Metropolitan',
      description: 'Lüks saatler, ince mücevherler ve özel parfümler için sinematik reklam, CGI, 3D animasyon ve ürün fotoğrafçılığı. Dubai\'nin premium lüks pazarlama stüdyosu.',
    },
  },
};

/**
 * Returns the SEO metadata for a given page and language.
 * Falls back to English if the language is not found.
 */
export function getPageSeo(page: PageKey, lang: string): PageSeoMeta {
  const pageMeta = seoMeta[page];
  if (!pageMeta) return seoMeta.home.en;
  return (pageMeta as Record<string, PageSeoMeta>)[lang] ?? pageMeta.en;
}

/**
 * Returns the canonical URL for a given page and language.
 * e.g. getCanonicalUrl('about', 'ar') → 'https://metropolitandigitalmarketing.com/ar/about'
 */
export function getCanonicalUrl(page: PageKey, lang: string): string {
  if (page === 'luxury-brands') {
    return `${SITE_URL}/${lang}/industries/luxury-brands`;
  }
  const pagePath = page === 'home' ? '' : `/${page}`;
  return `${SITE_URL}/${lang}${pagePath}`;
}
