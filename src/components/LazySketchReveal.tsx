"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const SketchReveal = dynamic(() => import("@/components/SketchReveal"), {
  ssr: false,
});

export default function LazySketchReveal() {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShouldMount(true), 800);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!shouldMount) return null;
  return <SketchReveal />;
}
