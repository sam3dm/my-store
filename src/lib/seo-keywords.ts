/**
 * Multilingual search keywords for Metropolitan Digital Marketing (Dubai / UAE).
 *
 * Terms are stored once per concept in the nine site languages and then combined with the seven
 * emirates (+ Al Ain and "UAE") into the long-tail searches people really type, such as
 * "content creation in Sharjah" or "صناعة المحتوى في أم القيوين". They are published only as page
 * metadata and structured data (meta keywords + schema.org JSON-LD) — never as hidden page text,
 * which search engines penalise.
 */
import type { LangCode } from './seo-meta';

/** Order of every row below. */
export const KEYWORD_LANGS: LangCode[] = ['en', 'ar', 'ru', 'zh-CN', 'tr', 'fr', 'it', 'es', 'hi'];
type Row = readonly [string, string, string, string, string, string, string, string, string];
const idx = (lang: string) => Math.max(0, KEYWORD_LANGS.indexOf(lang as LangCode));

/** Brand name as people write it in each language. */
export const BRAND_NAMES: Row[] = [
  ['Metropolitan Digital Marketing', 'متروبوليتان ديجيتال ماركتينج', 'Метрополитан Диджитал Маркетинг', '大都会数字营销', 'Metropolitan Dijital Pazarlama', 'Metropolitan Marketing Digital', 'Metropolitan Marketing Digitale', 'Metropolitan Marketing Digital', 'मेट्रोपॉलिटन डिजिटल मार्केटिंग'],
  ['Metropolitan Digital Marketing Dubai', 'ميتروبوليتان للتسويق الإلكتروني دبي', 'Metropolitan Digital Marketing Дубай', '迪拜大都会数字营销公司', 'Metropolitan Dubai Dijital Pazarlama Ajansı', 'Metropolitan Digital Marketing Dubaï', 'Metropolitan Digital Marketing Dubai', 'Metropolitan Digital Marketing Dubái', 'मेट्रोपॉलिटन डिजिटल मार्केटिंग दुबई'],
  ['Metropolitan Dubai agency', 'شركة ميتروبوليتان دبي', 'агентство Метрополитан Дубай', '大都会迪拜公司', 'Metropolitan Dubai ajansı', 'agence Metropolitan Dubaï', 'agenzia Metropolitan Dubai', 'agencia Metropolitan Dubái', 'मेट्रोपॉलिटन दुबई एजेंसी'],
];

