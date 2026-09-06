import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { LOCALES, LOCALE_META, translate, type Locale, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LangCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey) => string;
};

const Ctx = createContext<LangCtx | null>(null);

const STORAGE_KEY = "fundmate.locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return LOCALES.includes(saved as Locale) ? (saved as Locale) : "en";
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  };

  const value = useMemo<LangCtx>(
    () => ({ locale, setLocale, t: (key: TKey) => translate(locale, key) }),
    [locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

/** Compact mono language switcher: EN | தமிழ் | हिंदी */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLang();
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-[3px] border border-border font-mono text-[10px]",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "px-2 py-1 transition-colors",
            locale === l
              ? "bg-primary/15 text-primary"
              : "bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {LOCALE_META[l].native}
        </button>
      ))}
    </div>
  );
}
