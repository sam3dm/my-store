# Metropolitan Digital Marketing website — project status (hand-off)

Last updated: 2026-10-04. Branch: `claude/website-multi-language-translation-gxo1iz` (not yet merged into `main`; PR #1 is the owner's decision).

## What the site is
React 19 + Vite 6 SSR + Express (`dist/server.bundle.mjs`, port from `PORT`). Nine languages (en, ar RTL, ru, zh-CN, tr, fr, it, es, hi). Page text lives in `src/content/pages/*.json` (English) and `src/locales/content/<lang>.json` (translations, positional merge); UI strings in `src/locales/<lang>.json`; media slots in `airo-media.json` (root and `public/airo-media.json`, keep identical).

## Live deployment
- Render web service `metropolitan-digital-marketing` (Starter, Frankfurt, ~7 USD/month, monthly billing), created from `render.yaml` (Blueprint). Auto-deploys every push to the branch above. URL: https://metropolitan-digital-marketing.onrender.com
- Secrets are typed only in Render's dashboard (never in the repo): `ANTHROPIC_API_KEY`, `SMTP_USER`, `SMTP_PASS` (Gmail app password), `MAIL_TO`. Optional: `CHAT_AI_MODEL`, `CHAT_AI_PER_VISITOR`, `CHAT_AI_PER_VISITOR_DAILY`, `CHAT_AI_DAILY_CAP`, `CHAT_VOICE_DAYS`, `ALLOWED_HOSTS`, `MAIL_FALLBACK_INBOX`.
- The public domain `metropolitandigitalmarketing.com` (GoDaddy DNS) still points to the OLD GoDaddy/Airo site (A record 160.153.0.247). Switching it is the last step (see "Remaining").
- Owner's e-mail (Microsoft 365 records in DNS: MX, autodiscover, DKIM…) must not be touched when changing DNS.

## Done
- Full 9-language translation; hero video + generated images (home, about, services, specialties strip, AI services).
- Portfolio category guides (intro, services, 6 production stages, tools) in 9 languages; home specialties strip and clickable industry tags link to them (`/portfolio?c=<id>`).
- Working hours (Mon–Fri 9:00–19:00 UAE, Sat–Sun closed) on the contact page, chatbot, AI knowledge, structured data.
- Chatbot: rule engine (`src/lib/chatbot`) + AI layer (`src/server/chat-ai.ts`, Claude, grounded on site content, filters, caps, no tools) + speech-to-text (browser) + name-first flow + reports.
- Reports: chatbot leads, contact form, nightly 23:30 UAE report and security alerts go **only to the owner's Gmail via SMTP** (`src/server/mailer.ts`, `chat-lead.ts`, `contact-mail.ts`); the GoDaddy Inbox route is used only if SMTP is not configured (or `MAIL_FALLBACK_INBOX=1`).
- Security: CSP + headers, request screening/bans/alerts, read-only site (no public writes/uploads), integrity guard (restores/deletes tampered files), Host-header guard, code/injection filters in 9 languages, privacy rules (no conversation stored), `npm audit` clean. See `docs/SECURITY.md`, `docs/CHATBOT.md`, `docs/SEO.md`.
- Mobile: language button beside the menu, chat input 16px (no iOS zoom), video byte-range support (iPhone).
- Arabic wording: "تحريك" replaced by "أنيميشن" everywhere.

## Remaining / ideas
1. Connect the real domain: add the domain in Render (Settings → Custom Domains), then in GoDaddy DNS change only the `@` A record (and `www` CNAME) to the values Render shows; keep email records. Then re-run the security pass on the real domain and add the domain to `ALLOWED_HOSTS` if needed.
2. Merge the branch into `main` (PR #1) and point Render's branch to `main` (`render.yaml` `branch:`), or keep deploying from the branch.
3. Recommended: use a dedicated Gmail account for `SMTP_USER` and forward to the owner with `MAIL_TO` (app passwords grant mailbox access). Enable 2-step verification on the GoDaddy account/domain.
4. Optional: extra images/video, new services or text changes the owner decides on.

## How to work on it
- Local: `npm install --legacy-peer-deps`, `npm run build`, `node dist/server.bundle.mjs` (set `SMTP_USER`, `SMTP_PASS`, `ANTHROPIC_API_KEY` in the shell to test mail/AI). Tests: `npx vitest run` (known failing: `src/server/llms-txt.test.ts`; two files need Airo plugin modules).
- Owner's Windows flow: Pull in GitHub Desktop → `robocopy "C:\Users\samir\Documents\GitHub\my-store" "C:\mdm-site" /E /XD node_modules .git dist` → `cd /d C:\mdm-site` → `npm run build` → `taskkill /F /IM node.exe` → `node dist/server.bundle.mjs`.
- Never put keys/passwords in the repo or in chat.
