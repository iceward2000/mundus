"use client";

import { useLanguage } from "@/context/LanguageContext";
import { StableLocaleText } from "@/components/StableLocaleText";
import clsx from "clsx";

interface Props {
  variant?: "overlay" | "nav";
}

const OVERLAY_LABELS = { tr: "TÜRKÇE", en: "ENGLISH" } as const;
const OVERLAY_SHORT_LABELS = { tr: "TR", en: "EN" } as const;

export default function LanguageToggle({ variant = "nav" }: Props) {
  const { lang, setLang } = useLanguage();

  const nextLang = lang === "tr" ? "en" : "tr";

  if (variant === "overlay") {
    const shortLabel = OVERLAY_SHORT_LABELS[nextLang];
    const fullLabel = OVERLAY_LABELS[nextLang];

    return (
      <button
        onClick={() => setLang(nextLang)}
        aria-label={`Switch to ${fullLabel}`}
        className={clsx(
          "text-[10px] tracking-[0.15em] transition-colors duration-300 py-1 px-1 rounded",
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
          "text-neutral-500 hover:text-neutral-200"
        )}
      >
        <span className="inline md:hidden text-inherit">{shortLabel}</span>
        <span className="hidden md:inline text-inherit">
          <StableLocaleText
            tr={OVERLAY_LABELS.tr}
            en={OVERLAY_LABELS.en}
            activeLang={nextLang}
            nowrap
            className="text-inherit"
          />
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 text-[10px] sm:text-sm tracking-[0.12em] font-extrabold text-white">
      <button
        onClick={() => setLang("en")}
        aria-label="Switch to EN"
        className={clsx(
          "transition-colors duration-300 px-1 py-0.5 rounded",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          lang === "en" ? "text-white" : "text-white/60 hover:text-white/90"
        )}
      >
        EN
      </button>
      <span className="text-white/50 select-none">/</span>
      <button
        onClick={() => setLang("tr")}
        aria-label="Switch to TR"
        className={clsx(
          "transition-colors duration-300 px-1 py-0.5 rounded",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          lang === "tr" ? "text-white" : "text-white/60 hover:text-white/90"
        )}
      >
        TR
      </button>
    </div>
  );
}
