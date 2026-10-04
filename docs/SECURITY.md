# Website & chatbot security

## What is protected, and how
| Area | Protection |
|---|---|
| Browser | Strict **Content-Security-Policy** (no inline scripts except the page's own, hashed per response; no plugins; no framing by other sites), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (microphone only for the site), COOP, **HSTS** when served over HTTPS. `X-Powered-By` removed. |
| Probing & attacks | Every request's URL/query is screened for path traversal, sensitive files (`.env`, `.git`, backups), CMS/PHP probes, SQL injection, XSS, command injection, log4j/template payloads, null bytes, oversized URLs, hacking-tool user agents and unusual HTTP methods. Offenders get an uninformative 404/405 and are recorded. |
| Brute force & floods | Per-IP limits (pages, API, contact form) plus a global hourly cap on form submissions (stops inbox flooding from many addresses). Three strikes in 10 minutes → **blocked for 60 minutes**. Loopback / unidentifiable proxy addresses are never limited, so real visitors cannot be locked out by mistake. |
| **Alert e-mail** | Suspicious activity is e-mailed to the owner's inbox (same route as the contact form): attacker **IP**, what was tried, user agent, count, time (UAE). Digest style: at most one e-mail per 10 minutes and 6 per hour. Queued if sending fails. |
| Uploads | Voice messages: size limit, **real file-type check from the first bytes** (an exe/HTML renamed to .webm is refused), unguessable ids, per-IP daily cap, storage quota, auto-delete after 14 days, served with `nosniff`. |
| Submitted data | Contact/chat JSON is rebuilt as clean data: no prototype-pollution keys, bounded depth/size, HTML neutralised. Names keep letters only. Text quoted in e-mails (names, URLs, user agents) is neutralised and links are defanged, so a hacker cannot plant clickable/HTML content in the owner's inbox. |
| Chatbot | Rule-based (no AI service to trick, nothing to "jailbreak"); runs in the visitor's browser; no server-side chat storage; input capped (800 chars), message-rate and conversation-length limits; refuses to reveal other visitors' data; React escapes all output (no `innerHTML`). |
| Request limits | JSON ≤ 64 KB, forms ≤ 32 KB, audio ≤ 3 MB, header/request timeouts against slow-connection attacks, neutral JSON errors (no stack traces / framework pages). |
| Dependencies | `npm audit` for production packages: **0 vulnerabilities** (fixed `body-parser` and `qs` DoS issues). Re-run `npm audit --omit=dev` regularly. |
| Secrets | None in the repository. The owner's personal e-mail exists only in server configuration (`src/lib/contact-form.config.json`, read by the server) and is never sent to browsers. |

## Nobody can publish, upload or change anything
* The site is **read-only for the public**. Writes are accepted on only three endpoints (contact form, chatbot summary, voice message). A POST anywhere else, any file upload (multipart), and PUT / PATCH / DELETE / WebDAV are refused, recorded and e-mailed with the sender's IP; repeat offenders are blocked.
* There is no admin panel, no login, no content-management endpoint and no username / password in the site – there is nothing to log in to. The chatbot refuses every request for credentials, source code, server access, or to edit / add / delete / publish content or open links, and never repeats a link.
* **Integrity guard**: on a production server (`NODE_ENV=production`, or `INTEGRITY_GUARD=enforce`) every served file is fingerprinted at start-up and re-checked every minute. A modified or deleted file is **restored**, an unknown file (picture, script, web shell) is **deleted**, and an alert e-mail is sent. `INTEGRITY_GUARD=monitor` only reports; `off` disables. Because updates are deployments (which restart the server and take a new snapshot) a normal update is never undone.
* Voice recordings are the only uploads. They are downloaded as attachments in a sandbox (never shown inside the site), cannot be listed, expire after 14 days, and can be switched off completely with `CHAT_VOICE=off`.

## Tests
`src/server/security.test.ts`, `sanitize.test.ts`, `stats.test.ts` (and the live attack run described in the hand-over) cover: 18 attack URL families, bans, rate limits, alert contents/throttling, CSP, audio sniffing, sanitising, privacy.

## What no code in this project can do (needs the hosting side)
* **Large DDoS attacks** must be absorbed before they reach the server – put the domain behind Cloudflare (free plan is enough) or the host's built-in protection.
* **HTTPS** must be on (the host normally does this); HSTS then locks it in.
* Keep the GitHub account protected with two-factor authentication, and keep branch protection on `main`.
* The IP shown in alerts is the one the host's proxy reports. If your host does not forward the visitor's real IP, alerts show the proxy address and automatic blocking stays inactive (by design, to avoid blocking everyone).
* No system is "unhackable". This setup closes the common routes, detects and reports attempts, and limits damage; keep dependencies updated.

## Final audit additions

- Host header protection (`host-guard.ts`): a forged `Host` / `X-Forwarded-Host` is replaced by the real domain, so canonical links, robots.txt, sitemap and report origins can never point to an attacker's address. Extra legitimate hosts: `ALLOWED_HOSTS=a.com,b.com`.
- Contact form validates required fields in the browser before anything is sent.
- AI endpoint: instruction-override probes in all nine site languages are refused server-side as well; the model prompt contains no private addresses.
- Mail: use a dedicated sending Gmail account (App password gives mailbox access) and forward to the owner with `MAIL_TO`.
- Voice notes (only kept when speech-to-text produced nothing) are deleted after `CHAT_VOICE_DAYS` (default 3).
