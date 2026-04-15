"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import clsx from "clsx";

type PolicyItem = {
  id: string;
  title: string;
  filePath: string;
};

const POLICY_ITEMS: PolicyItem[] = [
  {
    id: "gizlilik",
    title: "Gizlilik Politikası",
    filePath: "/texts/gizlilik-politikasi.txt",
  },
  {
    id: "kvkk",
    title: "KVKK Aydinlatma Metni",
    filePath: "/texts/kvkk.txt",
  },
];

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PolicyModal({ isOpen, onClose }: PolicyModalProps) {
  const [activeItem, setActiveItem] = useState<string>("");
  const [policyContent, setPolicyContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    setActiveItem("");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadPolicyText = async () => {
      const loadedEntries = await Promise.all(
        POLICY_ITEMS.map(async (item) => {
          try {
            const response = await fetch(item.filePath);
            if (!response.ok) {
              throw new Error(`Failed to load ${item.filePath}`);
            }
            const text = await response.text();
            return [item.id, text.trim()] as const;
          } catch {
            return [item.id, "Politika metni su anda yuklenemedi."] as const;
          }
        })
      );

      if (!cancelled) {
        setPolicyContent(Object.fromEntries(loadedEntries));
      }
    };

    void loadPolicyText();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-2 pt-24 sm:items-center sm:p-6 md:p-8">
      <button
        type="button"
        aria-label="Politikalar popup kapat"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[68dvh] w-full max-w-xl flex-col overflow-hidden rounded-[1.4rem] border border-white/15 bg-black/30 shadow-[0_40px_90px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:max-h-[calc(100dvh-3rem)] sm:max-w-2xl sm:rounded-[2rem]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3.5 sm:px-8 sm:py-5">
          <h3 className="text-white text-base sm:text-xl tracking-[0.16em] uppercase">
            Politikalar
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-full border border-white/20 bg-white/5 p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-300 sm:p-2"
          >
            <X size={16} />
          </button>
        </div>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pr-2.5 sm:px-6 sm:py-5 sm:pr-4 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.55)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track:hover]:bg-transparent [&::-webkit-scrollbar-track-piece]:bg-transparent [&::-webkit-scrollbar-corner]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/55 [&::-webkit-scrollbar-thumb:hover]:bg-primary/75"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {POLICY_ITEMS.map((item) => {
            const isActive = activeItem === item.id;

            return (
              <div key={item.id} className="mb-3 last:mb-0">
                <button
                  type="button"
                  onClick={() => setActiveItem((prev) => (prev === item.id ? "" : item.id))}
                  className="w-full rounded-2xl border border-white/15 bg-white/[0.03] px-3.5 py-2.5 text-left hover:bg-white/[0.06] transition-colors duration-300 sm:px-4 sm:py-3"
                >
                  <span className="flex items-center justify-between gap-4">
                    <span className="text-[13px] sm:text-base tracking-[0.06em] text-white/90">
                      {item.title}
                    </span>
                    <ChevronDown
                      size={16}
                      className={clsx(
                        "text-white/60 transition-transform duration-300",
                        isActive && "rotate-180"
                      )}
                    />
                  </span>
                </button>

                <div
                  className={clsx(
                    "grid transition-all duration-300 ease-out",
                    isActive ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="rounded-2xl border border-white/10 bg-black/20 px-3.5 py-3.5 text-white/75 text-[13px] leading-relaxed whitespace-pre-line sm:px-4 sm:py-4 sm:text-sm">
                      {policyContent[item.id] ?? "Politika metni yukleniyor..."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
