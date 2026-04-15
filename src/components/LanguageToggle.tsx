"use client";

import { useLanguage } from "@/context/LanguageContext";
import { StableLocaleText } from "@/components/StableLocaleText";
import clsx from "clsx";

interface Props {
  variant?: "overlay" | "nav";
}

const LABELS = { tr: "TÜRKÇE", en: "ENGLISH" } as const;

export default function LanguageToggle({ variant = "nav" }: Props) {
  const { lang, setLang } = useLanguage();

  const nextLang = lang === "tr" ? "en" : "tr";
  const label = LABELS[nextLang];

  if (variant === "overlay") {
    return (
      <button
        onClick={() => setLang(nextLang)}
        aria-label={`Switch to ${label}`}
        className={clsx(
          "text-[10px] tracking-[0.15em] transition-colors duration-300 py-1 px-1 rounded",
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
          "text-neutral-500 hover:text-neutral-200"
        )}
      >
        <StableLocaleText
          tr={LABELS.tr}
          en={LABELS.en}
          activeLang={nextLang}
          nowrap
          className="text-inherit"
        />
      </button>
    );
  }

  return (
    <button
      onClick={() => setLang(nextLang)}
      aria-label={`Switch to ${label}`}
      className={clsx(
        "tracking-[0.12em] whitespace-nowrap transition-colors duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg",
        "text-white/90 hover:text-white font-extrabold",
        "text-[10px] sm:text-sm px-1.5 py-1 -mx-1.5 -my-1"
      )}
    >
      <StableLocaleText
        tr={LABELS.tr}
        en={LABELS.en}
        activeLang={nextLang}
        nowrap
        className="text-inherit"
      />
    </button>
  );
}
