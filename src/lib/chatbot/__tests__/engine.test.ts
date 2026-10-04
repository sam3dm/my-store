import { describe, expect, it } from 'vitest';
import { finalizeLead, greetedState, initialState, onVoiceSent, respond, type BotReply, type ChatState, type Lead } from '../engine';
import { buildReport } from '../report';
import { detectLang, detectScript, normalize } from '../text';

function chat(lines: string[], lang: 'ar' | 'en' = 'en') {
  let s: ChatState = greetedState(lang);
  const replies: BotReply[] = [];
  let submitted: Lead | undefined;
  for (const l of lines) {
    const r = respond(s, l);
    s = r.state;
    replies.push(r.reply);
    if (r.reply.submit) submitted = r.reply.submit;
  }
  return { out: replies.map((r) => r.text), replies, state: s, submitted };
}

describe('text helpers', () => {
  it('detects language and unsupported scripts', () => {
    expect(detectLang('مرحبا كيف حالك')).toBe('ar');
    expect(detectLang('hello there')).toBe('en');
    expect(detectLang('12345')).toBeNull();
    expect(detectScript('Привет, как дела?')).toBe('other');
    expect(detectScript('你好')).toBe('other');
  });
  it('normalizes Arabic variants and prefixes', () => {
    expect(normalize('بالتسويق الرقمي')).toBe(normalize('التسويق الرقمي'));
    expect(normalize('أَدارة')).toBe(normalize('ادارة'));
  });
});

describe('greetings', () => {
  it('answers salaam warmly and asks to get acquainted', () => {
    const { out } = chat(['السلام عليكم']);
    expect(out[0]).toContain('وعليكم السلام ورحمة الله وبركاته');
    expect(out[0]).toContain('نتشرّف بالتعرّف');
    expect(out[0]).toContain('متروبوليتان');
  });

  it('replies to a bare greeting with the name question and no menu', () => {
    const { out } = chat(['مرحبا']);
    expect(out[0]).toContain('ما هو اسمك الكريم');
  });

  it('writes separate bubbles in Arabic and English for unsupported languages', () => {
    const { replies } = chat(['Привет, как дела?']);
    expect(replies[0]!.text).toMatch(/Arabic and English/);
    expect(replies[0]!.extra?.[0]).toMatch(/العربية والإنجليزية/);
  });

  it('replies in the language of each message without mixing', () => {
    const { out } = chat(['what services do you offer', 'ما هي خدماتكم']);
    expect(out[0]).toMatch(/offers the following services/);
    expect(out[0]).not.toMatch(/[؀-ۿ]/);
    expect(out[1]).toMatch(/تقدّم متروبوليتان/);
  });
});

