import en from "./en";
import fr from "./fr";

export type Language = "en" | "fr";
export type TranslationDict = typeof en;

const translations: Record<Language, TranslationDict> = { en, fr };

export function getTranslation(lang: Language): TranslationDict {
  return translations[lang] || translations.en;
}

export function t(lang: Language, path: string): string {
  const keys = path.split(".");
  let value: any = getTranslation(lang);
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      // Fallback to English
      value = getTranslation("en");
      for (const k of keys) {
        value = value?.[k];
      }
      return typeof value === "string" ? value : path;
    }
  }
  return typeof value === "string" ? value : path;
}

export function createI18n(lang: Language) {
  return {
    lang,
    t: (path: string) => t(lang, path),
    getTranslation: () => getTranslation(lang),
  };
}

export type I18n = ReturnType<typeof createI18n>;

// React context
import { createContext, useContext } from "react";

const I18nContext = createContext<I18n>(createI18n("en"));

export const I18nProvider = I18nContext.Provider;
export const useI18n = () => useContext(I18nContext);
