# CADeed.com — California Private Capital Engine

A private capital intelligence engine for California real estate. Describe a
deal in plain English; the engine extracts the facts, runs deterministic
underwriting math, and maps the likely private capital path — what's possible,
what's missing, and the next best question.

> This is not a loan approval or commitment to lend. All scenarios require
> review by a licensed mortgage professional and/or private capital source.

## Stack

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** for an Apple-style minimal UI
- **Framer Motion** for motion
- **Lucide React** for icons
- **OpenAI Responses API** for structured extraction (via a server route)

## How it works

1. **Extraction (AI):** `/api/analyze-deal` sends the user's text to the OpenAI
   Responses API with a strict JSON schema. The model **only extracts facts** —
   it never computes numbers. If `OPENAI_API_KEY` is missing (or the call
   fails), a deterministic regex fallback in `lib/mock-extractor.ts` is used so
   the app always works.
2. **Calculation (deterministic):** `lib/deal-calculator.ts` computes LTV, CLTV,
   LTC, ARV-LTV, equity, the capital path, scenario strength, risk notes,
   missing information, the next best question, and restructure options. The AI
   never invents the math.
3. **Result:** A premium dashboard panel renders the scenario, with actions to
   save the scenario or send it for review.

### Capital path logic

- Cash-out + current debt within ~70% CLTV → **2nd Deed of Trust** or
  **New 1st Refinance**.
- Purchase + rehab → **Fix & Flip / Bridge** (sized against LTC and ARV).
- Construction completion → **Construction Completion Capital**.
- High leverage is never "declined" — it returns **restructure options**
  (lower the loan, add collateral, new 1st instead of 2nd, staged funding,
  stronger exit).

## CRM integration

`/api/save-scenario` prepares a payload for GRCRM.com. If `GRCRM_WEBHOOK_URL`
is set, the scenario is POSTed to that webhook; otherwise the payload is logged.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your keys (optional — runs without them)
npm run dev
```

Open http://localhost:3000. The app works without an OpenAI key using the
deterministic fallback extractor.

### Environment variables

| Variable             | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `OPENAI_API_KEY`     | OpenAI key. If absent, the fallback extractor is used. |
| `OPENAI_MODEL`       | Model id (default `gpt-4.1-mini`).                     |
| `GRCRM_WEBHOOK_URL`  | If set, saved scenarios are POSTed here.               |

## Deploy (Netlify)

`netlify.toml` is configured for the Next.js runtime. Set the environment
variables in the Netlify dashboard and deploy.

## Project structure

```
app/
  api/analyze-deal/route.ts   # AI extraction + deterministic calc
  api/save-scenario/route.ts  # GRCRM payload + webhook forward
  page.tsx                    # homepage (command box + result)
  layout.tsx, globals.css
components/
  Header.tsx  DealCommandBox.tsx  ScenarioResult.tsx
  ComplianceNotice.tsx  Footer.tsx
lib/
  deal-calculator.ts   # deterministic math (never the AI)
  scenario-engine.ts   # ties extraction + calculation together
  openai-extract.ts    # OpenAI Responses API client
  mock-extractor.ts    # no-key fallback extractor
  examples.ts  types.ts
```
