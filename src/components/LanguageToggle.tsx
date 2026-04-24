"use client";

import { useLanguage } from "@/context/LanguageContext";
import { StableLocaleText } from "@/components/StableLocaleText";
import clsx from "clsx";

interface Props {
  variant?: "overlay" | "nav";
}

const OVERLAY_SHORT_LABELS = { tr: "TR", en: "EN" } as const;
const NAV_LABELS = { tr: "TR", en: "EN" } as const;
const BASE_LABEL_STYLE =
  "text-[10px] tracking-[0.15em] font-medium whitespace-nowrap [font-family:var(--font-mundus)]";

export default function LanguageToggle({ variant = "nav" }: Props) {
  const { lang, setLang } = useLanguage();

  const nextLang = lang === "tr" ? "en" : "tr";
  const navLabel = NAV_LABELS[nextLang];

  if (variant === "overlay") {
    const shortLabel = OVERLAY_SHORT_LABELS[nextLang];

    return (
      <button
        onClick={() => setLang(nextLang)}
        aria-label={`Switch to ${shortLabel}`}
        className={clsx(
          BASE_LABEL_STYLE,
          "transition-colors duration-300 py-1 px-1 rounded",
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
          "text-neutral-500 hover:text-neutral-200"
        )}
      >
        <span className="text-inherit">{shortLabel}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setLang(nextLang)}
      aria-label={`Switch to ${navLabel}`}
      className={clsx(
        BASE_LABEL_STYLE,
        "transition-colors duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg",
        "text-white/90 hover:text-white px-1.5 py-1 -mx-1.5 -my-1"
      )}
    >
      <StableLocaleText
        tr={NAV_LABELS.tr}
        en={NAV_LABELS.en}
        activeLang={nextLang}
        nowrap
        className="text-inherit"
      />
    </button>
  );
}
