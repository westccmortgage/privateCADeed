"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  Calculator,
  Route,
  ArrowRight,
  RefreshCw,
  Hammer,
  Layers,
  Building,
} from "lucide-react";
import Header from "@/components/Header";
import DealCommandBox from "@/components/DealCommandBox";
import ConversationLog from "@/components/ConversationLog";
import EngineDemo from "@/components/EngineDemo";
import ScenarioResult from "@/components/ScenarioResult";
import ConsentSubmitPanel from "@/components/ConsentSubmitPanel";
import ComplianceNotice from "@/components/ComplianceNotice";
import Footer from "@/components/Footer";
import type {
  CalculatedScenario,
  ChatDealResponse,
  ChatTurn,
  ComplianceFlags,
  ExtractedScenario,
  UserContact,
} from "@/lib/types";
import BookReview from "@/components/BookReview";
import { useLocale } from "@/lib/i18n/LocaleProvider";

// Icons + hrefs are static; the title/body text comes from the dictionary by index.
const HOW_IT_WORKS = [
  { icon: ScanLine, href: "/#top" },
  { icon: Calculator, href: "/tools" },
  { icon: Route, href: "/company" },
];

const SOLUTIONS = [
  { icon: RefreshCw, href: "/solutions#cash-out" },
  { icon: Hammer, href: "/solutions#fix-flip" },
  { icon: Building, href: "/solutions#construction" },
  { icon: Layers, href: "/solutions#second" },
];

// Prefill examples when a Solutions card / menu item points at /?start=<key>.
const START_EXAMPLES: Record<string, string> = {
  cashout: "I need $300K cash-out on a Los Angeles property worth $1.2M. I owe $520K.",
  flip: "I'm buying a fix and flip in Sherman Oaks for $900K with $150K rehab. ARV around $1.35M.",
  construction: "My bank declined my construction loan. I need $600K to finish a project in San Diego.",
  second:
    "I need a $250K second deed of trust in California. Property is worth $2M, first loan is $900K.",
};

