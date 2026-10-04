/** Builds the client report that is sent to the team when a chatbot conversation ends. */
import type { Lead } from './engine';
import { serviceTitles } from './engine';

export interface ChatLine {
  from: 'bot' | 'user';
  text: string;
  voice?: boolean;
}

const NA = 'Not provided';
const APPROACH = { ai: 'AI-generated visuals', real: 'Real filming / photography', mix: 'A mix of AI and real filming' } as const;

function row(label: string, value: string, width = 22): string {
  return `| ${label.padEnd(width)}| ${value.replace(/\s+/g, ' ')}`;
}

export function buildReport(lead: Lead, conversation: ChatLine[], siteLang: string, origin: string, now = new Date()) {
  const d = lead.discovery;
  const services = d?.services.length ? serviceTitles(d.services).join(', ') : NA;
  const platforms = d?.platforms.length ? d.platforms.join(', ') : (d?.details.plat ?? NA);
  const details = d
    ? Object.entries(d.details)
        .filter(([k]) => k !== 'plat')
        .map(([k, v]) => `${{ mgmt: 'Management scope', projtype: 'Production type', aidetail: 'AI interest', webdetail: 'Web project' }[k] ?? k}: ${v}`)
        .join(' · ')
    : '';
  const voice = lead.voiceUrl ? `${origin}${lead.voiceUrl}` : '';

  const rows = [
    ['Client name', lead.name ?? NA],
    ['Mobile', lead.mobile ?? NA],
    ['Phone', lead.phone ?? NA],
    ['Business field', d?.field ?? NA],
    ['Services of interest', services],
    ['Platforms', platforms],
    ['Project location', d?.location ?? NA],
    ['Creative approach', d?.approach ? APPROACH[d.approach] : NA],
    ['Details', details || NA],
    ['Other notes', d?.notes.length ? d.notes.join(' / ') : NA],
    ['Visitor question', lead.topic ?? NA],
    ['Voice message', voice || 'None'],
    ['Chat language', lead.lang === 'ar' ? 'Arabic' : 'English'],
    ['Website language', siteLang],
    ['Received', now.toISOString()],
  ];

  const summary = [
    `${lead.name ?? 'A visitor'} contacted us through the website chatbot`,
    d?.field ? `from the "${d.field}" field` : '',
    d?.services.length ? `and is interested in: ${services}` : '',
    platforms !== NA ? `(platforms: ${platforms})` : '',
    d?.location ? `— project location: ${d.location}` : '',
    d?.approach ? `— preferred approach: ${APPROACH[d.approach]}` : '',
    `. Please contact them on ${lead.mobile ?? 'the number provided'}${lead.phone ? ` or ${lead.phone}` : ''}.`,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+\./g, '.');

  const transcript = conversation
    .slice(-24)
    .map((m) => `${m.from === 'user' ? 'Client' : 'Bot'}: ${m.voice ? '[voice message]' : m.text.replace(/\s+/g, ' ').slice(0, 400)}`)
    .join('\n');

  const line = '─'.repeat(64);
  const body = [
    'METROPOLITAN CHATBOT — CLIENT REPORT',
    line,
    ...rows.map(([l, v]) => row(l!, v!)),
    line,
    'SUMMARY',
    summary,
    line,
    'CONVERSATION',
    transcript,
  ].join('\n');

  const data: Record<string, string> = Object.fromEntries(rows.map(([l, v]) => [l!, v!]));
  data.Summary = summary;
  data.Source = 'Chatbot';
  return { body, data, title: `CHATBOT LEAD — ${lead.name ?? 'Visitor'} — ${d?.services.length ? serviceTitles(d.services)[0] : 'General inquiry'}` };
}
