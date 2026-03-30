"use client";

import { useEffect, useState } from "react";

type AgeGatedContentProps = {
  children: React.ReactNode;
};

export default function AgeGatedContent({ children }: AgeGatedContentProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem("mundus-age-verified") === "true";
    if (verified) {
      setIsUnlocked(true);
      return;
    }

    const onEntered = () => setIsUnlocked(true);
    window.addEventListener("mundus-entered", onEntered);
    return () => window.removeEventListener("mundus-entered", onEntered);
  }, []);

  if (!isUnlocked) return null;
  return <>{children}</>;
}