/** Services, skills and what we make. */
export const SERVICE_TERMS: Row[] = [
  ['digital marketing', 'التسويق الإلكتروني', 'цифровой маркетинг', '数字营销', 'dijital pazarlama', 'marketing digital', 'marketing digitale', 'marketing digital', 'डिजिटल मार्केटिंग'],
  ['content creation', 'صناعة المحتوى', 'создание контента', '内容制作', 'içerik üretimi', 'création de contenu', 'creazione di contenuti', 'creación de contenido', 'कंटेंट क्रिएशन'],
  ['social media management', 'إدارة وسائل التواصل الاجتماعي', 'ведение социальных сетей', '社交媒体运营', 'sosyal medya yönetimi', 'gestion des réseaux sociaux', 'gestione dei social media', 'gestión de redes sociales', 'सोशल मीडिया मैनेजमेंट'],
  ['cinematic filming', 'تصوير سينمائي', 'кинематографическая съёмка', '电影级拍摄', 'sinematik çekim', 'tournage cinématographique', 'riprese cinematografiche', 'filmación cinematográfica', 'सिनेमाई शूटिंग'],
  ['video production', 'إنتاج الفيديو', 'видеопродакшн', '视频制作', 'video prodüksiyon', 'production vidéo', 'produzione video', 'producción de video', 'वीडियो प्रोडक्शन'],
  ['film directing', 'الإخراج', 'режиссура', '导演', 'yönetmenlik', 'réalisation', 'regia', 'dirección', 'निर्देशन'],
  ['video editing and montage', 'المونتاج', 'видеомонтаж', '视频剪辑', 'video kurgu', 'montage vidéo', 'montaggio video', 'edición y montaje de video', 'वीडियो एडिटिंग'],
  ['3D animation', 'رسوم متحركة ثلاثية الأبعاد', '3D-анимация', '3D动画', '3D animasyon', 'animation 3D', 'animazione 3D', 'animación 3D', '3D एनीमेशन'],
  ['artificial intelligence', 'الذكاء الاصطناعي', 'искусственный интеллект', '人工智能', 'yapay zekâ', 'intelligence artificielle', 'intelligenza artificiale', 'inteligencia artificial', 'आर्टिफिशियल इंटेलिजेंस'],
  ['AI video production', 'صناعة فيديوهات بالذكاء الاصطناعي', 'создание видео с помощью ИИ', 'AI视频制作', 'yapay zekâ ile video üretimi', 'production vidéo par IA', 'produzione video con IA', 'producción de video con IA', 'AI वीडियो निर्माण'],
  ['chatbot development', 'برمجة تشات بوت', 'разработка чат-ботов', '聊天机器人开发', 'chatbot geliştirme', 'développement de chatbot', 'sviluppo di chatbot', 'desarrollo de chatbots', 'चैटबॉट डेवलपमेंट'],
  ['website development', 'برمجة مواقع الإنترنت', 'разработка сайтов', '网站开发', 'web sitesi geliştirme', 'développement de sites web', 'sviluppo siti web', 'desarrollo de sitios web', 'वेबसाइट डेवलपमेंट'],
  ['advertising campaigns', 'الحملات الإعلانية', 'рекламные кампании', '广告营销活动', 'reklam kampanyaları', 'campagnes publicitaires', 'campagne pubblicitarie', 'campañas publicitarias', 'विज्ञापन अभियान'],
  ['creative production agency', 'وكالة إنتاج إبداعي', 'креативное продакшн-агентство', '创意制作公司', 'yaratıcı prodüksiyon ajansı', 'agence de production créative', 'agenzia di produzione creativa', 'agencia de producción creativa', 'क्रिएटिव प्रोडक्शन एजेंसी'],
  ['3D scene building', 'بناء مشاهد ثلاثية الأبعاد', 'создание 3D-сцен', '3D场景搭建', '3D sahne oluşturma', 'création de scènes 3D', 'creazione di scene 3D', 'creación de escenas 3D', '3D सीन निर्माण'],
  ['visual effects (VFX)', 'المؤثرات البصرية', 'визуальные эффекты (VFX)', '视觉特效', 'görsel efektler (VFX)', 'effets visuels (VFX)', 'effetti visivi (VFX)', 'efectos visuales (VFX)', 'विज़ुअल इफेक्ट्स (VFX)'],
  ['cinematic effects and film tricks', 'خدع سينمائية ومؤثرات أفلام', 'кинотрюки и спецэффекты', '电影特效', 'sinema efektleri ve film hileleri', 'trucages et effets de cinéma', 'effetti speciali cinematografici', 'efectos especiales de cine', 'सिनेमाई इफेक्ट्स'],
  ['professional cameras', 'كاميرات احترافية', 'профессиональные камеры', '专业摄像设备', 'profesyonel kameralar', 'caméras professionnelles', 'telecamere professionali', 'cámaras profesionales', 'प्रोफेशनल कैमरे'],
  ['sound systems', 'أنظمة الصوت (ساوند سيستم)', 'звуковые системы', '音响系统', 'ses sistemi', 'systèmes de sonorisation', 'impianti audio', 'sistemas de sonido', 'साउंड सिस्टम'],
  ['camera cranes', 'كرينات التصوير', 'операторские краны', '摄影摇臂', 'kamera vinçleri', 'grues de caméra', 'gru per telecamere', 'grúas de cámara', 'कैमरा क्रेन'],
  ['events and parties', 'حفلات وإيفنتات', 'мероприятия и вечеринки', '活动与派对', 'etkinlik ve partiler', 'événements et soirées', 'eventi e feste', 'eventos y fiestas', 'इवेंट्स और पार्टियाँ'],
  ['conference filming', 'تصوير المؤتمرات', 'съёмка конференций', '会议拍摄', 'konferans çekimi', 'tournage de conférences', 'riprese di conferenze', 'filmación de conferencias', 'कॉन्फ़्रेंस शूटिंग'],
  ['medical conference filming', 'تصوير المؤتمرات الطبية', 'съёмка медицинских конференций', '医学会议拍摄', 'tıbbi konferans çekimi', 'tournage de congrès médicaux', 'riprese di congressi medici', 'filmación de congresos médicos', 'मेडिकल कॉन्फ़्रेंस शूटिंग'],
  ['government conference filming', 'تصوير المؤتمرات الحكومية', 'съёмка государственных конференций', '政府会议拍摄', 'devlet konferansı çekimi', 'tournage de conférences gouvernementales', 'riprese di conferenze governative', 'filmación de conferencias gubernamentales', 'सरकारी कॉन्फ़्रेंस शूटिंग'],
  ['creative content', 'محتوى إبداعي', 'креативный контент', '创意内容', 'yaratıcı içerik', 'contenu créatif', 'contenuti creativi', 'contenido creativo', 'क्रिएटिव कंटेंट'],
  ['content creators', 'صنّاع المحتوى', 'контент-мейкеры', '内容创作者', 'içerik üreticileri', 'créateurs de contenu', 'content creator', 'creadores de contenido', 'कंटेंट क्रिएटर्स'],
  ['professional photographers', 'مصورون محترفون', 'профессиональные фотографы', '专业摄影师', 'profesyonel fotoğrafçılar', 'photographes professionnels', 'fotografi professionisti', 'fotógrafos profesionales', 'प्रोफेशनल फोटोग्राफर'],
  ['podcast production', 'إنتاج البودكاست', 'производство подкастов', '播客制作', 'podcast prodüksiyonu', 'production de podcasts', 'produzione di podcast', 'producción de podcasts', 'पॉडकास्ट प्रोडक्शन'],
  ['TV content production', 'صناعة المحتوى التلفزيوني', 'производство телевизионного контента', '电视内容制作', 'televizyon içerik üretimi', 'production de contenu télévisé', 'produzione di contenuti televisivi', 'producción de contenido televisivo', 'टीवी कंटेंट निर्माण'],
  ['celebrity and influencer marketing', 'تسويق المشاهير والمؤثرين', 'маркетинг со знаменитостями и инфлюенсерами', '明星与网红营销', 'ünlü ve influencer pazarlaması', "marketing de célébrités et d'influenceurs", 'marketing con celebrity e influencer', 'marketing con celebridades e influencers', 'सेलिब्रिटी और इन्फ्लुएंसर मार्केटिंग'],
  ['celebrity filming', 'تصوير المشاهير', 'съёмка знаменитостей', '名人拍摄', 'ünlü çekimi', 'tournage de célébrités', 'riprese di celebrity', 'filmación de celebridades', 'सेलिब्रिटी शूटिंग'],
  ['CRM and WhatsApp automation', 'أتمتة واتساب وأنظمة CRM', 'автоматизация WhatsApp и CRM', 'WhatsApp自动化与CRM', 'WhatsApp otomasyonu ve CRM', 'automatisation WhatsApp et CRM', 'automazione WhatsApp e CRM', 'automatización de WhatsApp y CRM', 'WhatsApp ऑटोमेशन और CRM'],
  ['AI agents for business', 'وكلاء الذكاء الاصطناعي للشركات', 'ИИ-агенты для бизнеса', '企业AI智能体', 'işletmeler için yapay zekâ ajanları', 'agents IA pour entreprises', 'agenti IA per le aziende', 'agentes de IA para empresas', 'व्यवसाय के लिए AI एजेंट'],
  ['branding and logo design', 'تصميم الهوية البصرية والشعارات', 'брендинг и дизайн логотипа', '品牌与标志设计', 'marka kimliği ve logo tasarımı', 'branding et création de logo', 'branding e design del logo', 'branding y diseño de logotipos', 'ब्रांडिंग और लोगो डिज़ाइन'],
  ['commercial photography', 'التصوير التجاري', 'коммерческая фотосъёмка', '商业摄影', 'ticari fotoğrafçılık', 'photographie commerciale', 'fotografia commerciale', 'fotografía comercial', 'कमर्शियल फ़ोटोग्राफ़ी'],
];

