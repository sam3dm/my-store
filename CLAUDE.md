# Project notes for Claude

Read `docs/PROJECT_STATUS.md` first: it states what is finished, how the site is deployed (Render, from `render.yaml`), and what remains. Related docs: `docs/SECURITY.md`, `docs/CHATBOT.md`, `docs/SEO.md`, `docs/CRM_PLAN.md` (agreed CRM plan, NOT implemented until the owner says "اعتمد").

Rules: reply to the owner in Arabic; never ask for or store keys/passwords; reports go only to the owner's Gmail through SMTP; the site must stay read-only for visitors; run `npx tsc --noEmit -p .` and `npx vitest run` before pushing.
