import { describe, expect, it } from 'vitest';
import { initialState, onVoiceSent, respond, type ChatState } from '../engine';
import { detectLang, normalize } from '../text';

function chat(lines: string[], lang: 'ar' | 'en' = 'en') {
  let s: ChatState = initialState(lang);
  const out: string[] = [];
  let submitted: unknown;
  for (const l of lines) {
    const r = respond(s, l);
    s = r.state;
    out.push(r.reply.text);
    if (r.reply.submit) submitted = r.reply.submit;
  }
  return { out, state: s, submitted };
}

describe('text helpers', () => {
  it('detects language', () => {
    expect(detectLang('مرحبا كيف حالك')).toBe('ar');
    expect(detectLang('hello there')).toBe('en');
    expect(detectLang('12345')).toBeNull();
  });
  it('normalizes Arabic variants and prefixes', () => {
    expect(normalize('بالتسويق الرقمي')).toBe(normalize('التسويق الرقمي'));
    expect(normalize('أَدارة')).toBe(normalize('ادارة'));
  });
});

describe('chatbot engine', () => {
  it('greets in Arabic and answers salaam appropriately', () => {
    const { out } = chat(['السلام عليكم']);
    expect(out[0]).toContain('وعليكم السلام ورحمة الله وبركاته');
    expect(out[0]).toContain('متروبوليتان');
  });

  it('replies in the language of each message', () => {
    const { out } = chat(['what services do you offer', 'ما هي خدماتكم']);
    expect(out[0]).toMatch(/offers the following services/);
    expect(out[1]).toMatch(/تقدّم متروبوليتان/);
  });

  it('answers social media management from the website content', () => {
    const { out } = chat(['Do you manage Instagram, TikTok and Facebook pages?']);
    expect(out[0]).toMatch(/Social Media/i);
  });

  it('describes the new AI services', () => {
    const { out } = chat(['Do you build chatbots?', 'هل تقدمون أتمتة واتساب وربط CRM']);
    expect(out[0]).toContain('AI Chatbots & Business Agents');
    expect(out[1]).toContain('CRM');
  });

  it('shares contact details that are on the site', () => {
    const { out } = chat(['what is your whatsapp number?']);
    expect(out[0]).toContain('+971 50 822 1108');
    expect(out[0]).toContain('info@metropolitandigitalmarketing.com');
  });

  it('never quotes prices and offers a team follow-up', () => {
    const { out } = chat(['How much does a video cost?', 'كم سعر تصميم موقع؟']);
    expect(out[0]).toMatch(/don't have pricing details/);
    expect(out[0]).not.toMatch(/\d+\s?(AED|USD|\$|درهم)/);
    expect(out[1]).toMatch(/لا أملك تفاصيل الأسعار/);
  });

  it('declines personal questions', () => {
    const { out } = chat(['Who is the owner and what is his salary?']);
    expect(out[0]).toMatch(/not able to discuss personal information/);
  });

  it('says it does not know for unrelated topics and collects the lead', () => {
    const { out, submitted, state } = chat([
      'What is the weather in Paris?',
      'yes',
      'Omar',
      '+971 50 111 2233',
      'none',
    ]);
    expect(out[0]).toMatch(/don't have that information/);
    expect(out[1]).toMatch(/name/i);
    expect(out[2]).toMatch(/mobile number/i);
    expect(out[3]).toMatch(/another phone number/i);
    expect(submitted).toMatchObject({ name: 'Omar', mobile: '+971 50 111 2233' });
    expect(state.mode).toBe('idle');
  });

  it('validates the mobile number', () => {
    const { out } = chat(['talk to the team', 'Sara', '12']);
    expect(out[2]).toMatch(/incomplete/);
  });

  it('collects Arabic-digit numbers', () => {
    const { submitted } = chat(['ما حال الطقس', 'نعم', 'سامر', '٠٥٠١٢٣٤٥٦٧٨', 'لا يوجد'], 'ar');
    expect(submitted).toMatchObject({ name: 'سامر', mobile: '0501234567' + '8' });
  });

  it('hands a voice message to the team after taking details', () => {
    const first = onVoiceSent(initialState('en'), '/api/chat/voice/abc.webm', 'en');
    expect(first.reply.text).toMatch(/voice message/);
    expect(first.state.mode).toBe('leadName');
    const failed = onVoiceSent(initialState('ar'), null, 'ar');
    expect(failed.reply.text).toMatch(/تعذّر/);
  });
});

describe('voice after details are known', () => {
  it('forwards the voice message without asking for the numbers again', () => {
    const { state } = chat(['talk to the team', 'Sara', '+971501112233', 'none']);
    const r = onVoiceSent(state, '/api/chat/voice/x.webm', 'en');
    expect(r.reply.submit).toMatchObject({ name: 'Sara', mobile: '+971501112233', voiceUrl: '/api/chat/voice/x.webm' });
  });
});
