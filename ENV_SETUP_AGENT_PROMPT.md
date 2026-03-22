# Env Setup Agent Prompt (GPA Standard)

Use this exact prompt in `cursor.com/onboard`:

> Analyze this Next.js repository and update the cloud agent environment setup for GPA Standard.  
> Requirements: preinstall and cache dependencies `openai`, `@supabase/supabase-js`, `resend`, `tesseract.js`; ensure Node/npm versions are compatible with Next.js 16 and TypeScript 5; optimize startup so `npm run lint` and `npm run build` are ready to run with minimal warmup.  
> Add support guidance for required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.  
> Keep setup idempotent and fast for repeated cloud agents.

## Notes

- App routes requiring external services:
  - `POST /api/syllabus/chat` uses OpenAI when `OPENAI_API_KEY` exists.
  - `POST /api/notifications/reminders` uses Resend keys.
- Supabase SQL migration file is at:
  - `supabase/migrations/20260221_gpastand_feature_expansion.sql`