/** Sectors we create content for. */
export const SECTOR_TERMS: Row[] = [
  ['perfume photography and content', 'تصوير وصناعة محتوى العطور', 'съёмка и контент для парфюмерии', '香水摄影与内容制作', 'parfüm çekimi ve içerik', 'photographie et contenu pour parfums', 'fotografia e contenuti per profumi', 'fotografía y contenido para perfumes', 'परफ्यूम फ़ोटोग्राफ़ी और कंटेंट'],
  ['car advertising and filming', 'تصوير وإعلانات السيارات', 'реклама и съёмка автомобилей', '汽车广告与拍摄', 'otomobil reklamı ve çekimi', 'publicité et tournage automobile', 'pubblicità e riprese automobilistiche', 'publicidad y filmación de automóviles', 'कार विज्ञापन और शूटिंग'],
  ['restaurant content creation', 'صناعة محتوى للمطاعم', 'контент для ресторанов', '餐厅内容制作', 'restoranlar için içerik üretimi', 'création de contenu pour restaurants', 'contenuti per ristoranti', 'contenido para restaurantes', 'रेस्तरां के लिए कंटेंट'],
  ['content for clinics', 'صناعة محتوى للعيادات', 'контент для клиник', '诊所内容制作', 'klinikler için içerik', 'contenu pour cliniques', 'contenuti per cliniche', 'contenido para clínicas', 'क्लिनिक के लिए कंटेंट'],
  ['hospital content creation', 'صناعة محتوى للمستشفيات والمشافي', 'контент для больниц', '医院内容制作', 'hastaneler için içerik', 'contenu pour hôpitaux', 'contenuti per ospedali', 'contenido para hospitales', 'अस्पतालों के लिए कंटेंट'],
  ['medical center marketing', 'تسويق المراكز الطبية', 'маркетинг медицинских центров', '医疗中心营销', 'tıp merkezi pazarlaması', 'marketing pour centres médicaux', 'marketing per centri medici', 'marketing para centros médicos', 'मेडिकल सेंटर मार्केटिंग'],
  ['dental clinic marketing', 'تسويق عيادات الأسنان', 'маркетинг стоматологических клиник', '牙科诊所营销', 'diş kliniği pazarlaması', 'marketing pour cliniques dentaires', 'marketing per studi dentistici', 'marketing para clínicas dentales', 'डेंटल क्लिनिक मार्केटिंग'],
  ['car rental marketing', 'تسويق محلات تأجير السيارات', 'маркетинг для компаний проката авто', '租车公司营销', 'araç kiralama pazarlaması', 'marketing pour location de voitures', 'marketing per autonoleggi', 'marketing para alquiler de coches', 'कार रेंटल मार्केटिंग'],
  ['shopping mall marketing', 'تسويق المولات ومراكز التسوق', 'маркетинг торговых центров', '购物中心营销', 'alışveriş merkezi pazarlaması', 'marketing pour centres commerciaux', 'marketing per centri commerciali', 'marketing para centros comerciales', 'शॉपिंग मॉल मार्केटिंग'],
  ['corporate content production', 'صناعة محتوى للشركات', 'корпоративный контент', '企业内容制作', 'kurumsal içerik üretimi', "contenu d'entreprise", 'contenuti aziendali', 'contenido corporativo', 'कॉर्पोरेट कंटेंट'],
  ['real estate content and filming', 'صناعة وتصوير محتوى للعقارات (ريال استيت)', 'контент и съёмка для недвижимости', '房地产内容与拍摄', 'emlak içerik ve çekim', 'contenu et tournage immobilier', 'contenuti e riprese immobiliari', 'contenido y filmación inmobiliaria', 'रियल एस्टेट कंटेंट और शूटिंग'],
  ['airport content production', 'صناعة محتوى للمطارات', 'контент для аэропортов', '机场内容制作', 'havalimanları için içerik', 'contenu pour aéroports', 'contenuti per aeroporti', 'contenido para aeropuertos', 'एयरपोर्ट कंटेंट'],
  ['government content management', 'إدارة محتوى الجهات الحكومية', 'контент для государственных организаций', '政府机构内容管理', 'kamu kurumları için içerik yönetimi', 'gestion de contenu pour entités gouvernementales', 'gestione contenuti per enti governativi', 'gestión de contenido para entidades gubernamentales', 'सरकारी विभागों के लिए कंटेंट प्रबंधन'],
  ['large campaigns for international companies', 'حملات إعلانية كبرى للشركات العالمية', 'масштабные кампании для международных компаний', '国际企业大型营销活动', 'uluslararası şirketler için büyük kampanyalar', 'grandes campagnes pour entreprises internationales', 'grandi campagne per aziende internazionali', 'grandes campañas para empresas internacionales', 'अंतरराष्ट्रीय कंपनियों के लिए बड़े अभियान'],
  ['luxury brand advertising', 'إعلانات العلامات الفاخرة', 'реклама люксовых брендов', '奢侈品牌广告', 'lüks marka reklamcılığı', 'publicité pour marques de luxe', 'pubblicità per marchi di lusso', 'publicidad para marcas de lujo', 'लग्ज़री ब्रांड विज्ञापन'],
  ['hotel and resort marketing', 'تسويق الفنادق والمنتجعات', 'маркетинг отелей и курортов', '酒店与度假村营销', 'otel ve tatil köyü pazarlaması', "marketing pour hôtels et resorts", 'marketing per hotel e resort', 'marketing para hoteles y resorts', 'होटल और रिसॉर्ट मार्केटिंग'],
  ['fashion content and photography', 'محتوى وتصوير الأزياء', 'контент и съёмка моды', '时尚内容与摄影', 'moda içerik ve fotoğraf çekimi', 'contenu et photographie de mode', 'contenuti e fotografia di moda', 'contenido y fotografía de moda', 'फ़ैशन कंटेंट और फ़ोटोग्राफ़ी'],
];

