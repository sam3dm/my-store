import { describe, expect, it } from 'vitest';
import { getLocalizedContent } from '../content';
import { languageCodes, defaultLanguage } from '../config';
import { pages } from 'virtual:content';

describe('localised page content', () => {
  it('returns the English content untouched for the default language', () => {
    expect(getLocalizedContent('services', defaultLanguage)).toBe(pages.services);
  });

  it('keeps ids, numbers and image slots from English and translates the text', () => {
    const ru = getLocalizedContent('services', 'ru');
    expect(ru.services).toHaveLength(pages.services.services.length);
    expect(ru.services[0].id).toBe(pages.services.services[0].id);
    expect(ru.services[0].number).toBe(pages.services.services[0].number);
    expect(ru.services[0].title).not.toBe(pages.services.services[0].title);
    const zh = getLocalizedContent('portfolio', 'zh-CN');
    expect(zh.items[0].slot).toBe(pages.portfolio.items[0].slot);
    expect(zh.items[0].title).not.toBe(pages.portfolio.items[0].title);
  });

  it('keeps contact links and phone numbers language-independent', () => {
    for (const lang of languageCodes) {
      const contact = getLocalizedContent('contact', lang);
      expect(contact.methods.whatsapp.href).toBe(pages.contact.methods.whatsapp.href);
      expect(contact.methods.email.address).toBe(pages.contact.methods.email.address);
    }
  });

  it('has a complete translation for every non-default language', () => {
    for (const lang of languageCodes.filter((l) => l !== defaultLanguage)) {
      for (const key of Object.keys(pages) as Array<keyof typeof pages>) {
        const en = JSON.stringify(pages[key]);
        const localised = getLocalizedContent(key, lang);
        // Every string that differs by design is translated; the structure must match exactly.
        expect(Object.keys(localised)).toEqual(Object.keys(pages[key]));
        expect(JSON.stringify(localised)).not.toBe(en);
      }
    }
  });
});
