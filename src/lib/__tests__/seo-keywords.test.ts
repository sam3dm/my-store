import { describe, expect, it } from 'vitest';
import { BRAND_NAMES, KEYWORD_LANGS, PLACES, SECTOR_TERMS, SERVICE_TERMS, TOOL_TERMS, metaKeywords, structuredKeywords, withPlace } from '../seo-keywords';

describe('multilingual SEO keywords', () => {
  it('has a non-empty term in all nine languages for every concept', () => {
    for (const row of [...BRAND_NAMES, ...SERVICE_TERMS, ...SECTOR_TERMS, ...PLACES.map((p) => p.phrase)]) {
      expect(row).toHaveLength(KEYWORD_LANGS.length);
      row.forEach((t) => expect(t.trim().length).toBeGreaterThan(1));
    }
  });

  it('covers the services and sectors the owner listed, in Arabic and English', () => {
    const en = structuredKeywords('en').join(' | ').toLowerCase();
    for (const t of ['digital marketing', 'content creation', 'cinematic filming', 'film directing', '3d animation', '3ds max', 'maya', 'blender', 'artificial intelligence', 'ai video production', 'chatbot development', 'website development', 'podcast', 'perfume', 'car advertising', 'restaurant', 'clinics', 'hospital', 'government', 'airport', 'real estate', 'celebrity', 'sound systems', 'camera cranes', 'conference', 'events', 'dental', 'car rental', 'mall']) expect(en, t).toContain(t);
    const ar = structuredKeywords('ar').join(' | ');
    for (const t of ['التسويق الإلكتروني', 'صناعة المحتوى', 'تصوير سينمائي', 'الإخراج', 'المونتاج', 'المؤثرات البصرية', 'خدع سينمائية', 'ساوند سيستم', 'كرينات', 'المؤتمرات الطبية', 'مصورون', 'البودكاست', 'للعيادات', 'للمستشفيات', 'للمطارات', 'للعقارات', 'برمجة تشات بوت', 'متروبوليتان ديجيتال ماركتينج']) expect(ar, t).toContain(t);
  });

  it('creates the long-tail searches for every emirate in every language', () => {
    const places = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'];
    expect(PLACES.map((p) => p.name)).toEqual(expect.arrayContaining(places));
    expect(withPlace('content creation', PLACES[4]!, 'en')).toBe('content creation in Umm Al Quwain');
    expect(withPlace('صناعة المحتوى', PLACES[4]!, 'ar')).toBe('صناعة المحتوى في أم القيوين');
    expect(withPlace('内容制作', PLACES[0]!, 'zh-CN')).toBe('迪拜内容制作');
    expect(withPlace('कंटेंट क्रिएशन', PLACES[0]!, 'hi')).toBe('दुबई में कंटेंट क्रिएशन');
    for (const lang of KEYWORD_LANGS) {
      const k = structuredKeywords(lang);
      expect(k.length).toBeGreaterThan(150);
      expect(k.some((x) => x.includes(PLACES[4]!.phrase[KEYWORD_LANGS.indexOf(lang)]!.replace(/^(in |في |в |à |a |en |ad |negli |aux )/, '')))).toBe(true);
      expect(new Set(k).size).toBe(k.length); // no duplicates
      expect(metaKeywords(lang)[0]).toBe(BRAND_NAMES[0]![KEYWORD_LANGS.indexOf(lang)]);
    }
  });

  it('includes software names in every language', () => {
    for (const lang of KEYWORD_LANGS) expect(structuredKeywords(lang)).toEqual(expect.arrayContaining(TOOL_TERMS));
  });
});
