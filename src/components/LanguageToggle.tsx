"use client";

import { useLanguage } from "@/context/LanguageContext";
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
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={() => setLang(nextLang)}
      aria-label={`Switch to ${label}`}
      className={clsx(
        "tracking-wide whitespace-nowrap transition-colors duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg",
        "text-neutral-400 hover:text-white font-extrabold",
        "text-sm px-2 py-1 -mx-2 -my-1"
      )}
    >
      {label}
    </button>
  );
}
