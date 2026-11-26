"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectLocale,
  isLocale,
  type Locale,
} from "./config";
import { dictionaries, type Messages } from "./dictionaries";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Pages whose body copy is actually translated. Every other page body is
// English, so <html lang> must stay "en" there even if the visitor picked ru/es
// (the header/footer carry their own lang attribute).
export const TRANSLATED_PATHS = ["/", "/solutions"];

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // On mount, restore a saved choice or fall back to the browser language.
  useEffect(() => {
    let next: Locale = DEFAULT_LOCALE;
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(saved)) next = saved;
      else next = detectLocale(window.navigator.language);
    } catch {
      next = DEFAULT_LOCALE;
    }
    setLocaleState(next);
  }, []);

  // Keep <html lang> equal to the language actually rendered in the page body.
  const pathname = usePathname();
  useEffect(() => {
    const normalized = (pathname || "/").replace(/\/+$/, "") || "/";
    document.documentElement.lang = TRANSLATED_PATHS.includes(normalized) ? locale : "en";
  }, [locale, pathname]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore storage failures (private mode, etc.) */
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
