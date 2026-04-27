/**
 * Root layout. Renders in order:
 * - AssetPreloader (desktop only): preloads images/audio, emits mundus-load-progress
 * - AgeVerificationOverlay: age gate; blocks interaction until verified
 * - SmoothScroll > GrainOverlay > {children}: full page content (loads immediately, not gated)
 *
 * Note: {children} is always rendered—the overlay visually covers it. Content is not
 * conditionally loaded after verification.
 */
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import AgeVerificationOverlay from "@/components/AgeVerificationOverlay";
import AssetPreloader from "@/components/AssetPreloader";
import AgeGatedContent from "@/components/AgeGatedContent";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Mundus Türkiye | Türk Alkollü İçecek Danışmanlığı",
  description:
    "Mundus, Türk alkollü içecek markalarının küresel varlığının artırılması amacıyla satış, pazarlama ve tasarım alanlarında 360 derece danışmanlık verir. Yerli üretim markalarının başta Batı Avrupa olmak üzere dünyanın her coğrafyasında arzulanan ve erişilebilen içkiler kategorisine girebilmeleri için çalışır. Tüketicilerin dilinden anlar, sürdürülebilir bir ilişki kurar ve markayı daha geniş kitlelere ulaştırabilmek için teknolojiyi ve en iyi sektörel örnekleri referans alır. Danışmanlık süreçlerinde ihtiyacınız olabilecek tüm hizmetleri, çeşitli disiplinlerde uzmanlaşmış partnerlerimizle güvenilir ve dinamik bir biçimde sunar.",
  icons: {
    icon: "/favicon-mundus.png",
    shortcut: "/favicon-mundus.png",
    apple: "/favicon-mundus.png",
  },
};

/** Enables env(safe-area-inset-*) under the notch / Dynamic Island (iOS, etc.). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
            <AgeGatedContent>{children}</AgeGatedContent>
          </SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
