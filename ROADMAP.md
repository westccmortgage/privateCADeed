# CADeed.com — Feature Roadmap & Menu Architecture

A living catalog of functionality for the California Deal Intake Terminal and
the GRCRM-routed private-capital marketplace.

**Legend:** ✅ built in V3 · 🔜 next (quick win) · 🧭 future (platform/marketplace)

---

## Part 1 — Navigation / mega-menu architecture (what to surface)

The Apple-style top bar can carry a rich, multifunctional set of menus. Proposed
top-level items, each opening a mega-menu with columns:

1. **Product / The Engine**
   - How it works ✅ · Deal terminal ✅ · Conversational AI ✅ · Deterministic underwriting ✅ · Voice intake ✅ · Confidence & "explain this number" 🔜
2. **Solutions (capital paths)**
   - Cash-Out & Refinance ✅ · 2nd Deed of Trust ✅ · Fix & Flip / Bridge ✅ · Construction Completion ✅ · DSCR / Rental 🔜 · Commercial / Mixed-use 🧭 · Land 🧭
3. **For Borrowers**
   - Start a scenario ✅ · Save & resume 🔜 · Upload documents 🔜 · Book a deal review ✅ · FAQ 🔜
4. **For Brokers**
   - Broker workspace 🧭 · Submit client deals ✅ · Pipeline & status 🧭 · Co-brand / white-label 🧭 · Commission tracking 🧭
5. **For Capital Sources**
   - Submit lending box ✅ · Lender portal 🧭 · Matched scenarios 🧭 · How routing works ✅ · Response SLA 🧭
6. **Tools / Calculators**
   - CLTV calculator 🔜 · LTV / LTC 🔜 · ARV & flip-profit 🔜 · DSCR 🔜 · Max-loan solver 🔜 · Payment & points estimator 🔜
7. **Resources**
   - Lien-position basics ✅ · Understanding CLTV ✅ · Business vs. consumer ✅ · Glossary 🔜 · California guide 🔜 · Blog / case studies 🧭
8. **Company**
   - About ✅ · Compliance & licensing 🔜 · Privacy & data 🔜 · Contact 🔜 · Careers 🧭

---

## Part 2 — Feature catalog by domain

### A. Conversational intake engine
- Multi-turn conversation that updates the scenario without restarting ✅
- Quick-reply chips for the next best question ✅
- Microphone dictation (continuous, hands-free) ✅
- Inline edit of any extracted field (correct what the AI misread) 🔜
- Per-field confidence + "Did you mean $3,000,000?" confirmations 🔜
- "Explain this number" popovers (how CLTV/LTC was computed) 🔜
- Text-to-speech read-back of the assistant (voice-to-voice) 🧭
- Multi-language intake — Spanish first (huge in CA), then Mandarin/Russian 🧭
- Save & resume a scenario via magic link / email 🔜
- Scenario versioning & side-by-side comparison 🧭
- Paste a property address → auto-fill value via AVM 🧭
- Drop a flyer / term sheet (PDF/image) → AI extracts the deal 🧭

### B. Underwriting / calculation engine (always deterministic)
- LTV, CLTV (primary for 2nds), LTC, ARV-LTV, equity, total debt ✅
- Capital-path + scenario strength + risk notes + restructure options ✅
- DSCR / rental coverage (rent, NOI, expenses) 🔜
- Indicative rate & points **ranges** (compliance-safe, never a quote) 🔜
- Monthly payment / interest-reserve estimates 🔜
- Max-loan solver ("max I can get at 65% CLTV") 🔜
- Flip profit / ROI (ARV − purchase − rehab − financing − selling costs) 🔜
- Cross-collateral / multi-property scenarios 🧭
- Sensitivity analysis (value −10%, rate +1%) 🧭
- Configurable guideline profiles per lender box 🧭

### C. Capital-source (lender) platform
- Lending-box intake → GRCRM `capitalSourceProfile` ✅
- HMAC-signed, consent-backed payloads ✅
- Lender portal/login: view matched scenarios, accept / pass 🧭
- Indicative-terms submission back into GRCRM 🧭
- Lender reliability / response-SLA scoring 🧭
- New-match notifications (email / SMS / Slack) 🔜

