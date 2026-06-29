"use client";

import { useRef, useState } from "react";
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
import ScenarioResult from "@/components/ScenarioResult";
import ComplianceNotice from "@/components/ComplianceNotice";
import Footer from "@/components/Footer";
import type { AnalyzeDealResponse } from "@/lib/types";

const HOW_IT_WORKS = [
  {
    icon: ScanLine,
    title: "Describe",
    body: "Tell the engine your deal in plain English. No forms, no fields, no application.",
  },
  {
    icon: Calculator,
    title: "Calculate",
    body: "Deterministic models compute LTV, CLTV, leverage, and equity — the numbers are never guessed.",
  },
  {
    icon: Route,
    title: "Map the path",
    body: "See the likely private capital structure, what's missing, and the next best question.",
  },
];

const SOLUTIONS = [
  {
    icon: RefreshCw,
    title: "Cash-Out & Refinance",
    body: "Unlock equity through a new 1st or a 2nd deed of trust, sized against combined leverage.",
  },
  {
    icon: Hammer,
    title: "Fix & Flip / Bridge",
    body: "Short-term capital underwritten against cost and after-repair value.",
  },
  {
    icon: Building,
    title: "Construction Completion",
    body: "Capital to finish stalled or bank-declined projects, funded to the remaining budget.",
  },
  {
    icon: Layers,
    title: "2nd Deed of Trust",
    body: "Subordinate financing behind an existing first when leverage allows.",
  },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeDealResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function analyze() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/analyze-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong analyzing the deal.");
      }
      setResult(data as AnalyzeDealResponse);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function saveScenario() {
    if (!result || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/save-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawUserInput: result.rawUserInput,
          extractedScenario: result.extracted,
          calculatedScenario: result.calculated,
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // Non-blocking: keep the UI calm even if the CRM forward fails.
    } finally {
      setSaving(false);
    }
  }

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
              California Private Capital Engine
            </span>
            <h1 className="mt-6 text-balance text-[34px] font-semibold leading-[1.08] tracking-tight text-navy sm:text-[48px]">
              Describe your California real estate deal.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-[17px] leading-relaxed text-navy-muted sm:text-[19px]">
              The engine will calculate the private capital path.
            </p>
          </motion.div>

          {/* Command box */}
          <div className="mx-auto mt-10 max-w-3xl">
            <DealCommandBox
              value={input}
              onChange={setInput}
              onSubmit={analyze}
              loading={loading}
            />
            {error && (
              <p className="mt-3 text-center text-[14px] font-medium text-red-600">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* Result panel */}
        <div ref={resultRef} className="scroll-mt-24">
          {result && (
            <section className="mx-auto mt-12 max-w-3xl">
              <ScenarioResult
                data={result}
                onSave={saveScenario}
                saving={saving}
                saved={saved}
              />
              <ComplianceNotice />
            </section>
          )}
        </div>

        {/* How it works */}
        <section id="how-it-works" className="mt-28 scroll-mt-24">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
            How It Works
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="glass-card rounded-card p-6 shadow-soft"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
                  <step.icon size={20} />
                </span>
                <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-navy-muted">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Solutions */}
        <section id="solutions" className="mt-24 scroll-mt-24">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
            Solutions
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {SOLUTIONS.map((sol, i) => (
              <motion.div
                key={sol.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="glass-card flex gap-4 rounded-card p-6 shadow-soft"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <sol.icon size={20} />
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold tracking-tight text-navy">
                    {sol.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-navy-muted">
                    {sol.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="mt-24 scroll-mt-24">
          <div className="glass-card mx-auto max-w-3xl rounded-card p-8 text-center shadow-soft sm:p-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
              About Us
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-[19px] font-medium leading-relaxed text-navy sm:text-[22px]">
              CADeed is a private capital intelligence engine for California real
              estate. It reads a deal the way an experienced capital desk would —
              then maps the structure, the math, and the missing pieces in
              seconds.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-navy-muted">
              We pair deterministic underwriting math with language understanding,
              so the numbers are never invented — only the reasoning is
              accelerated.
            </p>
          </div>
        </section>

        {/* Resources */}
        <section id="resources" className="mt-24 scroll-mt-24">
          <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-navy-muted">
            Resources
          </h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              "California lien position basics",
              "Business-purpose vs. consumer loans",
              "Understanding CLTV and equity",
            ].map((r) => (
              <div
                key={r}
                className="glass-card flex items-center justify-between gap-3 rounded-2xl p-5 shadow-soft"
              >
                <span className="text-[14px] font-medium text-navy">{r}</span>
                <ArrowRight size={16} className="shrink-0 text-navy-muted" />
              </div>
            ))}
          </div>
        </section>

        {/* Book Deal Review CTA */}
        <section id="book" className="mt-24 scroll-mt-24">
          <div className="mx-auto max-w-3xl rounded-card bg-navy p-8 text-center shadow-lift sm:p-12">
            <h2 className="text-[26px] font-semibold tracking-tight text-white sm:text-[32px]">
              Book a deal review.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/70">
              Bring your scenario to a licensed professional and a private capital
              source for a real, structured conversation.
            </p>
            <a
              href="mailto:deals@cadeed.com?subject=CADeed%20Deal%20Review"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-navy transition-transform hover:-translate-y-0.5"
            >
              Request a Deal Review
              <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
