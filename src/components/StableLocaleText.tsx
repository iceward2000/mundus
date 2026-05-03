"use client";

import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";
import { translations, type Lang, type TranslationKey } from "@/lib/translations";

/** Wrap ASCII digits so they can match a separate @font-face (e.g. Syne Mono at 400 vs body weight 500). */
function wrapAsciiDigits(content: string, digitClassName: string) {
  const parts = content.split(/(\d)/);
  return parts.map((part, i) =>
    /^\d$/.test(part) ? (
      <span key={i} className={digitClassName}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export type StableLocaleTextProps = {
  className?: string;
  /** Single-line: reserve max width (nav labels, buttons). */
  nowrap?: boolean;
  /** Block width for wrapped paragraphs (inherits parent width). */
  fill?: boolean;
  /**
   * If set, wraps each ASCII digit (0–9) in a span with this class for stable layout vs TR/EN.
   * Useful when mono/alt numeral fonts are keyed to font-weight 400 while body uses 500.
   */
  digitClassName?: string;
  /**
   * Which locale string to show (e.g. language switcher shows the *target* locale).
   * Defaults to the active site language from context.
   */
  activeLang?: Lang;
} & ({ tKey: TranslationKey } | { tr: string; en: string });

function getPair(props: StableLocaleTextProps): { tr: string; en: string } {
  if ("tKey" in props) {
    const k = props.tKey;
    return {
      tr: translations.tr[k] ?? "",
      en: translations.en[k] ?? "",
    };
  }
  return { tr: props.tr, en: props.en };
}

/**
 * Renders the active locale while reserving layout for whichever of TR/EN is larger,
 * so switching language does not shift the scroll position from reflow.
 */
export function StableLocaleText(props: StableLocaleTextProps) {
  const { className, nowrap, fill, activeLang, digitClassName } = props;
  const { lang } = useLanguage();
  const { tr, en } = getPair(props);
  const pick = activeLang ?? lang;
  const visible = pick === "tr" ? tr : en;

  const gridClass = nowrap ? "inline-grid" : "grid";
  const cell = clsx(
    "col-start-1 row-start-1",
    nowrap && "whitespace-nowrap",
    fill && "min-w-0 w-full whitespace-pre-wrap break-words"
  );

  const renderContent = (s: string) =>
    digitClassName ? wrapAsciiDigits(s, digitClassName) : s;

  return (
    <span className={clsx(gridClass, fill && "w-full min-w-0", className)}>
      <span aria-hidden className={clsx(cell, "invisible pointer-events-none select-none")}>
        {renderContent(tr)}
      </span>
      <span aria-hidden className={clsx(cell, "invisible pointer-events-none select-none")}>
        {renderContent(en)}
      </span>
      <span className={cell}>{renderContent(visible)}</span>
    </span>
  );
}
