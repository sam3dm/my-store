import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Mic, Send, Square, Trash2, X } from 'lucide-react';
import useLocalizedPath from '../../hooks/useLocalizedPath';
import { finalizeLead, greetedState, greeting, onVoiceSent, respond, serviceTitles, type ChatState, type Lead } from '../../lib/chatbot/engine';
import { buildReport } from '../../lib/chatbot/report';
import { detectScript, type ChatLang } from '../../lib/chatbot/text';
import { OPEN_CHAT_EVENT } from './openChat';

interface Msg {
  id: number;
  from: 'bot' | 'user';
  text: string;
  lang: ChatLang;
  audioUrl?: string;
  voiceSeconds?: number;
  page?: string;
  /** Declined by the assistant (inappropriate): kept out of every report. */
  hidden?: boolean;
}

const STORAGE_KEY = 'mdm-chat-v1';
const MAX_RECORD_SECONDS = 120;

const UI = {
  ar: {
    title: 'متروبوليتان تشات بوت',
    subtitle: 'المساعد الافتراضي',
    placeholder: 'اكتب رسالتك هنا…',
    send: 'إرسال',
    close: 'إغلاق المحادثة',
    mic: 'تسجيل رسالة صوتية',
    cancel: 'إلغاء التسجيل',
    sendVoice: 'إرسال الرسالة الصوتية',
    recording: 'جارٍ التسجيل…',
    micDenied: 'لم أتمكّن من الوصول إلى الميكروفون. يرجى السماح بالوصول من إعدادات المتصفح، أو اكتب رسالتك.',
    open: 'افتح الصفحة',
    typing: 'يكتب…',
    voice: 'رسالة صوتية',
    sent: 'تم إرسال بياناتك إلى الفريق.',
    sendFailed: 'تعذّر إرسال بياناتك الآن. يمكنك التواصل معنا مباشرة عبر واتساب: +971 50 822 1108',
    clear: 'محادثة جديدة',
  },
  en: {
    title: 'Metropolitan Chatbot',
    subtitle: 'Virtual Assistant',
    placeholder: 'Type your message…',
    send: 'Send',
    close: 'Close chat',
    mic: 'Record a voice message',
    cancel: 'Cancel recording',
    sendVoice: 'Send voice message',
    recording: 'Recording…',
    micDenied: "I couldn't access the microphone. Please allow it in your browser settings, or type your message.",
    open: 'Open page',
    typing: 'Typing…',
    voice: 'Voice message',
    sent: 'Your details have been sent to the team.',
    sendFailed: 'Your details could not be sent right now. You can reach us directly on WhatsApp: +971 50 822 1108',
    clear: 'New chat',
  },
} as const;

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  return `${m}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((t) => MediaRecorder.isTypeSupported(t));
}

/** Ask the server-side AI endpoint; null on any problem (no key, limit, filter, network) so the rules take over. */
async function askAi(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 22000);
    const res = await fetch('/api/chat/ai', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; text?: string };
    return data.ok && typeof data.text === 'string' && data.text ? data.text : null;
  } catch {
    return null;
  }
}

async function sendLead(lead: Lead, conversation: Msg[], siteLang: string, keepalive = false) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const report = buildReport(
    lead,
    conversation.map((m) => ({ from: m.from, text: m.hidden ? '[message declined by the assistant]' : m.text, voice: Boolean(m.audioUrl || m.voiceSeconds) })),
    siteLang,
    origin,
  );
  const res = await fetch('/api/contact/contact-us', {
    method: 'POST',
    keepalive,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation: {
        messages_attributes: [{ body: report.body }],
        data: { __gd_contact_form_title: report.title, ...report.data },
      },
      user: { name: lead.name ?? 'Chatbot visitor', mobile: lead.mobile ?? lead.phone },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'send failed');
}

export default function ChatWidget() {
  const { i18n } = useTranslation();
  const localizedPath = useLocalizedPath();
  const siteLang = i18n.language;
  const uiLang: ChatLang = siteLang === 'ar' ? 'ar' : 'en';

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [state, setState] = useState<ChatState>(() => greetedState(uiLang));
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const idRef = useRef(1);
  const sidRef = useRef('');
  const countedRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelRef = useRef(false);
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;
  const stateRef = useRef(state);
  stateRef.current = state;

  // Anonymous, aggregate-only snapshot for the owner's daily report (no raw transcript is sent).
  const snapshot = useCallback(
    (final: boolean) => {
      const st = stateRef.current;
      if (!sidRef.current || !messagesRef.current.some((m) => m.from === 'user')) return;
      const body = JSON.stringify({
        sid: sidRef.current,
        final,
        lang: st.lang,
        name: st.name,
        mobile: st.contact?.mobile ?? st.lead.mobile,
        phone: st.contact?.phone ?? st.lead.phone,
        field: st.discovery.field,
        services: serviceTitles(st.discovery.services),
        platforms: st.discovery.platforms,
        location: st.discovery.location,
        approach: st.discovery.approach,
        details: st.discovery.details,
        questions: st.questions,
        turns: st.turn,
        voiceUrls: st.voiceUrl ? [st.voiceUrl] : [],
        hasLead: st.reported,
      });
      try {
        if (final && navigator.sendBeacon) navigator.sendBeacon('/api/chat/event', new Blob([body], { type: 'application/json' }));
        else void fetch('/api/chat/event', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body }).catch(() => undefined);
      } catch {
        /* analytics must never break the chat */
      }
    },
    [],
  );

  // Send whatever has been collected (once) when the panel is closed or the page is left.
  const flush = useCallback(() => {
    const { state: next, lead } = finalizeLead(stateRef.current);
    if (lead) {
      setState(next);
      stateRef.current = next;
      void sendLead(lead, messagesRef.current, siteLang, true).catch(() => undefined);
    }
    snapshot(true);
  }, [siteLang, snapshot]);

  /** End the conversation: report it, then erase it completely (messages, state, audio). */
  const endConversation = useCallback(() => {
    flush();
    messagesRef.current.forEach((m) => m.audioUrl && URL.revokeObjectURL(m.audioUrl));
    messagesRef.current = [];
    sidRef.current = '';
    countedRef.current = false;
    setMessages([]);
    setState(greetedState(uiLang));
    stateRef.current = greetedState(uiLang);
    setInput('');
    setOpen(false);
  }, [flush, uiLang]);

  useEffect(() => {
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [flush]);

  const t = UI[state.lang];

  // Conversations are never stored: nothing is kept in the browser or on the server, so every
  // opening starts a new one. (Clears anything an older version of the widget may have stored.)
  useEffect(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const pushBot = useCallback((text: string, lang: ChatLang, page?: string) => {
    setMessages((m) => [...m, { id: idRef.current++, from: 'bot', text, lang, page }]);
  }, []);

  const startConversation = useCallback(() => {
    sidRef.current = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `s${Date.now()}${Math.random().toString(16).slice(2)}`;
    countedRef.current = false;
    const g = greeting(uiLang);
    setState(greetedState(uiLang));
    setMessages([{ id: idRef.current++, from: 'bot', text: g.text, lang: uiLang }]);
  }, [uiLang]);

  // If the site language is switched before the visitor has written anything, greet in the new language.
  useEffect(() => {
    const ms = messagesRef.current;
    if (ms.length === 1 && ms[0]!.from === 'bot') startConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang]);

  // Open on request; greet the first time.
  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      if (messagesRef.current.length === 0) startConversation();
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, [startConversation]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing, open, recording]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && endConversation();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, endConversation]);

  const deliver = useCallback(
    async (userText: string) => {
      const lang = detectScript(userText);
      const userId = idRef.current++;
      setMessages((m) => [...m, { id: userId, from: 'user', text: userText, lang: lang === 'ar' ? 'ar' : 'en' }]);
      setTyping(true);
      const before = stateRef.current;
      let turn = respond(before, userText);
      if (turn.reply.ai) {
        // The rules did not understand: ask the AI (answers only from the website's content). Any failure keeps the rule-based reply.
        const history = messagesRef.current
          .filter((m) => !m.hidden && m.text)
          .slice(-9)
          .map((m) => ({ role: m.from === 'user' ? ('user' as const) : ('assistant' as const), content: m.text }));
        history.push({ role: 'user', content: userText.slice(0, 800) });
        const ai = await askAi(history);
        if (ai) {
          turn = {
            state: { ...turn.state, pending: before.pending, mode: before.mode, asked: { ...before.asked }, lastQuestion: turn.state.lastQuestion },
            reply: { text: ai },
          };
        }
      }
      await new Promise((r) => setTimeout(r, 400 + Math.min(userText.length * 6, 600)));
      setState(turn.state);
      stateRef.current = turn.state;
      if (turn.reply.moderated) {
        messagesRef.current = messagesRef.current.map((m) => (m.id === userId ? { ...m, hidden: true } : m));
        setMessages((m) => m.map((x) => (x.id === userId ? { ...x, hidden: true } : x)));
      }
      if (!countedRef.current) {
        countedRef.current = true;
        setTimeout(() => snapshot(false), 50);
      }
      const bubbles = [turn.reply.text, ...(turn.reply.extra ?? [])];
      for (let i = 0; i < bubbles.length; i++) {
        if (i > 0) {
          setTyping(true);
          await new Promise((r) => setTimeout(r, 650));
        }
        setTyping(false);
        pushBot(bubbles[i]!, i === 0 && bubbles.length === 1 ? turn.state.lang : /[\u0600-\u06FF]/.test(bubbles[i]!) ? 'ar' : 'en', i === bubbles.length - 1 ? turn.reply.page : undefined);
      }
      if (turn.reply.submit) {
        try {
          await sendLead(turn.reply.submit, messagesRef.current, siteLang);
        } catch {
          pushBot(UI[turn.state.lang].sendFailed, turn.state.lang);
        }
      }
    },
    [pushBot, siteLang, snapshot],
  );

  const lastSendRef = useRef(0);
  const submit = useCallback(() => {
    const text = input.trim();
    if (!text || typing) return;
    const now = Date.now();
    if (now - lastSendRef.current < 700 || messagesRef.current.length > 240) return; // flood guard
    lastSendRef.current = now;
    setInput('');
    void deliver(text);
  }, [input, typing, deliver]);

  // ── Voice messages ───────────────────────────────────────────────────────
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startRecording = async () => {
    if (recording || typing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      cancelRef.current = false;
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        stopTimer();
        setRecording(false);
        if (cancelRef.current) return;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime || 'audio/webm' });
        void sendVoice(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_RECORD_SECONDS) recorderRef.current?.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      pushBot(UI[stateRef.current.lang].micDenied, stateRef.current.lang);
    }
  };

  const stopRecording = (cancel: boolean) => {
    cancelRef.current = cancel;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
  };

  const sendVoice = async (blob: Blob) => {
    const lang = stateRef.current.lang;
    const secs = Math.max(1, Math.round(blob.size ? Math.min(MAX_RECORD_SECONDS, secondsRef.current) : 1));
    const localUrl = URL.createObjectURL(blob);
    setMessages((m) => [...m, { id: idRef.current++, from: 'user', text: '', lang, audioUrl: localUrl, voiceSeconds: secs }]);
    setTyping(true);
    let url: string | null = null;
    try {
      const res = await fetch('/api/chat/voice', { method: 'POST', headers: { 'Content-Type': blob.type.split(';')[0] || 'audio/webm' }, body: blob });
      const json = await res.json();
      if (res.ok && json.success) url = json.url as string;
    } catch {
      url = null;
    }
    await new Promise((r) => setTimeout(r, 600));
    setTyping(false);
    const turn = onVoiceSent(stateRef.current, url, lang);
    setState(turn.state);
    pushBot(turn.reply.text, lang);
    if (turn.reply.submit) {
      try {
        await sendLead(turn.reply.submit, messagesRef.current, siteLang);
      } catch {
        pushBot(UI[lang].sendFailed, lang);
      }
    }
  };

  const secondsRef = useRef(0);
  secondsRef.current = seconds;

  useEffect(() => () => stopTimer(), []);



  const reset = () => {
    flush();
    messagesRef.current.forEach((m) => m.audioUrl && URL.revokeObjectURL(m.audioUrl));
    startConversation();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t.title}
      className="fixed z-[70] flex flex-col overflow-hidden inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[640px] sm:max-h-[calc(100vh-3rem)]"
      style={{ background: '#000', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 20px 60px rgba(0,0,0,0.65)', color: '#fff' }}
    >
      {/* Header with logo */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="flex flex-col gap-1 min-w-0">
          <img src="/airo-assets/images/logo/horizontal" alt="Metropolitan Digital Marketing" style={{ height: 34, width: 'auto', maxWidth: 200, objectFit: 'contain' }} />
          <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {t.title} · {t.subtitle}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={reset} title={t.clear} aria-label={t.clear} className="w-9 h-9 flex items-center justify-center opacity-70 hover:opacity-100">
            <Trash2 size={16} />
          </button>
          <button type="button" onClick={endConversation} aria-label={t.close} className="w-9 h-9 flex items-center justify-center opacity-80 hover:opacity-100">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              dir={m.lang === 'ar' ? 'rtl' : 'ltr'}
              className="max-w-[86%] px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words"
              style={
                m.from === 'user'
                  ? { background: '#fff', color: '#000', borderRadius: 14 }
                  : { background: '#161616', color: '#f2f2f2', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14 }
              }
            >
              {m.audioUrl || m.voiceSeconds ? (
                <div className="flex flex-col gap-1.5" dir="ltr">
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <Mic size={13} /> {UI[m.lang].voice} · {fmt(m.voiceSeconds ?? 0)}
                  </span>
                  {m.audioUrl && <audio controls src={m.audioUrl} style={{ height: 34, maxWidth: '100%' }} />}
                </div>
              ) : (
                m.text
              )}
              {m.page && (
                <div className="mt-2">
                  <Link to={localizedPath(m.page)} onClick={() => undefined} className="text-xs underline underline-offset-2" style={{ color: '#d6d6d6' }}>
                    {UI[m.lang].open} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2.5 text-sm" style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'rgba(255,255,255,0.7)' }} aria-label={t.typing}>
              <span className="inline-flex gap-1">
                <i className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                <i className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '120ms' }} />
                <i className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '240ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {recording ? (
          <div className="flex items-center gap-3 px-2 py-2" style={{ border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12 }}>
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#ff4d4d' }} />
            <span className="text-sm flex-1">
              {t.recording} {fmt(seconds)}
            </span>
            <button type="button" onClick={() => stopRecording(true)} aria-label={t.cancel} title={t.cancel} className="w-9 h-9 flex items-center justify-center opacity-80 hover:opacity-100">
              <Trash2 size={18} />
            </button>
            <button type="button" onClick={() => stopRecording(false)} aria-label={t.sendVoice} title={t.sendVoice} className="w-9 h-9 flex items-center justify-center" style={{ background: '#fff', color: '#000', borderRadius: 999 }}>
              <Square size={14} fill="#000" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              dir="auto"
              rows={1}
              maxLength={800}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              className="flex-1 resize-none px-3 py-2.5 text-[14px] outline-none max-h-28"
              style={{ background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 12 }}
            />
            <button type="button" onClick={startRecording} aria-label={t.mic} title={t.mic} disabled={typing} className="w-10 h-10 flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, opacity: typing ? 0.5 : 1 }}>
              <Mic size={18} />
            </button>
            <button type="button" onClick={submit} aria-label={t.send} title={t.send} disabled={!input.trim() || typing} className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: '#fff', color: '#000', borderRadius: 999, opacity: !input.trim() || typing ? 0.45 : 1 }}>
              <Send size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
