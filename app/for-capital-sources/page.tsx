"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Send, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CAN_SPAM_NOTE, COMPLIANCE_DISCLAIMER } from "@/lib/compliance-rules";

const PROPERTY_TYPES = [
  "SFR (1-unit)",
  "2–4 units",
  "Multifamily (5+)",
  "Mixed-use",
  "Commercial",
  "Land",
];
const PROGRAMS = [
  "Bridge",
  "Cash-out",
  "Fix & flip",
  "Construction",
  "2nd deed of trust",
];

const inputClass =
  "w-full rounded-xl border border-hairline bg-white/80 px-3.5 py-2.5 text-[14px] text-navy outline-none transition-colors placeholder:text-navy-muted/60 focus:border-navy/30";
const labelClass = "mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-navy-muted";

interface FormState {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  states: string;
  counties: string;
  lienPositions: string;
  maxLTV: string;
  maxCLTV: string;
  minLoanAmount: string;
  maxLoanAmount: string;
  propertyTypes: string[];
  programs: string[];
  ownerOccupiedAllowed: string;
  businessPurposeOnly: string;
  expectedResponseTime: string;
  notes: string;
}

const EMPTY: FormState = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  states: "CA",
  counties: "",
  lienPositions: "",
  maxLTV: "",
  maxCLTV: "",
  minLoanAmount: "",
  maxLoanAmount: "",
  propertyTypes: [],
  programs: [],
  ownerOccupiedAllowed: "",
  businessPurposeOnly: "",
  expectedResponseTime: "",
  notes: "",
};

function toBoolOrNull(v: string): boolean | null {
  if (v === "yes") return true;
  if (v === "no") return false;
  return null;
}

export default function ForCapitalSources() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function toggle(key: "propertyTypes" | "programs", value: string) {
    setForm((f) => {
      const list = f[key];
      return {
        ...f,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }

  const canSend =
    !!form.companyName.trim() &&
    /\S+@\S+\.\S+/.test(form.email) &&
    !submitting &&
    !submitted;

  async function submit() {
    if (!canSend) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/capital-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          states: form.states,
          counties: form.counties,
          maxLTV: form.maxLTV,
          maxCLTV: form.maxCLTV,
          minLoanAmount: form.minLoanAmount,
          maxLoanAmount: form.maxLoanAmount,
          ownerOccupiedAllowed: toBoolOrNull(form.ownerOccupiedAllowed),
          businessPurposeOnly: toBoolOrNull(form.businessPurposeOnly),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not submit your profile.");
      setSubmitted(true);
      setMessage(data.message ?? "Profile received.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not submit your profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="top" className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-engine px-5 sm:px-8">
        <section className="pt-14 sm:pt-20">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-muted transition-colors hover:text-navy"
          >
            <ArrowLeft size={15} /> Back to the terminal
          </a>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 max-w-2xl"
          >
            <span className="inline-block rounded-full border border-hairline bg-white/60 px-3.5 py-1.5 text-[12.5px] font-medium tracking-wide text-navy-muted">
              For Capital Sources
            </span>
            <h1 className="mt-5 text-balance text-[30px] font-semibold leading-[1.1] tracking-tight text-navy sm:text-[40px]">
              Receive structured California private lending scenarios that match your lending box.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-navy-muted">
              Tell us your box once. When a California scenario fits, GRCRM routes it to you —
              structured, calculated, and consent-backed. No spray-and-pray lead lists.
            </p>
          </motion.div>
        </section>

        <section className="mx-auto mt-10 max-w-3xl pb-8">
          {submitted ? (
            <div className="glass-card rounded-card p-8 shadow-lift">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <p className="text-[14px] leading-relaxed text-emerald-900">{message}</p>
              </div>
            </div>
          ) : (
            <div className="glass-card space-y-6 rounded-card p-6 shadow-lift sm:p-8">
              {/* Contact */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Company name *</label>
                  <input
                    className={inputClass}
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact person</label>
                  <input
                    className={inputClass}
                    value={form.contactPerson}
                    onChange={(e) => set("contactPerson", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    className={inputClass}
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* Geography */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>States (comma separated)</label>
                  <input
                    className={inputClass}
                    value={form.states}
                    onChange={(e) => set("states", e.target.value)}
                    placeholder="CA"
                  />
                </div>
                <div>
                  <label className={labelClass}>Counties (optional)</label>
                  <input
                    className={inputClass}
                    value={form.counties}
                    onChange={(e) => set("counties", e.target.value)}
                    placeholder="Los Angeles, Orange, San Diego…"
                  />
                </div>
              </div>

              {/* Box */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Lien position</label>
                  <select
                    className={inputClass}
                    value={form.lienPositions}
                    onChange={(e) => set("lienPositions", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="1st">1st only</option>
                    <option value="2nd">2nd only</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Max LTV (%)</label>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={form.maxLTV}
                    onChange={(e) => set("maxLTV", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Max CLTV (%)</label>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={form.maxCLTV}
                    onChange={(e) => set("maxCLTV", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Min loan amount ($)</label>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={form.minLoanAmount}
                    onChange={(e) => set("minLoanAmount", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Max loan amount ($)</label>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={form.maxLoanAmount}
                    onChange={(e) => set("maxLoanAmount", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Expected response time</label>
                  <select
                    className={inputClass}
                    value={form.expectedResponseTime}
                    onChange={(e) => set("expectedResponseTime", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="Same day">Same day</option>
                    <option value="24 hours">Within 24 hours</option>
                    <option value="48 hours">Within 48 hours</option>
                    <option value="2-3 days">2–3 days</option>
                  </select>
                </div>
              </div>

              {/* Property types */}
              <div>
                <label className={labelClass}>Property types</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      active={form.propertyTypes.includes(t)}
                      onClick={() => toggle("propertyTypes", t)}
                    />
                  ))}
                </div>
              </div>

              {/* Programs */}
              <div>
                <label className={labelClass}>Programs</label>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMS.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      active={form.programs.includes(p)}
                      onClick={() => toggle("programs", p)}
                    />
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Owner-occupied allowed?</label>
                  <select
                    className={inputClass}
                    value={form.ownerOccupiedAllowed}
                    onChange={(e) => set("ownerOccupiedAllowed", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Business-purpose only?</label>
                  <select
                    className={inputClass}
                    value={form.businessPurposeOnly}
                    onChange={(e) => set("businessPurposeOnly", e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <textarea
                  className={`${inputClass} min-h-[96px] resize-y`}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Anything else about your box, overlays, or process…"
                />
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-hairline bg-white/60 p-4">
                <Mail size={16} className="mt-0.5 shrink-0 text-navy-muted" />
                <p className="text-[12.5px] leading-relaxed text-navy-muted">{CAN_SPAM_NOTE}</p>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold text-white transition-all sm:w-auto ${
                  canSend
                    ? "bg-navy shadow-soft hover:-translate-y-0.5 hover:bg-navy-soft"
                    : "cursor-not-allowed bg-navy/30"
                }`}
              >
                <Send size={16} />
                {submitting ? "Submitting…" : "Submit lending box"}
              </button>

              {message && !submitted && (
                <p className="text-[13px] font-medium text-navy-muted">{message}</p>
              )}

              <p className="text-[12px] leading-relaxed text-navy-muted/80">
                {COMPLIANCE_DISCLAIMER}
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "border-navy bg-navy text-white"
          : "border-hairline bg-white/70 text-navy-soft hover:border-navy/20"
      }`}
    >
      {label}
    </button>
  );
}
