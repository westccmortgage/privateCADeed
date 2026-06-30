"use client";

import { useState } from "react";
import { Compass, ArrowUpRight, Check, ArrowRight, Send } from "lucide-react";
import { COMPANY, telHref } from "@/lib/company";
import type { ConventionalReferral, ExtractedScenario } from "@/lib/types";

// Conventional / agency channel (override in Netlify with NEXT_PUBLIC_CONVENTIONAL_URL).
const CONVENTIONAL_URL =
  process.env.NEXT_PUBLIC_CONVENTIONAL_URL || "https://westcoastcapitalmortgage.com";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors placeholder:text-white/45 focus:border-white/35";

export default function ConventionalReferralCard({
  referral,
  scenario,
}: {
  referral: ConventionalReferral;
  scenario: ExtractedScenario;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /\S+@\S+\.\S+/.test(form.email);
  const canSend = !!form.name.trim() && emailValid && consent && !sending;

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/conventional-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          consentGiven: consent,
          reasons: referral.reasons,
          extractedScenario: scenario,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not send your request.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-gradient-to-br from-navy to-navy-soft p-6 text-white">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20">
          <Compass size={18} className="text-gold-soft" />
        </span>
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-white/55">
            A better-fit path
          </p>
          <p className="text-[18px] font-semibold tracking-tight">{referral.headline}</p>
        </div>
      </div>

      <p className="mt-3 text-[14.5px] leading-relaxed text-white/80">{referral.message}</p>

      {referral.reasons.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {referral.reasons.map((r) => (
            <li
              key={r}
              className="flex items-start gap-2 text-[13.5px] leading-relaxed text-white/70"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={CONVENTIONAL_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-navy transition-transform hover:-translate-y-0.5"
        >
          Talk to a conventional specialist <ArrowUpRight size={16} />
        </a>
        <a
          href={telHref(COMPANY.phoneOffice)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[14px] font-medium text-white/90 transition-colors hover:border-white/50"
        >
          Call {COMPANY.phoneOffice}
        </a>
      </div>

      {/* Callback capture — consent-gated, tagged as a conventional referral */}
      <div className="mt-4 border-t border-white/10 pt-4">
        {done ? (
          <div className="flex items-start gap-3">
            <Check size={18} className="mt-0.5 shrink-0 text-emerald-300" />
            <p className="text-[14px] leading-relaxed text-white/90">
              Thanks — a licensed loan officer will reach out about conventional options.
              This is not an offer or a commitment to lend.
            </p>
          </div>
        ) : !showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-[13px] font-medium text-white/70 underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Prefer we call you? Request a callback →
          </button>
        ) : (
          <div className="text-left">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-white/55">
              Request a callback
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              <input
                className={inputClass}
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <input
              className={`${inputClass} mt-3`}
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <label className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-white/70">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              <span>
                I agree to be contacted by {COMPANY.legalName} about conventional financing
                options. This is not an offer or a commitment to lend.
              </span>
            </label>
            {error && <p className="mt-2 text-[13px] font-medium text-red-300">{error}</p>}
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-transform ${
                canSend
                  ? "bg-gold text-navy hover:-translate-y-0.5"
                  : "cursor-not-allowed bg-white/30 text-white/60"
              }`}
            >
              {sending ? "Sending…" : "Request a callback"}
              {sending ? <Send size={16} /> : <ArrowRight size={17} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
