import { useState, useCallback, ReactNode, useEffect } from "react";
import { I18nProvider, createI18n, Language, I18n } from "../i18n";

const STORAGE_KEY = "zareb_language";

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") return stored;
    // Check browser language
    const browserLang = navigator.language?.slice(0, 2);
    if (browserLang === "fr") return "fr";
  } catch {
    // localStorage unavailable
  }
  return "en";
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const i18n: I18n = {
    ...createI18n(lang),
    setLanguage,
  };

  return <I18nProvider value={i18n}>{children}</I18nProvider>;
}

// Extend the I18n type to include setLanguage
declare module "../i18n" {
  interface I18n {
    setLanguage: (lang: Language) => void;
  }
}