/** Production software people search for — the same in every language. */
export const TOOL_TERMS = ['3ds Max', 'Maya', 'Blender', 'Cinema 4D', 'Unreal Engine', 'After Effects', 'Premiere Pro', 'DaVinci Resolve', 'Houdini', 'ZBrush', 'Substance Painter', 'Midjourney', 'Runway', 'Sora', 'Veo'];

/** Place names: the full "in …" phrase for each language (so grammar stays correct). */
interface Place {
  name: string;
  /** [en, ar, ru, zh-CN, tr, fr, it, es, hi] */
  phrase: Row;
}
export const PLACES: Place[] = [
  { name: 'Dubai', phrase: ['in Dubai', 'في دبي', 'в Дубае', '迪拜', 'Dubai', 'à Dubaï', 'a Dubai', 'en Dubái', 'दुबई में'] },
  { name: 'Abu Dhabi', phrase: ['in Abu Dhabi', 'في أبوظبي', 'в Абу-Даби', '阿布扎比', 'Abu Dabi', 'à Abu Dhabi', 'ad Abu Dhabi', 'en Abu Dabi', 'अबू धाबी में'] },
  { name: 'Sharjah', phrase: ['in Sharjah', 'في الشارقة', 'в Шардже', '沙迦', 'Şarika', 'à Sharjah', 'a Sharjah', 'en Sharjah', 'शारजाह में'] },
  { name: 'Ajman', phrase: ['in Ajman', 'في عجمان', 'в Аджмане', '阿治曼', 'Accman', 'à Ajman', 'ad Ajman', 'en Ajmán', 'अजमान में'] },
  { name: 'Umm Al Quwain', phrase: ['in Umm Al Quwain', 'في أم القيوين', 'в Умм-эль-Кайвайне', '乌姆盖万', 'Ümmü Kayveyn', 'à Oumm al Qaïwaïn', 'a Umm Al Quwain', 'en Umm al Quwain', 'उम्म अल क्वैन में'] },
  { name: 'Ras Al Khaimah', phrase: ['in Ras Al Khaimah', 'في رأس الخيمة', 'в Рас-эль-Хайме', '哈伊马角', 'Ras El Haymah', 'à Ras el Khaïmah', 'a Ras Al Khaimah', 'en Ras al Khaimah', 'रास अल खैमाह में'] },
  { name: 'Fujairah', phrase: ['in Fujairah', 'في الفجيرة', 'в Фуджейре', '富查伊拉', 'Füceyre', 'à Fujaïrah', 'a Fujairah', 'en Fuyaira', 'फुजैराह में'] },
  { name: 'Al Ain', phrase: ['in Al Ain', 'في العين', 'в Эль-Айне', '艾因', 'Al Ain', 'à Al Aïn', 'ad Al Ain', 'en Al Ain', 'अल ऐन में'] },
  { name: 'UAE', phrase: ['in the UAE', 'في الإمارات', 'в ОАЭ', '阿联酋', 'BAE', 'aux Émirats arabes unis', 'negli Emirati Arabi Uniti', 'en los Emiratos Árabes Unidos', 'संयुक्त अरब अमीरात में'] },
];

