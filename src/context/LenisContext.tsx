"use client";

import { createContext, useContext } from "react";
import type Lenis from "lenis";

/** Set by SmoothScroll on desktop (fine pointer); null on SSR / touch-only. */
export const LenisRefContext = createContext<React.RefObject<Lenis | null> | null>(null);

/** Stable ref from provider; read `.current` in handlers (updates do not re-render). */
export function useLenisRefOptional(): React.RefObject<Lenis | null> | null {
  return useContext(LenisRefContext);
}
