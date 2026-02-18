'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
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
    </div>
  );
}