const pick = (r: Row, lang: string) => r[idx(lang)]!;

/** "content creation" + "in Dubai" in the grammar of each language. */
export function withPlace(service: string, place: Place, lang: string): string {
  const ph = pick(place.phrase, lang);
  if (lang === 'zh-CN' || lang === 'tr') return `${ph}${lang === 'tr' ? ' ' : ''}${service}`;
  if (lang === 'hi') return `${ph} ${service}`;
  return `${service} ${ph}`;
}

const uniq = (a: string[]) => [...new Set(a.map((x) => x.trim()).filter(Boolean))];

/** Core terms for the `keywords` meta tag: brand, main services, sectors, tools and the top searches per emirate. */
export function metaKeywords(lang: string): string[] {
  const brands = BRAND_NAMES.map((r) => pick(r, lang));
  const services = SERVICE_TERMS.map((r) => pick(r, lang));
  const sectors = SECTOR_TERMS.map((r) => pick(r, lang));
  const top = SERVICE_TERMS.slice(0, 6).flatMap((r) => PLACES.slice(0, 5).map((p) => withPlace(pick(r, lang), p, lang)));
  const brandsAll = BRAND_NAMES.map((r) => r[0]!);
  return uniq([...brands, ...(lang === 'en' ? [] : brandsAll.slice(0, 1)), ...services, ...sectors, ...TOOL_TERMS.slice(0, 8), ...top]);
}

