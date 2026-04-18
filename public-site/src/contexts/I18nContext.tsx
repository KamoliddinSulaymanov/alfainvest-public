import { createContext, useContext, useState, ReactNode } from "react";
import translations, { Locale, TranslationKey } from "../i18n/translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "ru",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem("alfainvest-locale") as Locale | null;
      if (saved === "ru" || saved === "uz" || saved === "en") return saved;
    } catch {}
    return "ru";
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("alfainvest-locale", l);
    } catch {}
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[locale] as Record<string, string>;
    return dict[key] ?? (translations.ru as Record<string, string>)[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
