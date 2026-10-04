# Metropolitan Chatbot

A small, bilingual (Arabic / English) assistant opened from **Live Chat** in the top menu and from the Contact page.

## How it answers
* Fully local and rule-based – no AI service, no cost, nothing sent to a third party.
* Answers are built **only from the website content** (`src/content/pages/*.json` and the Arabic translations in `src/locales/content/ar.json`). When you edit a service, industry or contact detail on the site, the bot follows automatically.
* It replies in the language of each message (Arabic ↔ English).
* It never quotes prices and never discusses individuals. Anything not on the site gets a polite "I don't have that information" and an offer to take the visitor's name, mobile and phone for the team.
* Leads are sent through the existing contact form endpoint (`/api/contact/contact-us`), so they reach the same inbox/email as the Contact form.

## Voice messages
The microphone button records a voice message (up to 2 minutes) and uploads it to `/api/chat/voice`. The link to the recording is included in the lead sent to the team. Files live in the server temp folder (`CHAT_VOICE_DIR` overrides it) and are removed after 30 days. If the host starts from a fresh disk on every deploy/restart, recordings made before that are lost.

## Editing
* Wording of replies: `src/lib/chatbot/engine.ts` (the `S` table).
* What the bot recognises (synonyms for each service/industry): `src/lib/chatbot/knowledge.ts`.
* Tests: `src/lib/chatbot/__tests__/engine.test.ts`.
