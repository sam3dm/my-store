/**
 * Conduct rules for the chatbot: what it refuses to discuss, what it never repeats, and what can
 * never be taken as a visitor's name. Matching is on whole words after Arabic/English normalisation.
 */
import { hasAny, normalize } from './text';

/** Explicit sexual content or sexual exploitation of anyone → always declined. */
const SEXUAL = [
  'sex', 'sexy', 'sexual', 'porn', 'porno', 'pornography', 'pornographic', 'xxx', 'erotic', 'nude', 'nudes', 'nudity', 'naked', 'topless', 'escort', 'escorts', 'prostitute', 'prostitution', 'brothel', 'onlyfans', 'adult content', 'adult film', 'adult films', 'adult movie', 'adult movies', 'adult video', 'adult videos', '18+', 'fetish', 'orgy', 'hooker', 'sex tape', 'sex video', 'sex movie', 'sex movies', 'stripper',
  'child porn', 'pedophile', 'pedophilia', 'paedophile', 'minors nude', 'incest', 'rape video', 'rape videos', 'rape porn', 'rape scene', 'rape scenes',
  'سكس', 'جنس', 'جنسي', 'جنسيه', 'افلام جنسيه', 'فيلم جنسي', 'محتوي جنسي', 'علاقات جنسيه', 'اباحي', 'اباحيه', 'افلام اباحيه', 'بورنو', 'بورن', 'عاري', 'عاريه', 'عاريات', 'عراه', 'عريان', 'عاريين', 'دعاره', 'عاهره', 'عاهرات', 'مومس', 'قحبه', 'شرموطه', 'نيك', 'منيوك', 'زب', 'كس', 'طيز', 'مص', 'ملهي ليلي', 'اطفال عراه', 'استغلال جنسي', 'افلام اغتصاب', 'فيديو اغتصاب', 'فيديوهات اغتصاب', 'مشاهد اغتصاب',
];

/** Other unlawful or harmful requests → declined, unless it is clearly an awareness / prevention campaign. */
const HARMFUL = [
  'child abuse', 'rape', 'raped', 'rapist', 'molest', 'molestation', 'murder', 'kill someone', 'terror', 'terrorism', 'terrorist', 'explosives', 'human trafficking', 'trafficking', 'money laundering', 'illegal', 'illegal drugs', 'drug dealing', 'cocaine', 'heroin', 'gambling', 'casino', 'betting',
  'اغتصاب', 'تحرش', 'استغلال اطفال', 'قتل شخص', 'ارهاب', 'ارهابي', 'متفجرات', 'مخدرات', 'حشيش', 'كوكايين', 'تهريب', 'غسيل اموال', 'قمار', 'مقامره', 'كازينو', 'مراهنات', 'غير قانوني', 'غير قانونيه', 'غير مشروع', 'لا اخلاقي', 'لا اخلاقيه', 'مخل بالاداب',
];

const AWARENESS = ['awareness', 'prevention', 'prevent', 'against', 'stop', 'fight', 'combat', 'safety', 'protect', 'protection', 'campaign against', 'توعيه', 'تثقيف', 'مكافحه', 'ضد', 'وقايه', 'حمايه', 'محاربه', 'التوعيه'];

export const UNLAWFUL = [...SEXUAL, ...HARMFUL];

/** Profanity and insults → never answered on their own terms, never repeated. */
export const PROFANITY = [
  'fuck', 'fucking', 'fucker', 'fck', 'f u', 'wtf', 'shit', 'bullshit', 'bitch', 'bitches', 'asshole', 'bastard', 'dick', 'dickhead', 'pussy', 'cunt', 'whore', 'slut', 'motherfucker', 'idiot', 'stupid', 'moron', 'dumb', 'useless', 'retard', 'loser', 'shut up', 'go to hell', 'screw you', 'piss off',
  'غبي', 'غبيه', 'ابن الكلب', 'يا كلب', 'ياكلب', 'انتم كلاب', 'انتم حمير', 'انتم اغبياء', 'انتم حيوانات', 'اغبياء', 'يا اغبياء', 'يا حمار', 'ياحمار', 'يا حيوان', 'ياحيوان', 'انت كلب', 'انت حمار', 'قتل شخص', 'اقتل', 'ابن الحرام', 'حقير', 'حقيره', 'وسخ', 'قذر', 'تافه', 'تافهه', 'لعنه', 'يلعن', 'اللعنه', 'خرا', 'زفت', 'متخلف', 'اخرس', 'اسكت', 'ابن القحبه', 'ياحمار', 'يا كلب', 'يا غبي', 'يا حيوان', 'تبا', 'سافل', 'ساقط', 'منحط',
];

export type Conduct = 'unlawful' | 'profanity' | null;

/** `q` is the normalised message. Unlawful content wins over profanity. */
const ALLOWED_CONTEXT = ['sexual health', 'sexual wellness', 'sex education', 'sexually transmitted', 'الصحه الجنسيه', 'التثقيف الجنسي', 'الامراض الجنسيه'];

