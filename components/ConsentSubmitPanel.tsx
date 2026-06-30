"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Check, ShieldCheck, CalendarCheck } from "lucide-react";
import { CONSENT_TEXT } from "@/lib/compliance-rules";
import type { UserContact } from "@/lib/types";

interface ConsentSubmitPanelProps {
  contact: UserContact;
  onContactChange: (contact: UserContact) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitted: boolean;
  submitMessage: string | null;
  ready: boolean; // minimum scenario info collected
}

const inputClass =
  "w-full rounded-xl border border-hairline bg-white/80 px-3.5 py-2.5 text-[14px] text-navy outline-none transition-colors placeholder:text-navy-muted/60 focus:border-navy/30";

export default function ConsentSubmitPanel({
  contact,
  onContactChange,
  consent,
  onConsentChange,
  onSubmit,
  submitting,
  submitted,
  submitMessage,
  ready,
}: ConsentSubmitPanelProps) {
  const [touched, setTouched] = useState(false);

  const emailValid = !!contact.email && /\S+@\S+\.\S+/.test(contact.email);
  const canSend = ready && consent && emailValid && !!contact.name && !submitting && !submitted;

  function set<K extends keyof UserContact>(key: K, value: UserContact[K]) {
    onContactChange({ ...contact, [key]: value });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-card p-6 shadow-lift sm:p-8"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <ShieldCheck size={18} />
        </span>
        <div>
          <h3 className="text-[18px] font-semibold tracking-tight text-navy">
            {ready ? "Ready for Broker Review" : "Almost ready for review"}
          </h3>
          <p className="text-[13px] text-navy-muted">
            {ready
              ? "Add your details and authorize the review to send this scenario in."
              : "Answer a few more questions above, then you can send this scenario in."}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          <p className="text-[14px] leading-relaxed text-emerald-900">
            {submitMessage ?? "Scenario received. A licensed professional will review it."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Full name"
              value={contact.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => setTouched(true)}
            />
            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              value={contact.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => setTouched(true)}
            />
            <input
              className={inputClass}
              placeholder="Phone (optional)"
              value={contact.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
            <select
              className={inputClass}
              value={contact.role ?? ""}
              onChange={(e) => set("role", e.target.value)}
            >
              <option value="">Your role…</option>
              <option value="Borrower">Borrower</option>
              <option value="Broker">Broker</option>
              <option value="Investor">Investor</option>
            </select>
          </div>

          {touched && (!contact.name || !emailValid) && (
            <p className="mt-2 text-[12.5px] text-red-500">
              Please add your name and a valid email.
            </p>
          )}

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-hairline bg-white/60 p-4">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => onConsentChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
            />
            <span className="text-[12.5px] leading-relaxed text-navy-muted">{CONSENT_TEXT}</span>
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSend}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold text-white transition-all ${
                canSend
                  ? "bg-navy shadow-soft hover:-translate-y-0.5 hover:bg-navy-soft"
                  : "cursor-not-allowed bg-navy/30"
              }`}
            >
              <Send size={16} />
              {submitting ? "Sending…" : "Send Scenario for Review"}
            </button>
            <a
              href="/#book"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-3 text-[14px] font-semibold text-navy transition-colors hover:bg-gold/20"
            >
              <CalendarCheck size={16} className="text-gold" />
              Book Deal Review
            </a>
          </div>

          {submitMessage && !submitted && (
            <p className="mt-3 text-[13px] font-medium text-navy-muted">{submitMessage}</p>
          )}
        </>
      )}
    </motion.div>
  );
}
