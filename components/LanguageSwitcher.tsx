"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface LanguageSwitcherProps {
  /** "bar" for the compact header pill, "block" for the mobile menu row. */
  variant?: "bar" | "block";
}

export default function LanguageSwitcher({ variant = "bar" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (variant === "block") {
    return (
      <div className="flex items-center gap-2 py-3">
        <Globe size={16} className="text-navy/50" />
        <div className="flex gap-1.5">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l as Locale)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                locale === l
                  ? "bg-navy text-white"
                  : "bg-white/70 text-navy/70 hover:text-navy"
              }`}
            >
              {LOCALE_META[l].code}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={t.switcher.label}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium text-navy/70 transition-colors hover:text-navy"
      >
        <Globe size={15} />
        {LOCALE_META[locale].code}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-[#e7edf5] bg-white/95 shadow-[0_20px_44px_rgba(7,26,61,0.12)] backdrop-blur"
          >
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLocale(l as Locale);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] font-medium text-navy/80 transition-colors hover:bg-canvas"
              >
                <span>
                  {LOCALE_META[l].name}
                  <span className="ml-1.5 text-navy-muted/70">{LOCALE_META[l].code}</span>
                </span>
                {locale === l && <Check size={15} className="text-gold" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
