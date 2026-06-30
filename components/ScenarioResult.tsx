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
  Route,
  ShieldAlert,
  Check,
  Gauge,
  Landmark,
} from "lucide-react";
import type {
  CalculatedScenario,
  ExtractedScenario,
  ScenarioStrength,
} from "@/lib/types";
import { OWNER_OCCUPIED_CAUTION } from "@/lib/compliance-rules";

interface ScenarioResultProps {
  scenario: ExtractedScenario;
  calculated: CalculatedScenario;
  missingInformation: string[];
  nextBestQuestion: string;
  restructureOptions: string[];
  ownerOccupied: boolean;
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
        <span className="text-[12px] font-medium uppercase tracking-wide">{label}</span>
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
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ScenarioResult({
  scenario,
  calculated,
  missingInformation,
  nextBestQuestion,
  restructureOptions,
  ownerOccupied,
}: ScenarioResultProps) {
  const [showAllRisks, setShowAllRisks] = useState(false);

  const requestedDisplay =
    scenario.requestedLoanAmount ??
    scenario.requestedCashOut ??
    scenario.constructionBudget ??
    null;

  const lienDisplay =
    scenario.lienPosition === "2nd"
      ? "2nd position"
      : scenario.lienPosition === "1st"
        ? "1st position"
        : "—";

  // Senior position ahead of the new money: an existing first loan, OR (for
  // construction) the land + construction already invested, which the engine
  // combines. Label it accordingly so the figure is never a mystery.
  const seniorAmount = scenario.currentDebt ?? calculated.seniorPositionAmount;
  const seniorLabel =
    scenario.currentDebt == null && calculated.seniorPositionAmount != null
      ? "Senior Position"
      : "Existing First Loan";

  const risksToShow = showAllRisks
    ? calculated.riskNotes
    : calculated.riskNotes.slice(0, 2);

  const pm = calculated.primaryMetric;

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
              Preliminary scenario · subject to review
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-gold">
            Preliminary
          </span>
        </motion.div>

        <div className="space-y-6 p-6 sm:p-8">
          {/* Owner-occupied caution */}
          {ownerOccupied && (
            <motion.div
              variants={item}
              className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4"
            >
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-[13.5px] leading-relaxed text-amber-900">
                {OWNER_OCCUPIED_CAUTION}
              </p>
            </motion.div>
          )}

          {/* Primary leverage metric — CLTV leads for 2nd position */}
          <motion.div
            variants={item}
            className="flex items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/[0.07] p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Gauge size={20} />
              </span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-navy-muted">
                  Primary metric · {pm.label}
                </p>
                <p className="text-[13px] text-navy-muted">
                  {pm.key === "CLTV"
                    ? "Senior position + requested new loan ÷ value"
                    : pm.key === "LTC"
                      ? "Requested loan ÷ total project cost"
                      : pm.key === "ARV-LTV"
                        ? "Requested loan ÷ after-repair value"
                        : "Requested loan ÷ property value"}
                </p>
              </div>
            </div>
            <p className="text-[32px] font-semibold tracking-tight text-navy">
              {formatPercent(pm.value)}
            </p>
          </motion.div>

          {/* Core stat grid */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              icon={<MapPin size={15} />}
              label="Location"
              value={scenario.propertyLocation ?? (scenario.propertyState === "CA" ? "California" : "—")}
            />
            <Stat
              icon={<Building2 size={15} />}
              label="Estimated Value"
              value={formatMoney(scenario.estimatedValue)}
            />
            <Stat
              icon={<Wallet size={15} />}
              label={seniorLabel}
              value={formatMoney(seniorAmount)}
            />
            <Stat
              icon={<HandCoins size={15} />}
              label="Requested Loan"
              value={formatMoney(requestedDisplay)}
            />
            <Stat icon={<Landmark size={15} />} label="Lien Position" value={lienDisplay} />
            <Stat
              icon={<Target size={15} />}
              label="Loan Purpose"
              value={scenario.loanPurpose ?? "—"}
            />
            {scenario.purchasePrice != null && (
              <Stat
                icon={<Building2 size={15} />}
                label="Purchase / Land"
                value={formatMoney(scenario.purchasePrice)}
              />
            )}
            {scenario.rehabBudget != null && (
              <Stat
                icon={<HandCoins size={15} />}
                label="Construction / Rehab Invested"
                value={formatMoney(scenario.rehabBudget)}
              />
            )}
            <Stat
              icon={<TrendingUp size={15} />}
              label="New-Money LTV"
              value={formatPercent(calculated.estimatedLTV)}
              accent={pm.key === "LTV"}
            />
            <Stat
              icon={<Layers size={15} />}
              label="Estimated CLTV"
              value={formatPercent(calculated.estimatedCLTV)}
              accent={pm.key === "CLTV"}
            />
            <Stat
              icon={<Wallet size={15} />}
              label="Equity Remaining"
              value={formatMoney(calculated.equityRemaining)}
            />
            <Stat
              icon={<Wallet size={15} />}
              label="Total Debt After Loan"
              value={formatMoney(calculated.totalDebtAfterLoan)}
            />
            {calculated.estimatedLTC != null && (
              <Stat
                icon={<TrendingUp size={15} />}
                label="Loan-to-Cost"
                value={formatPercent(calculated.estimatedLTC)}
                accent={pm.key === "LTC"}
              />
            )}
            {calculated.estimatedARVLTV != null && (
              <Stat
                icon={<TrendingUp size={15} />}
                label="Loan-to-ARV"
                value={formatPercent(calculated.estimatedARVLTV)}
                accent={pm.key === "ARV-LTV"}
              />
            )}
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

          {/* Restructure options */}
          {restructureOptions.length > 0 && (
            <motion.div
              variants={item}
              className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5"
            >
              <p className="text-[14px] font-semibold text-orange-800">
                This scenario may need restructuring
              </p>
              <ul className="mt-3 space-y-2">
                {restructureOptions.map((opt) => (
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
            <motion.div
              variants={item}
              className="rounded-2xl border border-hairline bg-white/70 p-5"
            >
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
                  {showAllRisks ? "Show fewer" : `Show ${calculated.riskNotes.length - 2} more`}
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
                  Nothing critical — this scenario is ready for broker review.
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
        </div>
      </div>
    </motion.section>
  );
}
