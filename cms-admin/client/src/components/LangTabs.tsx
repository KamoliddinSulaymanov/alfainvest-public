/**
 * LangTabs — reusable language tab switcher for multilingual CMS forms.
 *
 * Usage:
 *   <LangTabs lang={lang} setLang={setLang} />
 *
 * Then conditionally render fields based on `lang` ("ru" | "uz" | "en").
 */

type Lang = "ru" | "uz" | "en";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "uz", flag: "🇺🇿", label: "O'zbekcha" },
  { code: "en", flag: "🇬🇧", label: "English" },
];

interface LangTabsProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Optional: show a dot indicator on tabs that have content */
  filled?: Partial<Record<Lang, boolean>>;
}

export default function LangTabs({ lang, setLang, filled }: LangTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border w-fit mb-4">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all relative ${
            lang === code
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{flag}</span>
          <span>{label}</span>
          {filled?.[code] && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
        </button>
      ))}
    </div>
  );
}

export type { Lang };