describe('knowledge and policy', () => {
  it('answers about its work using the website domain', () => {
    const { out } = chat(['ما هي أعمالكم؟']);
    expect(out[0]).toMatch(/إدارة صفحات وسائل التواصل/);
    expect(out[0]).toMatch(/بودكاست/);
  });

  it('keeps client names confidential', () => {
    const { out } = chat(['what are the names of your clients?']);
    expect(out[0]).toMatch(/confidential/);
  });

  it('describes the new AI services', () => {
    const { out } = chat(['Do you build chatbots?', 'هل تقدمون أتمتة واتساب وربط CRM']);
    expect(out[0]).toContain('AI Chatbots & Business Agents');
    expect(out[1]).toContain('CRM');
  });

  it('shares contact details that are on the site', () => {
    const { out } = chat(['what is your whatsapp number?']);
    expect(out[0]).toContain('+971 50 822 1108');
  });

  it('never quotes prices', () => {
    const { out } = chat(['How much does a video cost?', 'كم سعر تصميم موقع؟']);
    expect(out[0]).toMatch(/don't have pricing details/);
    expect(out[0]).not.toMatch(/\d+\s?(AED|USD|\$|درهم)/);
    expect(out[1]).toMatch(/لا أملك تفاصيل الأسعار/);
  });

  it('declines personal questions', () => {
    const { out } = chat(['Who is the owner and what is his salary?', 'who founded your company']);
    expect(out[0]).toMatch(/not able to discuss personal information/);
    expect(out[1]).toMatch(/not able to discuss personal information/);
  });
});

describe('conversation and memory', () => {
  it('takes a bare word as a name and then starts the discovery conversation without menus', () => {
    const { out, state } = chat(['hello', 'Sam']);
    expect(state.name).toBe('Sam');
    expect(out[1]).toMatch(/which field or sector/);
  });

  it('asks "is your name …?" when a short word arrives unprompted', () => {
    let s = initialState('ar');
    const r = respond(s, 'سام');
    expect(r.reply.text).toMatch(/هل اسمك «سام»/);
    s = respond(r.state, 'نعم').state;
    expect(s.name).toBe('سام');
  });

  it('never asks the same question twice', () => {
    const { out } = chat(['Ahmed', 'hello again', 'ok', 'hmm', 'something', 'more', 'yes please']);
    const questions = out.filter((o) => /which field or sector/.test(o));
    expect(questions.length).toBeLessThanOrEqual(1);
  });

  it('uses answers to guide the next questions (social media → platforms/management)', () => {
    const { out, state } = chat(['hello', 'Layla', 'a restaurant', 'I want social media management']);
    expect(state.discovery.field).toMatch(/Restaurants/);
    expect(out[3]).toMatch(/Wonderful/);
    expect(out[3]).toMatch(/platforms|manage your pages/i);
  });

  it('runs a full Arabic conversation and produces the report', () => {
    const { submitted, out } = chat(
      ['السلام عليكم', 'سام', 'أريد إدارة صفحات إنستغرام وتيك توك لمطعمي', 'أريد إدارة كاملة', 'دبي', 'تصوير حقيقي', '0501234567', 'لا يوجد'],
      'ar',
    );
    expect(submitted).toMatchObject({ name: 'سام', mobile: '0501234567' });
    expect(submitted?.discovery?.services).toContain('svc-01');
    expect(submitted?.discovery?.platforms).toEqual(expect.arrayContaining(['Instagram', 'TikTok']));
    expect(submitted?.discovery?.location).toBe('Dubai');
    expect(submitted?.discovery?.approach).toBe('real');
    expect(out[out.length - 1]).toMatch(/ملخص ما فهمته/);
  });

  it('does not mistake "real estate" for real filming', () => {
    const { state } = chat(['hello', 'Omar', 'we are a real estate developer']);
    expect(state.discovery.approach).toBeUndefined();
  });

  it('collects details for the team on unknown questions', () => {
    const { out, submitted, state } = chat(['What is the weather in Paris?', 'Omar', '+971 50 111 2233', 'none']);
    expect(out[0]).toMatch(/don't have that information/);
    expect(out[0]).toMatch(/your name/);
    expect(submitted).toMatchObject({ name: 'Omar', mobile: '+971 50 111 2233' });
    expect(state.mode).toBe('idle');
  });

  it('answers a question in the middle of collecting contact details instead of looping', () => {
    const { out } = chat(['talk to the team', 'Sara', 'what services do you offer']);
    expect(out[2]).toMatch(/offers the following services/);
  });

  it('accepts a number volunteered at any point', () => {
    const { out } = chat(['hello', 'Sara', '0501234567']);
    expect(out[2]).toMatch(/another phone number/);
  });

  it('validates the mobile number and accepts Arabic digits', () => {
    expect(chat(['talk to the team', 'Sara', '12']).out[2]).toMatch(/incomplete/);
    const { submitted } = chat(['ما حال الطقس', 'سامر', '٠٥٠١٢٣٤٥٦٧٨', 'لا يوجد'], 'ar');
    expect(submitted).toMatchObject({ name: 'سامر', mobile: '0501234567' + '8' });
  });

  it('stops asking about contact details after a refusal', () => {
    const { out } = chat(['talk to the team', 'Sara', 'no thanks', 'hello']);
    expect(out[2]).toMatch(/Not a problem/);
    expect(out[3]).not.toMatch(/mobile number/);
  });
});

describe('voice and report', () => {
  it('hands a voice message to the team after taking details', () => {
    const first = onVoiceSent(initialState('en'), '/api/chat/voice/abc.webm', 'en');
    expect(first.reply.text).toMatch(/voice message/);
    expect(first.state.mode).toBe('leadName');
    expect(onVoiceSent(initialState('ar'), null, 'ar').reply.text).toMatch(/تعذّر/);
  });

  it('forwards a later voice message without asking for the numbers again', () => {
    const { state } = chat(['talk to the team', 'Sara', '+971501112233', 'none']);
    const r = onVoiceSent(state, '/api/chat/voice/x.webm', 'en');
    expect(r.reply.submit).toMatchObject({ name: 'Sara', mobile: '+971501112233', voiceUrl: '/api/chat/voice/x.webm' });
  });

  it('finalizes a partly collected lead once when the chat is closed', () => {
    const { state } = chat(['talk to the team', 'Sara', '+971501112233']);
    const a = finalizeLead(state);
    expect(a.lead).toMatchObject({ name: 'Sara', mobile: '+971501112233' });
    expect(finalizeLead(a.state).lead).toBeNull();
  });

  it('builds a readable client report', () => {
    const { submitted } = chat(['hello', 'Layla', 'I run a restaurant and need Instagram management', 'Dubai', '0501234567', 'none']);
    const r = buildReport(submitted!, [{ from: 'user', text: 'hi' }], 'en', 'https://example.com', new Date('2026-01-01T00:00:00Z'));
    expect(r.body).toContain('CLIENT REPORT');
    expect(r.body).toMatch(/Client name\s+\| Layla/);
    expect(r.body).toMatch(/Services of interest\s+\| .*Social Media/i);
    expect(r.body).toMatch(/Project location\s+\| Dubai/);
    expect(r.data['Mobile']).toBe('0501234567');
    expect(r.title).toContain('Layla');
  });
});