export default function Home() {
  const { t } = useLocale();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [scenario, setScenario] = useState<ExtractedScenario | null>(null);
  const [calculated, setCalculated] = useState<CalculatedScenario | null>(null);
  const [missingInformation, setMissingInformation] = useState<string[]>([]);
  const [nextBestQuestion, setNextBestQuestion] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [restructureOptions, setRestructureOptions] = useState<string[]>([]);
  const [compliance, setCompliance] = useState<ComplianceFlags | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const [contact, setContact] = useState<UserContact>({});
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const conversationRef = useRef<HTMLDivElement>(null);

  // Prefill the terminal from a Solutions card / menu link (/?start=cashout).
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("start");
    if (key && START_EXAMPLES[key]) {
      setInput(START_EXAMPLES[key]);
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: "smooth" }),
      );
    }
  }, []);

  const handleTry = useCallback((key: string) => {
    const ex = START_EXAMPLES[key];
    if (ex) {
      setInput(ex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || loading) return;

      setError(null);
      setSubmitted(false);
      const priorConversation = messages;
      setMessages((prev) => [...prev, { role: "user", content: msg }]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat-deal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: msg,
            currentScenario: scenario,
            conversation: priorConversation,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? t.home.errorGeneric);

        const d = data as ChatDealResponse;
        setMessages((prev) => [...prev, { role: "assistant", content: d.assistantMessage }]);
        setScenario(d.mergedScenario);
        setCalculated(d.calculated);
        setMissingInformation(d.missingInformation);
        setNextBestQuestion(d.nextBestQuestion);
        setQuickReplies(d.quickReplies);
        setRestructureOptions(d.restructureOptions);
        setCompliance(d.compliance);
        setCanSubmit(d.canSubmit);

        requestAnimationFrame(() => {
          conversationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t.home.errorUnexpected);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: t.home.chatErrorReply,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, scenario, t],
  );

  const sendScenario = useCallback(async () => {
    if (!scenario || !calculated || submitting) return;
    if (!consent) {
      setSubmitMessage("Please authorize the review with the consent box first.");
      return;
    }
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await fetch("/api/save-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawUserInput: messages.find((m) => m.role === "user")?.content ?? "",
          rawConversation: messages,
          extractedScenario: scenario,
          calculatedScenario: calculated,
          missingInformation,
          nextBestQuestion,
          consentGiven: consent,
          userContact: contact,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not send the scenario.");
      setSubmitted(true);
      setSubmitMessage(data.message ?? "Scenario received for review.");
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : "Could not send the scenario.");
    } finally {
      setSubmitting(false);
    }
  }, [
    calculated,
    consent,
    contact,
    messages,
    missingInformation,
    nextBestQuestion,
    scenario,
    submitting,
  ]);

  return (
    <div id="top" className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-engine px-5 sm:px-8">
        {/* Hero */}
        <section className="pt-14 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-block rounded-full border border-hairline bg-white/60 px-3.5 py-1.5 text-[12.5px] font-medium tracking-wide text-navy-muted">
              {t.home.eyebrow}
            </span>
            <h1 className="mt-6 text-balance text-[34px] font-semibold leading-[1.08] tracking-tight text-navy sm:text-[48px]">
              {t.home.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-[17px] leading-relaxed text-navy-muted sm:text-[19px]">
              {t.home.heroSub}
            </p>
            <p className="mx-auto mt-3 max-w-lg text-balance text-[14px] leading-relaxed text-navy-muted/85">
              {t.home.heroReassure}
            </p>

            {/* Helper links for first-time visitors */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <a
                href="/resources"
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-navy-soft transition-colors hover:border-navy/20 hover:text-navy"
              >
                {t.home.helperWhatIs}
              </a>
              <a
                href="/solutions"
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-navy-soft transition-colors hover:border-navy/20 hover:text-navy"
              >
                {t.home.helperSeeOptions}
              </a>
              <a
                href="/#how-it-works"
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-navy-soft transition-colors hover:border-navy/20 hover:text-navy"
              >
                {t.home.helperHowItWorks}
              </a>
            </div>
          </motion.div>

          {/* Command box */}
          <div className="mx-auto mt-10 max-w-3xl">
            <DealCommandBox
              value={input}
              onChange={setInput}
              onSubmit={() => sendMessage(input)}
              loading={loading}
              placeholder={
                messages.length === 0
                  ? t.home.placeholderEmpty
                  : t.home.placeholderContinue
              }
              showExampleHint={messages.length === 0}
            />
            {error && (
              <p className="mt-3 text-center text-[14px] font-medium text-red-600">{error}</p>
            )}
          </div>
        </section>

        {/* Live engine demo — the hook (hidden once a conversation starts) */}
        {messages.length === 0 && (
          <section className="mx-auto mt-14 max-w-3xl sm:mt-16">
            <EngineDemo onTry={handleTry} />
          </section>
        )}

        {/* Conversation + live scenario */}
        <div ref={conversationRef} className="scroll-mt-24">
          {messages.length > 0 && (
            <section className="mx-auto mt-10 max-w-3xl">
              <ConversationLog
                messages={messages}
                quickReplies={quickReplies}
                onQuickReply={sendMessage}
                loading={loading}
              />
            </section>
          )}

          {scenario && calculated && (
            <section className="mx-auto mt-8 max-w-3xl space-y-6">
              <ScenarioResult
                scenario={scenario}
                calculated={calculated}
                missingInformation={missingInformation}
                nextBestQuestion={nextBestQuestion}
                restructureOptions={restructureOptions}
                ownerOccupied={compliance?.ownerOccupiedFlag ?? false}
              />

              <ConsentSubmitPanel
                contact={contact}
                onContactChange={setContact}
                consent={consent}
                onConsentChange={setConsent}
                onSubmit={sendScenario}
                submitting={submitting}
                submitted={submitted}
                submitMessage={submitMessage}
                ready={canSubmit}
              />

              <ComplianceNotice />
            </section>
          )}
        </div>

        {/* How it works */}
        <section id="how-it-works" className="mt-28 scroll-mt-24">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
            {t.home.howTitle}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.a
                key={t.home.how[i].title}
                href={step.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="glass-card group rounded-card p-6 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
                  <step.icon size={20} />
                </span>
                <h3 className="mt-4 flex items-center gap-1.5 text-[17px] font-semibold tracking-tight text-navy">
                  {t.home.how[i].title}
                  <ArrowRight
                    size={15}
                    className="-translate-x-1 text-navy/0 transition-all group-hover:translate-x-0 group-hover:text-navy/40"
                  />
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-navy-muted">
                  {t.home.how[i].body}
                </p>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Solutions */}
        <section id="solutions" className="mt-24 scroll-mt-24">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
            {t.home.solutionsTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-balance text-center text-[15px] leading-relaxed text-navy-muted">
            {t.home.solutionsIntro}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {SOLUTIONS.map((sol, i) => (
              <motion.a
                key={t.home.solutions[i].title}
                href={sol.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="glass-card group flex gap-4 rounded-card p-6 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <sol.icon size={20} />
                </span>
                <div className="flex-1">
                  <h3 className="flex items-center gap-1.5 text-[17px] font-semibold tracking-tight text-navy">
                    {t.home.solutions[i].title}
                    <ArrowRight
                      size={15}
                      className="-translate-x-1 text-navy/0 transition-all group-hover:translate-x-0 group-hover:text-navy/40"
                    />
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-navy-muted">
                    {t.home.solutions[i].body}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="mt-24 scroll-mt-24">
          <div className="glass-card mx-auto max-w-3xl rounded-card p-8 text-center shadow-soft sm:p-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
              {t.home.aboutTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-[19px] font-medium leading-relaxed text-navy sm:text-[22px]">
              {t.home.aboutLead}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-navy-muted">
              {t.home.aboutBody}
            </p>
          </div>
        </section>

        {/* Resources */}
        <section id="resources" className="mt-24 scroll-mt-24">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
            {t.home.resourcesTitle}
          </h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              { label: t.home.resources[0], href: "/resources#lien-basics" },
              { label: t.home.resources[1], href: "/resources#business-purpose" },
              { label: t.home.resources[2], href: "/resources#cltv" },
            ].map((r) => (
              <a
                key={r.href}
                href={r.href}
                className="glass-card group flex items-center justify-between gap-3 rounded-2xl p-5 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <span className="text-[14px] font-medium text-navy">{r.label}</span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-navy-muted transition-transform group-hover:translate-x-0.5"
                />
              </a>
            ))}
          </div>
        </section>

        {/* Book Deal Review CTA */}
        <section id="book" className="mt-24 scroll-mt-24">
          <div className="mx-auto max-w-3xl rounded-card bg-navy p-8 text-center shadow-lift sm:p-12">
            <h2 className="text-[26px] font-semibold tracking-tight text-white sm:text-[32px]">
              {t.home.bookTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/70">
              {t.home.bookSub}
            </p>
            <BookReview />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