export function checkConduct(q: string): Conduct {
  // Medical / educational wording is legitimate for our healthcare clients.
  const cleaned = ALLOWED_CONTEXT.reduce((acc, ph) => (hasAny(acc, [ph]) ? acc.replace(new RegExp(normalize(ph), 'g'), ' ') : acc), q);
  q = cleaned;
  if (hasAny(q, SEXUAL)) return 'unlawful';
  if (hasAny(q, HARMFUL) && !hasAny(q, AWARENESS)) return 'unlawful';
  if (hasAny(q, PROFANITY)) return 'profanity';
  return null;
}

/** Words that describe our business (or conversation) and can never be somebody's name. */
export const NOT_A_NAME = [
  'video', 'videos', 'movie', 'movies', 'film', 'films', 'photo', 'photos', 'photography', 'price', 'prices', 'service', 'services', 'marketing', 'social', 'media', 'design', 'designer', 'website', 'web', 'site', 'help', 'hello', 'hi', 'hey', 'thanks', 'thank', 'yes', 'no', 'ok', 'okay', 'sure', 'please', 'test', 'testing', 'bot', 'chatbot', 'admin', 'nothing', 'none', 'company', 'business', 'project', 'projects', 'quote', 'cost', 'contact', 'number', 'phone', 'mobile', 'email', 'whatsapp', 'instagram', 'tiktok', 'facebook', 'youtube', 'snapchat', 'dubai', 'abu dhabi', 'uae', 'saudi', 'qatar', 'ads', 'advertising', 'campaign', 'content', 'brand', 'logo', 'real', 'estate', 'restaurant', 'clinic', 'hotel',
  'نعم', 'لا', 'اوك', 'تمام', 'شكرا', 'مرحبا', 'اهلا', 'خدمه', 'خدمات', 'فيديو', 'فيديوهات', 'فيلم', 'افلام', 'صور', 'تصوير', 'سعر', 'اسعار', 'تصميم', 'موقع', 'مساعده', 'تجربه', 'اختبار', 'شركه', 'مشروع', 'مشاريع', 'دبي', 'ابوظبي', 'انستغرام', 'تيك توك', 'فيسبوك', 'يوتيوب', 'واتساب', 'تسويق', 'اعلان', 'اعلانات', 'محتوي', 'مطعم', 'عياده', 'فندق', 'عقار',
];

/** Does any word of the text mean it cannot be a name? */
export function isNotAName(q: string): boolean {
  return hasAny(q, NOT_A_NAME) || checkConduct(q) !== null;
}

/** A web address in a message (e-mail addresses are not links). */
export function hasLink(raw: string): boolean {
  const t = raw.replace(/\S+@\S+\.\S+/g, ' ');
  return /(https?:\/\/|ftp:\/\/|www\.|\b(t\.me|wa\.me|bit\.ly|tinyurl\.com|goo\.gl|discord\.gg)\/|\b[a-z0-9][a-z0-9-]{1,60}\.(com|net|org|io|ae|co|me|ru|cn|xyz|info|biz|shop|app|link|top|site|online|store|club|vip|tk|ml|ga|cf|gq)\b)/i.test(t);
}

/** Requests for credentials, technical access, or to change / publish / delete anything on the site. */
export const ACCESS_PROBE = [
  'username', 'user name', 'login details', 'log in details', 'login', 'credentials', 'cpanel', 'ftp', 'ssh', 'github', 'repository', 'source code', 'secret key', 'access token', 'backend', 'dashboard', 'admin panel', 'control panel', 'hosting account', 'server access', 'give me access', 'root access', 'sudo',
  'edit the website', 'edit the site', 'change the website', 'change the site', 'modify the website', 'modify the site', 'edit your website', 'delete the website', 'delete the site', 'delete images', 'delete the images', 'remove the images', 'change the content', 'change your content', 'edit content', 'update the website', 'update your site',
  'upload image', 'upload an image', 'upload a photo', 'upload a video', 'upload a file', 'add an image', 'add image', 'add a photo', 'add a link', 'add this link', 'post this link', 'post this on', 'publish this', 'publish my', 'publish on your site', 'publish on your website', 'post on your website', 'post on your site', 'put this on your site', 'put this on your website', 'write an article on your', 'hack', 'hacker', 'hacking', 'bypass', 'exploit', 'vulnerability', 'sql injection', 'xss', 'ddos', 'brute force',
  'يوزر', 'اسم المستخدم', 'اسم المستخدم والباسورد', 'باسورد', 'كلمه السر', 'كلمه المرور', 'بيانات الدخول', 'تسجيل الدخول', 'لوحه التحكم', 'لوحه الادمن', 'لوحه الادارة', 'الكود المصدري', 'سيرفر', 'استضافه الموقع', 'اعطني صلاحيه', 'صلاحيات',
  'عدل الموقع', 'عدل على الموقع', 'تعديل الموقع', 'تغيير الموقع', 'غير محتوي الموقع', 'غير المحتوي', 'عدل المحتوي', 'احذف الموقع', 'احذف الصور', 'امسح الصور', 'امسح الموقع', 'ارفع صوره', 'ارفع ملف', 'ارفع فيديو', 'رفع صوره', 'رفع ملف', 'اضف صوره', 'اضافه صوره', 'اضف رابط', 'اضافه رابط', 'انشر هذا', 'انشر الرابط', 'انشر على موقعكم', 'انشر في موقعكم', 'اكتب مقال في موقعكم', 'اختراق', 'اخترق', 'هاكر', 'ثغره', 'تجاوز الحمايه',
];
