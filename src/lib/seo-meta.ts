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
  | 'en' | 'ar' | 'ru' | 'fr' | 'de'
  | 'zh-CN' | 'ja' | 'hi' | 'es' | 'nl-BE'
  | 'pt' | 'it' | 'tr' | 'ko';

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
    de: {
      title: 'Digitalagentur Dubai | Metropolitan Digital Marketing',
      description: 'Führende Digitalagentur in Dubai. Kinematografische Videoproduktion, 3D-Animation, CGI, Social-Media-Werbung und KI-Kreativlösungen. Über 15 Jahre Erfahrung.',
    },
    'zh-CN': {
      title: '迪拜数字营销公司 | Metropolitan',
      description: '迪拜领先的数字营销机构。提供电影级视频制作、3D动画、CGI、社交媒体广告及AI创意解决方案，拥有超过15年的卓越经验。',
    },
    ja: {
      title: 'ドバイのデジタルマーケティング会社 | Metropolitan',
      description: 'ドバイを拠点とするデジタルマーケティングエージェンシー。映画品質の動画制作、3Dアニメーション、CGI、SNS広告、AIクリエイティブソリューションを提供。15年以上の実績。',
    },
    hi: {
      title: 'दुबई डिजिटल मार्केटिंग एजेंसी | Metropolitan',
      description: 'दुबई की प्रमुख डिजिटल मार्केटिंग एजेंसी। सिनेमाई वीडियो प्रोडक्शन, 3D एनिमेशन, CGI, सोशल मीडिया विज्ञापन और AI क्रिएटिव सॉल्यूशन। 15+ वर्षों की उत्कृष्टता।',
    },
    es: {
      title: 'Agencia Marketing Digital Dubái | Metropolitan',
      description: 'Agencia de marketing digital líder en Dubái. Producción de video cinematográfico, animación 3D, CGI, publicidad en redes sociales y soluciones creativas con IA. Más de 15 años.',
    },
    'nl-BE': {
      title: 'Digitaal Marketingbureau Dubai | Metropolitan',
      description: 'Toonaangevend digitaal marketingbureau in Dubai. Cinematografische videoproductie, 3D-animatie, CGI, social media adverteren en AI-creatieve oplossingen. 15+ jaar ervaring.',
    },
    pt: {
      title: 'Agência Marketing Digital Dubai | Metropolitan',
      description: 'Agência de marketing digital líder em Dubai. Produção de vídeo cinematográfico, animação 3D, CGI, publicidade em redes sociais e soluções criativas com IA. Mais de 15 anos.',
    },
    it: {
      title: 'Agenzia Marketing Digitale Dubai | Metropolitan',
      description: 'Agenzia di marketing digitale leader a Dubai. Produzione video cinematografica, animazione 3D, CGI, pubblicità sui social media e soluzioni creative con IA. Oltre 15 anni.',
    },
    tr: {
      title: 'Dubai Dijital Pazarlama Ajansı | Metropolitan',
      description: 'Dubai\'nin önde gelen dijital pazarlama ajansı. Sinematik video prodüksiyon, 3D animasyon, CGI, sosyal medya reklamcılığı ve yapay zeka yaratıcı çözümleri. 15+ yıllık deneyim.',
    },
    ko: {
      title: '두바이 디지털 마케팅 에이전시 | Metropolitan',
      description: '두바이 최고의 디지털 마케팅 에이전시. 영화 수준의 영상 제작, 3D 애니메이션, CGI, 소셜 미디어 광고 및 AI 크리에이티브 솔루션. 15년 이상의 탁월한 경험.',
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
    de: {
      title: 'Über uns | Metropolitan Digital Marketing Dubai',
      description: 'Erfahren Sie mehr über Metropolitan Digital Marketing — Dubais kreatives Produktionsstudio mit 15+ Jahren Erfahrung in Videoproduktion, CGI und digitalem Marketing.',
    },
    'zh-CN': {
      title: '关于我们 | Metropolitan 迪拜数字营销',
      description: '了解Metropolitan Digital Marketing——迪拜领先的创意制作工作室，拥有超过15年的电影级视频、CGI和数字营销经验。',
    },
    ja: {
      title: '会社概要 | Metropolitan Digital Marketing ドバイ',
      description: 'Metropolitan Digital Marketingについて — ドバイの映像制作スタジオ。15年以上の映画品質動画、CGI、デジタルマーケティングの実績。',
    },
    hi: {
      title: 'हमारे बारे में | Metropolitan Digital Marketing दुबई',
      description: 'Metropolitan Digital Marketing के बारे में जानें — दुबई का प्रमुख क्रिएटिव प्रोडक्शन स्टूडियो। 15+ वर्षों का सिनेमाई वीडियो, CGI और डिजिटल मार्केटिंग अनुभव।',
    },
    es: {
      title: 'Sobre Nosotros | Metropolitan Digital Marketing Dubái',
      description: 'Conoce Metropolitan Digital Marketing — estudio de producción creativa en Dubái con más de 15 años de experiencia en video cinematográfico, CGI y marketing digital.',
    },
    'nl-BE': {
      title: 'Over Ons | Metropolitan Digital Marketing Dubai',
      description: 'Leer meer over Metropolitan Digital Marketing — Dubai\'s creatieve productiestudio met 15+ jaar ervaring in cinematografische video, CGI en digitale marketing.',
    },
    pt: {
      title: 'Sobre Nós | Metropolitan Digital Marketing Dubai',
      description: 'Conheça a Metropolitan Digital Marketing — estúdio de produção criativa em Dubai com mais de 15 anos de experiência em vídeo cinematográfico, CGI e marketing digital.',
    },
    it: {
      title: 'Chi Siamo | Metropolitan Digital Marketing Dubai',
      description: 'Scopri Metropolitan Digital Marketing — studio di produzione creativa a Dubai con oltre 15 anni di esperienza in video cinematografico, CGI e marketing digitale.',
    },
    tr: {
      title: 'Hakkımızda | Metropolitan Digital Marketing Dubai',
      description: 'Metropolitan Digital Marketing hakkında bilgi edinin — Dubai\'nin yaratıcı prodüksiyon stüdyosu. 15+ yıllık sinematik video, CGI ve dijital pazarlama deneyimi.',
    },
    ko: {
      title: '회사 소개 | Metropolitan Digital Marketing 두바이',
      description: 'Metropolitan Digital Marketing 소개 — 두바이의 크리에이티브 프로덕션 스튜디오. 15년 이상의 영화 수준 영상, CGI 및 디지털 마케팅 경험.',
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
    de: {
      title: 'Kreativleistungen Dubai | Metropolitan Digital',
      description: '19 kreative Disziplinen: Social-Media-Werbung, Filmproduktion, 3D-Animation, CGI, VFX, KI-Inhalte, Influencer-Marketing und mehr. Dubais Full-Service-Studio.',
    },
    'zh-CN': {
      title: '迪拜创意服务 | Metropolitan Digital',
      description: '19项创意服务：社交媒体广告、电影级视频制作、3D动画、CGI、视觉特效、AI内容创作、网红营销等。迪拜全方位创意制作工作室。',
    },
    ja: {
      title: 'ドバイのクリエイティブサービス | Metropolitan',
      description: '19のクリエイティブ分野：SNS広告、映画品質動画制作、3Dアニメーション、CGI、VFX、AIコンテンツ、インフルエンサーマーケティングなど。ドバイのフルサービス制作会社。',
    },
    hi: {
      title: 'दुबई क्रिएटिव सर्विसेज | Metropolitan Digital',
      description: '19 क्रिएटिव डिसिप्लिन: सोशल मीडिया विज्ञापन, सिनेमाई वीडियो प्रोडक्शन, 3D एनिमेशन, CGI, VFX, AI कंटेंट, इन्फ्लुएंसर मार्केटिंग और बहुत कुछ। दुबई का फुल-सर्विस स्टूडियो।',
    },
    es: {
      title: 'Servicios Creativos Dubái | Metropolitan Digital',
      description: '19 disciplinas creativas: publicidad en redes sociales, producción de video cinematográfico, animación 3D, CGI, VFX, contenido IA y marketing de influencers en Dubái.',
    },
    'nl-BE': {
      title: 'Creatieve Diensten Dubai | Metropolitan Digital',
      description: '19 creatieve disciplines: social media adverteren, cinematografische videoproductie, 3D-animatie, CGI, VFX, AI-content en influencer marketing. Dubai\'s full-service studio.',
    },
    pt: {
      title: 'Serviços Criativos Dubai | Metropolitan Digital',
      description: '19 disciplinas criativas: publicidade em redes sociais, produção de vídeo cinematográfico, animação 3D, CGI, VFX, conteúdo IA e marketing de influenciadores em Dubai.',
    },
    it: {
      title: 'Servizi Creativi Dubai | Metropolitan Digital',
      description: '19 discipline creative: pubblicità sui social media, produzione video cinematografica, animazione 3D, CGI, VFX, contenuti IA e influencer marketing a Dubai.',
    },
    tr: {
      title: 'Dubai Yaratıcı Hizmetler | Metropolitan Digital',
      description: '19 yaratıcı disiplin: sosyal medya reklamcılığı, sinematik video prodüksiyon, 3D animasyon, CGI, VFX, yapay zeka içeriği ve influencer pazarlama. Dubai\'nin tam hizmet stüdyosu.',
    },
    ko: {
      title: '두바이 크리에이티브 서비스 | Metropolitan Digital',
      description: '19가지 크리에이티브 분야: 소셜 미디어 광고, 영화 수준 영상 제작, 3D 애니메이션, CGI, VFX, AI 콘텐츠, 인플루언서 마케팅 등. 두바이의 풀서비스 스튜디오.',
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
    de: {
      title: 'Branchen | Metropolitan Digital Marketing Dubai',
      description: 'Kreative Marketinglösungen für 18 Branchen: Luxusautos, Gesundheitswesen, Hotellerie, Immobilien, Beauty, Mode und Technologie. Standort Dubai, VAE.',
    },
    'zh-CN': {
      title: '服务行业 | Metropolitan 迪拜',
      description: '为18个行业提供创意营销解决方案：豪华汽车、医疗健康、酒店业、房地产、美容、时尚和科技。总部位于迪拜，阿联酋。',
    },
    ja: {
      title: '対応業界 | Metropolitan Digital Marketing ドバイ',
      description: '18業界向けクリエイティブマーケティング：高級自動車、医療、ホスピタリティ、不動産、美容、ファッション、テクノロジー。ドバイ、UAE拠点。',
    },
    hi: {
      title: 'हम जिन उद्योगों की सेवा करते हैं | Metropolitan दुबई',
      description: '18 उद्योगों के लिए क्रिएटिव मार्केटिंग समाधान: लक्जरी ऑटोमोटिव, हेल्थकेयर, हॉस्पिटैलिटी, रियल एस्टेट, ब्यूटी, फैशन और टेक्नोलॉजी। दुबई, UAE।',
    },
    es: {
      title: 'Industrias que Servimos | Metropolitan Dubái',
      description: 'Soluciones de marketing creativo para 18 industrias: automoción de lujo, salud, hostelería, inmobiliaria, belleza, moda y tecnología. Con sede en Dubái, EAU.',
    },
    'nl-BE': {
      title: 'Sectoren die wij bedienen | Metropolitan Dubai',
      description: 'Creatieve marketingoplossingen voor 18 sectoren: luxe automotive, gezondheidszorg, horeca, vastgoed, beauty, mode en technologie. Gevestigd in Dubai, VAE.',
    },
    pt: {
      title: 'Indústrias que Servimos | Metropolitan Dubai',
      description: 'Soluções de marketing criativo para 18 indústrias: automóveis de luxo, saúde, hotelaria, imobiliário, beleza, moda e tecnologia. Sediada em Dubai, EAU.',
    },
    it: {
      title: 'Settori che Serviamo | Metropolitan Dubai',
      description: 'Soluzioni di marketing creativo per 18 settori: automotive di lusso, sanità, ospitalità, immobiliare, bellezza, moda e tecnologia. Con sede a Dubai, EAU.',
    },
    tr: {
      title: 'Hizmet Verdiğimiz Sektörler | Metropolitan Dubai',
      description: '18 sektör için yaratıcı pazarlama çözümleri: lüks otomotiv, sağlık, konaklama, gayrimenkul, güzellik, moda ve teknoloji. Dubai, BAE merkezli.',
    },
    ko: {
      title: '서비스 산업 | Metropolitan 두바이',
      description: '18개 산업을 위한 크리에이티브 마케팅 솔루션: 럭셔리 자동차, 의료, 호스피탈리티, 부동산, 뷰티, 패션, 기술. 두바이, UAE 기반.',
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
    de: {
      title: 'Kreativportfolio | Metropolitan Digital Dubai',
      description: 'Entdecken Sie unser Portfolio: Kinofilm, 3D-CGI, Automobilkampagnen, Luxushotels, medizinische Inhalte, Immobilien und KI-Produktion. Kreativstudio Dubai.',
    },
    'zh-CN': {
      title: '创意作品集 | Metropolitan 迪拜',
      description: '探索我们的创意作品集：电影级视频、3D CGI、汽车广告、豪华酒店、医疗内容、房地产和AI制作。迪拜创意制作工作室。',
    },
    ja: {
      title: 'クリエイティブポートフォリオ | Metropolitan ドバイ',
      description: '制作実績をご覧ください：映画品質動画、3D CGI、自動車キャンペーン、高級ホテル、医療コンテンツ、不動産、AI制作。ドバイのクリエイティブスタジオ。',
    },
    hi: {
      title: 'क्रिएटिव पोर्टफोलियो | Metropolitan दुबई',
      description: 'हमारा क्रिएटिव पोर्टफोलियो देखें: सिनेमाई वीडियो, 3D CGI, ऑटोमोटिव कैंपेन, लक्जरी होटल, मेडिकल कंटेंट, रियल एस्टेट और AI प्रोडक्शन। दुबई क्रिएटिव स्टूडियो।',
    },
    es: {
      title: 'Portfolio Creativo | Metropolitan Digital Dubái',
      description: 'Explora nuestro portfolio: video cinematográfico, CGI 3D, campañas de automoción, hoteles de lujo, contenido médico, inmobiliaria y producción con IA. Estudio en Dubái.',
    },
    'nl-BE': {
      title: 'Creatief Portfolio | Metropolitan Digital Dubai',
      description: 'Bekijk ons portfolio: cinematografische video, 3D CGI, automotive campagnes, luxe hotels, medische content, vastgoed en AI-productie. Creatief studio in Dubai.',
    },
    pt: {
      title: 'Portfólio Criativo | Metropolitan Digital Dubai',
      description: 'Explore nosso portfólio: vídeo cinematográfico, CGI 3D, campanhas automotivas, hotéis de luxo, conteúdo médico, imobiliário e produção com IA. Estúdio em Dubai.',
    },
    it: {
      title: 'Portfolio Creativo | Metropolitan Digital Dubai',
      description: 'Esplora il nostro portfolio: video cinematografico, CGI 3D, campagne automotive, hotel di lusso, contenuti medici, immobiliare e produzione IA. Studio a Dubai.',
    },
    tr: {
      title: 'Yaratıcı Portföy | Metropolitan Digital Dubai',
      description: 'Portföyümüzü keşfedin: sinematik video, 3D CGI, otomotiv kampanyaları, lüks oteller, tıbbi içerik, gayrimenkul ve yapay zeka prodüksiyonu. Dubai yaratıcı stüdyosu.',
    },
    ko: {
      title: '크리에이티브 포트폴리오 | Metropolitan 두바이',
      description: '포트폴리오를 살펴보세요: 영화 수준 영상, 3D CGI, 자동차 캠페인, 럭셔리 호텔, 의료 콘텐츠, 부동산 및 AI 제작. 두바이 크리에이티브 스튜디오.',
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
    de: {
      title: 'Kontakt | Metropolitan Digital Marketing Dubai',
      description: 'Starten Sie Ihr Projekt mit Metropolitan Digital Marketing. Kontaktieren Sie unser Team in Dubai für Videoproduktion, Social Media, 3D-Animation und CGI.',
    },
    'zh-CN': {
      title: '联系我们 | Metropolitan Digital Marketing 迪拜',
      description: '与Metropolitan Digital Marketing开始您的项目。联系我们的迪拜团队，咨询电影级视频、社交媒体、3D动画和CGI服务。',
    },
    ja: {
      title: 'お問い合わせ | Metropolitan Digital Marketing ドバイ',
      description: 'Metropolitan Digital Marketingとプロジェクトを始めましょう。映画品質動画、SNS、3Dアニメーション、CGIについてドバイチームにお問い合わせください。',
    },
    hi: {
      title: 'संपर्क करें | Metropolitan Digital Marketing दुबई',
      description: 'Metropolitan Digital Marketing के साथ अपना प्रोजेक्ट शुरू करें। सिनेमाई वीडियो, सोशल मीडिया, 3D एनिमेशन और CGI के लिए हमारी दुबई टीम से संपर्क करें।',
    },
    es: {
      title: 'Contáctenos | Metropolitan Digital Marketing Dubái',
      description: 'Inicia tu proyecto con Metropolitan Digital Marketing. Contacta a nuestro equipo en Dubái para video cinematográfico, redes sociales, animación 3D y CGI.',
    },
    'nl-BE': {
      title: 'Neem Contact Op | Metropolitan Digital Marketing Dubai',
      description: 'Start uw project met Metropolitan Digital Marketing. Neem contact op met ons Dubai-team voor cinematografische video, social media, 3D-animatie en CGI.',
    },
    pt: {
      title: 'Contacte-nos | Metropolitan Digital Marketing Dubai',
      description: 'Inicie o seu projeto com a Metropolitan Digital Marketing. Contacte a nossa equipa em Dubai para vídeo cinematográfico, redes sociais, animação 3D e CGI.',
    },
    it: {
      title: 'Contattaci | Metropolitan Digital Marketing Dubai',
      description: 'Inizia il tuo progetto con Metropolitan Digital Marketing. Contatta il nostro team a Dubai per video cinematografico, social media, animazione 3D e CGI.',
    },
    tr: {
      title: 'İletişim | Metropolitan Digital Marketing Dubai',
      description: 'Metropolitan Digital Marketing ile projenize başlayın. Sinematik video, sosyal medya, 3D animasyon ve CGI için Dubai ekibimizle iletişime geçin.',
    },
    ko: {
      title: '문의하기 | Metropolitan Digital Marketing 두바이',
      description: 'Metropolitan Digital Marketing과 프로젝트를 시작하세요. 영화 수준 영상, 소셜 미디어, 3D 애니메이션, CGI 문의를 위해 두바이 팀에 연락하세요.',
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
    de: {
      title: 'Luxusmarken-Marketing Dubai | Metropolitan',
      description: 'Kinematografische Werbung, CGI, 3D-Animation und Produktfotografie für Luxusuhren, Feinschmuck und exklusive Düfte. Dubais Premium-Marketingstudio.',
    },
    'zh-CN': {
      title: '奢侈品牌营销迪拜 | Metropolitan',
      description: '为豪华腕表、精品珠宝和独家香水提供电影级广告、CGI、3D动画和产品摄影服务。迪拜顶级奢侈品营销工作室。',
    },
    ja: {
      title: 'ラグジュアリーブランドマーケティング ドバイ | Metropolitan',
      description: '高級時計、ファインジュエリー、エクスクルーシブフレグランス向けの映画品質広告、CGI、3Dアニメーション、製品撮影。ドバイのプレミアムスタジオ。',
    },
    hi: {
      title: 'लक्जरी ब्रांड मार्केटिंग दुबई | Metropolitan',
      description: 'लक्जरी घड़ियों, फाइन ज्वेलरी और एक्सक्लूसिव परफ्यूम के लिए सिनेमाई विज्ञापन, CGI, 3D एनिमेशन और प्रोडक्ट फोटोग्राफी। दुबई का प्रीमियम लक्जरी मार्केटिंग स्टूडियो।',
    },
    es: {
      title: 'Marketing Marcas de Lujo Dubái | Metropolitan',
      description: 'Publicidad cinematográfica, CGI, animación 3D y fotografía de producto para relojes de lujo, joyería fina y fragancias exclusivas. Estudio premium en Dubái.',
    },
    'nl-BE': {
      title: 'Luxemerk Marketing Dubai | Metropolitan',
      description: 'Cinematografische reclame, CGI, 3D-animatie en productfotografie voor luxe horloges, fijne juwelen en exclusieve parfums. Dubai\'s premium luxe marketingstudio.',
    },
    pt: {
      title: 'Marketing Marcas de Luxo Dubai | Metropolitan',
      description: 'Publicidade cinematográfica, CGI, animação 3D e fotografia de produto para relógios de luxo, joalharia fina e fragrâncias exclusivas. Estúdio premium em Dubai.',
    },
    it: {
      title: 'Marketing Brand Lusso Dubai | Metropolitan',
      description: 'Pubblicità cinematografica, CGI, animazione 3D e fotografia prodotto per orologi di lusso, gioielleria fine e profumi esclusivi. Studio premium a Dubai.',
    },
    tr: {
      title: 'Lüks Marka Pazarlama Dubai | Metropolitan',
      description: 'Lüks saatler, ince mücevherler ve özel parfümler için sinematik reklam, CGI, 3D animasyon ve ürün fotoğrafçılığı. Dubai\'nin premium lüks pazarlama stüdyosu.',
    },
    ko: {
      title: '럭셔리 브랜드 마케팅 두바이 | Metropolitan',
      description: '럭셔리 시계, 파인 주얼리, 독점 향수를 위한 영화 수준 광고, CGI, 3D 애니메이션 및 제품 사진. 두바이 프리미엄 럭셔리 마케팅 스튜디오.',
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
