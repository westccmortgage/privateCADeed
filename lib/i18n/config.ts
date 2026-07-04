export const LOCALES = ["en", "es", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "cadeed_locale";

// Short codes shown in the header switcher and full names for accessibility.
export const LOCALE_META: Record<Locale, { code: string; name: string }> = {
  en: { code: "EN", name: "English" },
  es: { code: "ES", name: "Español" },
  ru: { code: "RU", name: "Русский" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Pick the best supported locale from a browser language string. */
export function detectLocale(navigatorLanguage?: string | null): Locale {
  if (!navigatorLanguage) return DEFAULT_LOCALE;
  const base = navigatorLanguage.toLowerCase().split("-")[0];
  return isLocale(base) ? base : DEFAULT_LOCALE;
}