### D. Matching & routing intelligence (GRCRM)
- `lenderMatchCriteria` produced per scenario ✅
- Auto-match scenario → fitting lender boxes (score + ranked list) 🧭
- Waterfall / round-robin / geographic routing rules 🧭
- Routing pipeline: new → matched → contacted → quoted → won/lost 🧭
- CAN-SPAM-compliant auto-email of structured deal summaries 🧭
- Two-sided handshake & status sync 🧭

### E. Documents & data
- Secure document vault per scenario (bank statements, title, entity docs) 🔜
- AI document classification + checklist auto-complete 🧭
- OCR extraction from uploads into the scenario 🧭
- Auto-generated Deal Summary PDF / one-pager 🔜
- E-signature for consent & engagement letters 🧭

### F. Accounts, CRM & pipeline
- Borrower / broker accounts (magic-link or OAuth) 🔜
- Saved scenarios & history 🔜
- Broker workspace managing many clients/deals 🧭
- Team / brokerage multi-user with roles 🧭
- Per-deal activity timeline, tasks, reminders, notes 🧭

### G. Communication
- Email notifications (received, lender interest, status change) 🔜
- SMS / WhatsApp updates (Twilio) 🔜
- In-app messaging borrower ↔ broker ↔ lender 🧭
- Calendar booking for deal review (Calendly-style) 🔜
- Automated follow-up sequences 🧭

### H. Compliance & legal (load-bearing for lending)
- Forbidden-language scrubbing everywhere ✅
- Consent gate before any GRCRM send ✅
- Owner-occupied caution + business-purpose question ✅
- Standard disclaimer below results ✅
- Timestamped consent audit log (IP + version) in GRCRM 🔜
- NMLS / DRE license display + per-state rules engine 🔜
- Business-purpose attestation form 🔜
- Owner-occupied / consumer → licensed-only routing path 🧭
- Privacy policy, Terms, CCPA/GLBA data handling & retention 🔜
- Per-scenario disclosure generator 🧭

### I. Analytics & admin
- Admin dashboard: volume, conversion, by path/city 🧭
- Funnel analytics (drop-off points) 🧭
- Lender-performance analytics 🧭
- California demand heatmap 🧭
- CSV / BI export 🔜
- A/B testing of questions & flow 🧭

### J. Integrations
- AVM / property data by address 🧭
- Title / county records 🧭
- Soft-pull credit (compliance-gated) 🧭
- Zapier / webhooks for partners 🔜
- Twilio (SMS), SendGrid/Resend (email), DocuSign 🔜
- LOS / accounting export 🧭

### K. Growth & monetization
- Capital-source subscription / per-deal fee 🧭
- Broker referral program 🧭
- SEO resource hub ("capital paths explained") 🔜
- White-label for brokerages 🧭
- Multi-language SEO 🧭

### L. Platform / technical
- PWA (installable, offline draft) 🔜
- Auth, rate-limiting, security hardening 🔜
- Public partner API + webhooks 🧭
- Audit logging & observability 🧭
- Feature flags 🔜

---

## Part 3 — Phased rollout

**Phase 1 — Quick wins (weeks):** Tools/calculators pages · Save & resume · Email/SMS
notifications · Inline field edit · Confidence + confirmations · Deal Summary PDF ·
Resources hub + Glossary · Compliance pages (licensing/privacy/terms) · Consent audit log.

**Phase 2 — Platform:** Accounts (borrower/broker) · Document vault · Broker workspace ·
Lender portal · GRCRM auto-match + routing pipeline · Admin analytics.

**Phase 3 — Marketplace & intelligence:** Two-sided handshake & quoting · Match scoring ·
AVM / title / credit integrations · White-label · Multi-language · Profit & sensitivity
modeling · E-signature.

---

## Part 4 — Highest-leverage quick wins (do first)
1. **Tools/Calculators** mega-menu (CLTV, LTV/LTC, ARV-profit, DSCR, max-loan) — standalone,
   reuses the existing deterministic engine, great SEO + utility.
2. **Save & resume + email notification** — captures leads that don't finish.
3. **Deal Summary PDF** — instant value for borrower, broker, and lender.
4. **Compliance pages** (licensing, privacy, terms, consent log) — required to scale safely.
5. **SMS/email status updates via Twilio** — you already run Twilio.