/** Large set for structured data: every service × every place, sectors × main places, and top terms in all other languages. */
export function structuredKeywords(lang: string): string[] {
  const own = SERVICE_TERMS.slice(0, 14).flatMap((r) => PLACES.map((p) => withPlace(pick(r, lang), p, lang)));
  const sectors = SECTOR_TERMS.flatMap((r) => PLACES.slice(0, 3).map((p) => withPlace(pick(r, lang), p, lang)));
  const crossLanguage = KEYWORD_LANGS.filter((l) => l !== lang).flatMap((l) => [
    ...BRAND_NAMES.slice(0, 2).map((r) => pick(r, l)),
    ...SERVICE_TERMS.slice(0, 8).map((r) => withPlace(pick(r, l), PLACES[0]!, l)),
  ]);
  return uniq([...metaKeywords(lang), ...own, ...sectors, ...TOOL_TERMS, ...crossLanguage]);
}

export const allBrandNames = (): string[] => uniq(BRAND_NAMES.flatMap((r) => [...r]));
export const knowsAbout = (lang: string): string[] => uniq([...SERVICE_TERMS.map((r) => pick(r, lang)), ...SECTOR_TERMS.map((r) => pick(r, lang)), ...TOOL_TERMS]);
export const placeNames = () => PLACES.map((p) => p.name);
