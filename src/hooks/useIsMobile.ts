"use client";

import { useEffect, useState } from "react";

const getIsMobileSnapshot = () => {
  if (typeof window === "undefined") return false;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const isSmallScreen = window.innerWidth < 768;
  return isTouch || isSmallScreen;
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(getIsMobileSnapshot);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const checkMobile = () => setIsMobile(getIsMobileSnapshot());

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (typeof pointerQuery.addEventListener === "function") {
      pointerQuery.addEventListener("change", checkMobile);
      return () => {
        window.removeEventListener("resize", checkMobile);
        pointerQuery.removeEventListener("change", checkMobile);
      };
    }

    pointerQuery.addListener(checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      pointerQuery.removeListener(checkMobile);
    };
  }, []);

  return isMobile;
}
