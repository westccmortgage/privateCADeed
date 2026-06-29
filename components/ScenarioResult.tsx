"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Wallet,
  HandCoins,
  TrendingUp,
  Layers,
  Target,
  HelpCircle,
  MessageCircleQuestion,
  Bookmark,
  Send,
  CalendarCheck,
  Route,
  ShieldAlert,
  Check,
} from "lucide-react";
import type { AnalyzeDealResponse, ScenarioStrength } from "@/lib/types";

interface ScenarioResultProps {
  data: AnalyzeDealResponse;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}

function formatMoney(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPercent(n: number | null): string {
  if (n == null) return "—";
  return `${n}%`;
}

const STRENGTH_STYLES: Record<ScenarioStrength, string> = {
  Strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  "Needs Restructure": "bg-orange-50 text-orange-700 border-orange-200",
  "Needs More Info": "bg-slate-100 text-slate-600 border-slate-200",
};

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-white/70 p-4">
      <div className="flex items-center gap-2 text-navy-muted">
        <span className="text-navy-muted">{icon}</span>
        <span className="text-[12px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`mt-2 text-[20px] font-semibold tracking-tight ${
          accent ? "text-gold" : "text-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ScenarioResult({
  data,
  onSave,
  saving,
  saved,
}: ScenarioResultProps) {
  const { extracted, calculated, missingInformation, nextBestQuestion } = data;
  const [showAllRisks, setShowAllRisks] = useState(false);

  const requestedDisplay =
    extracted.requestedLoanAmount ??
    extracted.requestedCashOut ??
    extracted.constructionBudget ??
    null;

  const risksToShow = showAllRisks
    ? calculated.riskNotes
    : calculated.riskNotes.slice(0, 2);

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full"
      aria-live="polite"
    >
      <div className="glass-card overflow-hidden rounded-card shadow-lift">
        {/* Header bar */}
        <motion.div
          variants={item}
          className="flex items-center justify-between border-b border-hairline bg-white/50 px-6 py-5 sm:px-8"
        >
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-navy sm:text-[22px]">
              CA Deed Scenario
            </h2>
            <p className="mt-0.5 text-[13px] text-navy-muted">
              Generated from your description · subject to review
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-gold">
            Preliminary
          </span>
        </motion.div>

        <div className="space-y-6 p-6 sm:p-8">
          {/* Core stat grid */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            <Stat
              icon={<MapPin size={15} />}
              label="Location"
              value={extracted.propertyLocation ?? "—"}
            />
            <Stat
              icon={<Building2 size={15} />}
              label="Estimated Value"
              value={formatMoney(extracted.estimatedValue)}
            />
            <Stat
              icon={<Wallet size={15} />}
              label="Current Debt"
              value={formatMoney(extracted.currentDebt)}
            />
            <Stat
              icon={<HandCoins size={15} />}
              label="Requested Loan"
              value={formatMoney(requestedDisplay)}
            />
            <Stat
              icon={<HandCoins size={15} />}
              label="Cash-Out"
              value={formatMoney(extracted.requestedCashOut)}
            />
            <Stat
              icon={<Target size={15} />}
              label="Loan Purpose"
              value={extracted.loanPurpose ?? "—"}
            />
            <Stat
              icon={<TrendingUp size={15} />}
              label="Estimated LTV"
              value={formatPercent(calculated.estimatedLTV)}
              accent
            />
            <Stat
              icon={<Layers size={15} />}
              label="Estimated CLTV"
              value={formatPercent(calculated.estimatedCLTV)}
              accent
            />
            <Stat
              icon={<Wallet size={15} />}
              label="Equity Remaining"
              value={formatMoney(calculated.equityRemaining)}
            />
          </motion.div>

          {/* Likely capital path */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-navy/10 bg-navy p-6 text-white"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <Route size={18} className="text-gold-soft" />
                </span>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wide text-white/55">
                    Likely Capital Path
                  </p>
                  <p className="text-[19px] font-semibold tracking-tight">
                    {calculated.possibleCapitalPath}
                  </p>
                </div>
              </div>
              <span
                className={`hidden shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold sm:inline-block ${STRENGTH_STYLES[calculated.scenarioStrength]}`}
              >
                {calculated.scenarioStrength}
              </span>
            </div>
            <p className="mt-4 text-[14.5px] leading-relaxed text-white/75">
              {calculated.capitalPathDescription}
            </p>
            <span
              className={`mt-4 inline-block rounded-full border px-3 py-1 text-[12px] font-semibold sm:hidden ${STRENGTH_STYLES[calculated.scenarioStrength]}`}
            >
              {calculated.scenarioStrength}
            </span>
          </motion.div>

          {/* Restructure options (only when present) */}
          {data.restructureOptions.length > 0 && (
            <motion.div
              variants={item}
              className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5"
            >
              <p className="text-[14px] font-semibold text-orange-800">
                This scenario may need restructuring
              </p>
              <ul className="mt-3 space-y-2">
                {data.restructureOptions.map((opt) => (
                  <li
                    key={opt}
                    className="flex items-start gap-2 text-[14px] text-orange-900/85"
                  >
                    <Check size={16} className="mt-0.5 shrink-0 text-orange-500" />
                    {opt}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Risk notes */}
          {calculated.riskNotes.length > 0 && (
            <motion.div variants={item} className="rounded-2xl border border-hairline bg-white/70 p-5">
              <div className="flex items-center gap-2 text-navy">
                <ShieldAlert size={16} className="text-gold" />
                <span className="text-[13px] font-semibold uppercase tracking-wide">
                  Risk Notes
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {risksToShow.map((note) => (
                  <li
                    key={note}
                    className="flex items-start gap-2 text-[14px] leading-relaxed text-navy-soft"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {note}
                  </li>
                ))}
              </ul>
              {calculated.riskNotes.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllRisks((v) => !v)}
                  className="mt-3 text-[13px] font-medium text-navy-muted underline-offset-2 hover:underline"
                >
                  {showAllRisks
                    ? "Show fewer"
                    : `Show ${calculated.riskNotes.length - 2} more`}
                </button>
              )}
            </motion.div>
          )}

          {/* Missing + next question */}
          <motion.div variants={item} className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline bg-white/70 p-5">
              <div className="flex items-center gap-2 text-navy">
                <HelpCircle size={16} className="text-navy-muted" />
                <span className="text-[13px] font-semibold uppercase tracking-wide">
                  What&apos;s Missing?
                </span>
              </div>
              {missingInformation.length === 0 ? (
                <p className="mt-3 text-[14px] text-navy-soft">
                  Nothing critical — this scenario is ready for review.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {missingInformation.map((m) => (
                    <li
                      key={m}
                      className="flex items-start gap-2 text-[14px] leading-relaxed text-navy-soft"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy/30" />
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-gold/25 bg-gold/[0.06] p-5">
              <div className="flex items-center gap-2 text-navy">
                <MessageCircleQuestion size={16} className="text-gold" />
                <span className="text-[13px] font-semibold uppercase tracking-wide">
                  Next Best Question
                </span>
              </div>
              <p className="mt-3 text-[15px] font-medium leading-relaxed text-navy">
                {nextBestQuestion}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={item}
            className="flex flex-col gap-3 pt-1 sm:flex-row"
          >
            <button
              type="button"
              onClick={onSave}
              disabled={saving || saved}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline bg-white/80 px-5 py-3 text-[14px] font-semibold text-navy transition-colors hover:border-navy/20 disabled:opacity-70"
            >
              {saved ? <Check size={17} /> : <Bookmark size={17} />}
              {saved ? "Scenario Saved" : saving ? "Saving…" : "Save Scenario"}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-navy-soft"
            >
              <Send size={16} />
              Send This Scenario for Review
            </button>
            <a
              href="#book"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-3 text-[14px] font-semibold text-navy transition-colors hover:bg-gold/20"
            >
              <CalendarCheck size={16} className="text-gold" />
              Book Deal Review
            </a>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
