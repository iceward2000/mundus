'use client';

import { useEffect, useMemo, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reportFailed, setReportFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const reportId = useMemo(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }, []);

  const reportDetails = useMemo(() => {
    if (typeof window === "undefined") return "";
    return JSON.stringify(
      {
        reportId,
        scope: "route-error",
        digest: error.digest ?? null,
        name: error.name ?? "Error",
        message: error.message ?? "Unknown error",
        stack: error.stack ?? null,
        path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }, [error, reportId]);

  useEffect(() => {
    console.error(error);

    if (!reportDetails) return;
    fetch("/api/client-error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: reportDetails,
      keepalive: true,
    }).catch(() => {
      setReportFailed(true);
    });
  }, [error, reportDetails]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportDetails);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-8 text-center">
      <h2 className="text-xl font-serif text-primary mb-3">
        Bir şeyler yanlış gitti
      </h2>
      <p className="text-foreground/80 mb-6 max-w-md">
        Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-primary text-background font-medium rounded hover:opacity-90 transition-opacity"
      >
        Tekrar dene
      </button>

      <div className="mt-5 w-full max-w-xl rounded border border-primary/20 bg-black/35 p-3 text-left text-xs text-foreground/80">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px]">
            Geçici hata raporu kimliği: <span className="text-primary">{reportId}</span>
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded border border-white/15 px-2 py-1 text-[11px] hover:border-primary/50 hover:text-primary transition-colors"
          >
            {copied ? "Kopyalandı" : "Raporu kopyala"}
          </button>
        </div>
        <p className="mt-1 text-[10px] text-foreground/60">
          {reportFailed
            ? "Otomatik gönderim başarısız oldu. Bu metni kopyalayıp paylaşabilirsin."
            : "Rapor otomatik olarak sunucu loglarına gönderiliyor."}
        </p>
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] text-primary/90">
            Hata detayını göster
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded bg-black/40 p-2 text-[10px] leading-relaxed">
            {reportDetails}
          </pre>
        </details>
      </div>
    </div>
  );
}
