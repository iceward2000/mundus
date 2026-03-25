/**
 * Root layout. Renders in order:
 * - AssetPreloader (desktop only): preloads images/audio, emits mundus-load-progress
 * - AgeVerificationOverlay: age gate; blocks interaction until verified
 * - SmoothScroll > GrainOverlay > {children}: full page content (loads immediately, not gated)
 *
 * Note: {children} is always rendered—the overlay visually covers it. Content is not
 * conditionally loaded after verification.
 */
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import AgeVerificationOverlay from "@/components/AgeVerificationOverlay";
import AssetPreloader from "@/components/AssetPreloader";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Mundus | Premium İçecek Danışmanlığı",
  description: "Stratejik mükemmellikle içki markalarını yükseltiyoruz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-background text-foreground antialiased selection:bg-primary/30 selection:text-white">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YLZZPRW69T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-YLZZPRW69T');
          `}
        </Script>
        <LanguageProvider>
          <AssetPreloader />
          <AgeVerificationOverlay />
          <SmoothScroll>
            <GrainOverlay />
            {children}
          </SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
