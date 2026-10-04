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

## The report
When the visitor leaves a mobile number (or closes the chat after leaving one), one report is sent through the existing contact endpoint (`/api/contact/contact-us`) to the address configured in `src/lib/contact-form.config.json` (`overrideEmail`). It contains a table (name, mobile, phone, business field, services, platforms, location, approach, notes, voice link), a one-paragraph summary and the last messages of the conversation.

## Voice messages
The microphone button records up to 2 minutes and uploads to `/api/chat/voice`; the link is included in the report. Files live in the server temp folder (`CHAT_VOICE_DIR` overrides it) for 30 days. If the host starts from a fresh disk on every restart, older recordings can disappear.

## Editing
* Reply wording and the conversation logic: `src/lib/chatbot/engine.ts`
* Questions and what the bot extracts (platforms, locations, approach): `src/lib/chatbot/discovery.ts`
* Synonyms for each service / industry and informational answers: `src/lib/chatbot/knowledge.ts`
* Report layout: `src/lib/chatbot/report.ts`
* Tests: `src/lib/chatbot/__tests__/engine.test.ts`
