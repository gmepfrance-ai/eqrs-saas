import { useTranslation, Lang } from "@/lib/i18n";

const languages: { code: Lang; flag: string; label: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
];

export function LanguageSelector() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex items-center gap-0.5 bg-white/10 rounded px-1 py-0.5">
      {languages.map((l, i) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={[
            "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors",
            lang === l.code
              ? "text-white font-semibold underline underline-offset-2"
              : "text-white/60 hover:text-white/90",
          ].join(" ")}
          aria-label={`Switch to ${l.label}`}
          aria-pressed={lang === l.code}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  );
}
