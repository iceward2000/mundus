'use client';

import { useEffect, useMemo, useState } from "react";

export default function GlobalError({
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
        scope: "global-error",
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
    console.error("Global error boundary caught:", error);
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
    <html lang="tr">
      <body style={{ margin: 0, background: '#0a0a0a', color: '#ededed', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem', width: 'min(100%, 760px)' }}>
          <h2 style={{ color: '#d4af37', marginBottom: '0.75rem' }}>
            Bir şeyler yanlış gitti
          </h2>
          <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
            Uygulama yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#d4af37',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Tekrar dene
          </button>
          <div style={{ marginTop: '1rem', textAlign: 'left', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '8px', padding: '12px', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '12px' }}>
                Geçici hata raporu kimliği: <span style={{ color: '#d4af37' }}>{reportId}</span>
              </p>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: '0.35rem 0.55rem',
                  background: 'transparent',
                  color: '#ededed',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {copied ? "Kopyalandı" : "Raporu kopyala"}
              </button>
            </div>
            <p style={{ margin: '6px 0 0', opacity: 0.7, fontSize: '11px' }}>
              {reportFailed
                ? "Otomatik gönderim başarısız oldu. Bu metni kopyalayıp paylaşabilirsin."
                : "Rapor otomatik olarak sunucu loglarına gönderiliyor."}
            </p>
            <details style={{ marginTop: '8px' }}>
              <summary style={{ cursor: 'pointer', color: '#d4af37', fontSize: '12px' }}>
                Hata detayını göster
              </summary>
              <pre style={{ marginTop: '8px', maxHeight: '220px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(0,0,0,0.35)', padding: '8px', borderRadius: '6px', fontSize: '10px', lineHeight: 1.45 }}>
                {reportDetails}
              </pre>
            </details>
          </div>
        </div>
      </body>
    </html>
  );
}
