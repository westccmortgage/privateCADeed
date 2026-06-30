# Deploy & environment setup (Netlify)

CADeed builds on Netlify via `@netlify/plugin-nextjs` (see `netlify.toml`). Set
the environment variables below in **Netlify → Site settings → Environment
variables**, then deploy.

## 1) Required for the AI engine (Anthropic Claude)
| Variable | Value |
| --- | --- |
| `ANTHROPIC_API_KEY` | your Claude key — console.anthropic.com → Settings → API keys → Create Key (`sk-ant-api03-…`) |
| `ANTHROPIC_MODEL` | optional; default `claude-haiku-4-5`. Use `claude-opus-4-8` or `claude-sonnet-4-6` for more power |

> Without a key the app still runs on the deterministic fallback extractor — it
> just won't use the LLM for language understanding. Claude only extracts facts;
> all math is deterministic TypeScript.

## 2) Get leads by email — pick ONE (recommended before launch)

### Easiest: Web3Forms (free, paste-and-go) ✅
1. Open **https://web3forms.com** and enter **westccmortgage@gmail.com**.
2. They email you an **Access Key** (a UUID).
3. In Netlify add:
   - `WEB3FORMS_ACCESS_KEY` = the key
4. Redeploy. Every submitted scenario and capital-source profile now arrives in
   your inbox.

### Zero-signup: FormSubmit
- Add `FORMSUBMIT_EMAIL` = `westccmortgage@gmail.com`.
- The **first** submission sends a one-time activation email — click to confirm.

### Most control: Resend (needs a verified domain)
- Add `RESEND_API_KEY` (from https://resend.com).
- Optional: `NOTIFY_EMAIL` (recipient), `NOTIFY_FROM` (e.g. `CADeed <deals@cadeed.com>`).

The app auto-detects the provider in this order: Resend → Web3Forms → FormSubmit.

## 3) Optional: "Book a deal review" scheduling
Let visitors self-book a meeting (the proper way to "book"):
1. Create a free **Calendly** (or Cal.com) account with `westccmortgage@gmail.com`.
2. Make an event like **"Deal Review — 15 min"**, connect your calendar, set hours.
3. Copy your link, e.g. `https://calendly.com/westccmortgage/deal-review`.
4. In Netlify add `NEXT_PUBLIC_BOOKING_URL` = that link, then **redeploy**.

The `/#book` section now shows a **"Pick a time"** button (self-booking) with the
callback form as a fallback. If `NEXT_PUBLIC_BOOKING_URL` is unset, only the
callback form is shown — submissions email you via the provider in step 2.

## 4) Optional: full CRM routing (GRCRM)
| Variable | Value |
| --- | --- |
| `GRCRM_WEBHOOK_URL` | your GRCRM endpoint (or a Zapier/Make/Google-Sheet catch hook) |
| `GRCRM_WEBHOOK_SECRET` | any secret — payloads are signed `X-CADeed-Signature: sha256=…` |

When set, the full structured payload (scenario, calc, consent, compliance
flags, `lenderMatchCriteria`, routing status) is POSTed there. Email forwarding
and GRCRM can both be on at once.

## Notes
- Nothing is sent for review until the user gives explicit consent.
- No secrets are committed — only `.env.example`. Set real values in Netlify.
