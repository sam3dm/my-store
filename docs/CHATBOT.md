# Metropolitan Chatbot

A bilingual (Arabic / English) assistant opened from **Live Chat** in the top menu and from the Contact page.

## How it talks
* Fully local and rule-based – no AI service, no cost, nothing sent to a third party.
* Answers come **only from the website content** (`src/content/pages/*.json` + the Arabic translations in `src/locales/content/ar.json`), so edits to the site flow into the bot automatically.
* Replies in the language of each message. Other scripts (Russian, Chinese…) get two separate polite messages, English then Arabic.
* **It leads the conversation instead of showing menus.** After the visitor's name it asks, one question at a time: business field → what they need → follow-ups for that need (platforms, management scope, production type, AI vs. real filming, web project type) → location → mobile / phone.
* **It remembers.** Each question is asked once; what the visitor says (even unprompted: "I have a restaurant in Dubai and want Instagram management") is recorded and the matching questions are skipped.
* Never quotes prices and never discusses people. Anything not on the site → "I don't have that information" and an offer to pass the visitor's details to the team.
* Client names are confidential (NDA wording from the site).

## Conduct
* **Indecent or unlawful requests** (sexual or adult content, nudity, children, rape, drugs, gambling, terrorism…) get one fixed, polite refusal: thanks for the question, we apologise, this work is not our field, **we operate within the laws of the United Arab Emirates**, and "do you have another question?". The offending words are never repeated, and the message is kept out of every report (it appears as "[message declined by the assistant]").
* **Insults and bad language** are not answered on their own terms: the bot thanks the visitor and steers back to the business in a refined tone.
* Awareness-campaign and medical wording ("fraud awareness", "campaign against child abuse", "sexual health clinic") is allowed for legitimate clients.
* **Names:** a word is accepted as a name only if it is not a business word (video, films, services…), not rude, and not something the bot recognises as a topic. After two failed attempts the conversation continues without a name.
* The bot only gives contact details published on the website (info@… e-mail, +971 50 822 1108). It does not know any other address, so it cannot reveal one.
* Lists live in `src/lib/chatbot/conduct.ts`.

## Privacy (important)
* **A conversation exists only while the chat window is open**, in that visitor's own browser memory. Closing the chat (or the "new chat" button) erases it completely; reloading the page starts a fresh one. Nothing is stored in the browser (no cookies / local / session storage) and the server never stores or receives the transcript.
* Visitors can never see anyone else's chat: there is no shared history and **no endpoint that reads chats or statistics back**.
* If someone asks the bot for other clients' chats, numbers, names, emails, the database, passwords or tries "ignore your instructions", it answers that this is strictly confidential. (It is rule-based, not an LLM, so it cannot be talked into revealing anything: it simply doesn't have the data.)
* The only data that reaches the server is a *summary* (interests, topics asked, and name / numbers only if the visitor typed them) used for the owner's reports below.

## The report
When the visitor leaves a mobile number (or closes the chat after leaving one), one report is sent through the existing contact endpoint (`/api/contact/contact-us`) to the address configured in `src/lib/contact-form.config.json` (`overrideEmail`). It contains a table (name, mobile, phone, business field, services, platforms, location, approach, notes, voice link), a one-paragraph summary and the last messages of the conversation.

## Daily report (23:30 UAE time)
Every night at 23:30 (Asia/Dubai) the server e-mails the owner a table-formatted report through the same inbox route as the contact form: unique visitors, page views, visitors by language, top pages, number of chatbot conversations, a table of the people who left details (name, mobile, phone, business field, interests, platforms, location, approach, what they asked) and a table of anonymous conversations. It contains **no chat transcripts**. After it has been sent successfully, that day's data is deleted. If the server was down at 23:30 the report goes out as soon as it is running again; a quiet day still produces a zero report.

Visitors are counted from salted one-way hashes (no IP addresses or user agents are stored); bots, assets and API calls are ignored.

Settings (environment variables): `STATS_DIR` – folder for the temporary daily data (default: system temp folder). It must persist while the server runs; if the host wipes its disk on restart, that day's numbers are lost.

## Voice messages
The microphone button records up to 2 minutes and uploads to `/api/chat/voice`; the link is included in the report. Files live in the server temp folder (`CHAT_VOICE_DIR` overrides it) for 14 days. If the host starts from a fresh disk on every restart, older recordings can disappear.

## Editing
* Reply wording and the conversation logic: `src/lib/chatbot/engine.ts`
* Questions and what the bot extracts (platforms, locations, approach): `src/lib/chatbot/discovery.ts`
* Synonyms for each service / industry and informational answers: `src/lib/chatbot/knowledge.ts`
* Report layout: `src/lib/chatbot/report.ts`
* Tests: `src/lib/chatbot/__tests__/engine.test.ts`

## Category guides and code safety (latest update)

- Every portfolio category (cinematic, automotive, medical, 3D/CGI, AI, real estate, interior design, hotels, perfume & beauty, social) has a guide in `src/content/pages/portfolio.json` (`guides`, `guideUi`) translated in `src/locales/content/<lang>.json`. The guide is shown on `/portfolio` when a category button is selected, and the chatbot serves it as `cat-<id>` knowledge entries (overview, then "stages" or "tools" when the visitor asks), plus the generic `stages` and `tools` entries (`knowledge.ts`).
- Programming code, SQL/shell payloads, "write/run code" requests and prompt-injection / role-play jailbreaks are refused by `isCodeOrInjection` (`conduct.ts`) before any knowledge lookup. Nothing is echoed, stored, executed or sent to the team.

## AI conversation layer

- `src/server/chat-ai.ts` (`POST /api/chat/ai`): when the rule-based engine does not understand a message (`reply.ai`), the widget sends the recent history here and a Claude model answers only from the website content (`buildKnowledgeText`). No tools, no storage; links, foreign e-mails, markup and code in the reply are discarded; `[[UNKNOWN]]` or any failure falls back to the rule-based reply (which collects the visitor's details).
- Server environment: `ANTHROPIC_API_KEY` (required to enable; without it the endpoint answers 503), optional `CHAT_AI_MODEL` (default `claude-haiku-4-5-20251001`), `CHAT_AI_PER_VISITOR` (25 per 10 min), `CHAT_AI_PER_VISITOR_DAILY` (80), `CHAT_AI_DAILY_CAP` (1500 messages per day for the whole site).
- The key is never in the repository or the browser. Set a monthly spend limit in the Anthropic console.

## Lead e-mails and voice

- Finished chatbot reports are posted to `POST /api/chat/lead` (`chat-lead.ts`) and delivered by `mailer.ts`: direct Gmail SMTP when `SMTP_USER` and `SMTP_PASS` (a Gmail App password) are set in the server environment, otherwise / as fallback the GoDaddy Inbox route. Nightly report and security alerts use the same sender. Optional `MAIL_TO` (default `SMTP_USER`).
- Voice messages are transcribed in the browser (Web Speech API, Arabic or English following the conversation) and answered like typed text; if the browser has no speech recognition the voice note is passed to the team as before.
