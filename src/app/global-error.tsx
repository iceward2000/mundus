'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, background: '#0a0a0a', color: '#ededed', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
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
        </div>
      </body>
    </html>
  );
}
