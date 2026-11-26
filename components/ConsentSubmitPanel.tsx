"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Check, ShieldCheck, CalendarCheck } from "lucide-react";
import { CONSENT_TEXT } from "@/lib/compliance-rules";
import {
  EMAIL_ERROR,
  NAME_ERROR,
  PHONE_ERROR,
  PHONE_HINT,
  PHONE_PATTERN,
  isEmailValid,
  isPhoneValid,
  type RequestFailure,
} from "@/lib/forms";
import type { UserContact } from "@/lib/types";
import Field, { inputClass } from "@/components/FormField";
import FormError from "@/components/FormError";

interface ConsentSubmitPanelProps {
  contact: UserContact;
  onContactChange: (contact: UserContact) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitted: boolean;
  submitMessage: string | null;
  submitFailure?: RequestFailure | null;
  ready: boolean; // minimum scenario info collected
}

export default function ConsentSubmitPanel({
  contact,
  onContactChange,
  consent,
  onConsentChange,
  onSubmit,
  submitting,
  submitted,
  submitMessage,
  submitFailure = null,
  ready,
}: ConsentSubmitPanelProps) {
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    name: (contact.name ?? "").trim() ? null : NAME_ERROR,
    email: isEmailValid(contact.email ?? "") ? null : EMAIL_ERROR,
    phone: isPhoneValid(contact.phone ?? "") ? null : PHONE_ERROR,
    consent: consent ? null : "Please tick the box to authorize the review.",
  };

  function set<K extends keyof UserContact>(key: K, value: UserContact[K]) {
    onContactChange({ ...contact, [key]: value });
  }

  function handleSend() {
    if (submitting || submitted) return;
    setShowErrors(true);
    if (errors.name || errors.email || errors.phone || errors.consent || !ready) return;
    onSubmit();
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
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={showErrors ? errors.name : null}>
              {(c) => (
                <input
                  {...c}
                  className={inputClass()}
                  name="name"
                  autoComplete="name"
                  value={contact.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                />
              )}
            </Field>
            <Field label="Email" required error={showErrors ? errors.email : null}>
              {(c) => (
                <input
                  {...c}
                  className={inputClass()}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={contact.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                />
              )}
            </Field>
            <Field
              label="Phone (optional)"
              hint={PHONE_HINT}
              error={showErrors ? errors.phone : null}
            >
              {(c) => (
                <input
                  {...c}
                  className={inputClass()}
                  type="tel"
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  pattern={PHONE_PATTERN}
                  value={contact.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              )}
            </Field>
            <Field label="Your role (optional)">
              {(c) => (
                <select
                  {...c}
                  className={inputClass()}
                  value={contact.role ?? ""}
                  onChange={(e) => set("role", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="Borrower">Borrower</option>
                  <option value="Broker">Broker</option>
                  <option value="Investor">Investor</option>
                </select>
              )}
            </Field>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-hairline bg-white/60 p-4">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => onConsentChange(e.target.checked)}
              aria-required="true"
              className="mt-0.5 h-5 w-5 shrink-0 accent-navy"
            />
            <span className="text-[13px] leading-relaxed text-navy-muted">
              {CONSENT_TEXT} <span aria-hidden="true">*</span>
            </span>
          </label>
          {showErrors && errors.consent && (
            <p className="mt-1.5 text-[12.5px] font-medium text-red-600">{errors.consent}</p>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold text-white transition-all ${
                submitting
                  ? "cursor-not-allowed bg-navy/40"
                  : "bg-navy shadow-soft hover:-translate-y-0.5 hover:bg-navy-soft"
              }`}
            >
              <Send size={16} />
              {submitting ? "Sending…" : "Send Scenario for Review"}
            </button>
            <a
              href="/#book"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-3 text-[14px] font-semibold text-navy transition-colors hover:bg-gold/20"
            >
              <CalendarCheck size={16} className="text-gold" />
              Book Deal Review
            </a>
          </div>

          {showErrors && !ready && (
            <p className="mt-3 text-[13px] font-medium text-red-600">
              Please answer the questions above first so we have enough to review.
            </p>
          )}
          <FormError failure={submitFailure} className="mt-3" />
          {submitMessage && !submitFailure && (
            <p className="mt-3 text-[13px] font-medium text-navy-muted">{submitMessage}</p>
          )}

          <p className="mt-3 text-[12.5px] leading-relaxed text-navy-muted">
            By sending, you agree we may contact you by phone or email about your request.{" "}
            <a href="/legal#privacy" className="underline underline-offset-2 hover:text-navy">
              Privacy
            </a>
          </p>
        </form>
      )}
    </motion.div>
  );
}
