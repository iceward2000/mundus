"use client";

import GlobeViz from "../GlobeViz";
import SectionWrapper from "../SectionWrapper";

// 30+ Country Markers
const MARKERS = [
  // North America
  { lat: 37.0902, lng: -95.7129, label: "Amerika Birleşik Devletleri", description: "Küresel Merkez & Teknoloji Üssü" },
  { lat: 56.1304, lng: -106.3468, label: "Kanada", description: "Kuzey Operasyonları" },
  { lat: 23.6345, lng: -102.5528, label: "Meksika", description: "Latin Amerika Kapısı" },
  
  // South America
  { lat: -14.2350, lng: -51.9253, label: "Brezilya", description: "Güney Amerika Merkezi" },
  { lat: -38.4161, lng: -63.6167, label: "Arjantin", description: "Güney Koni Desteği" },
  { lat: -9.1900, lng: -75.0152, label: "Peru", description: "And Bölgesi" },
  { lat: 4.5709, lng: -74.2973, label: "Kolombiya", description: "Kuzey Andlar" },
  { lat: -35.6751, lng: -71.5430, label: "Şili", description: "Pasifik Kıyısı" },

  // Europe
  { lat: 55.3781, lng: -3.4360, label: "Birleşik Krallık", description: "Avrupa Merkezi" },
  { lat: 51.1657, lng: 10.4515, label: "Almanya", description: "Orta Avrupa Mühendisliği" },
  { lat: 46.2276, lng: 2.2137, label: "Fransa", description: "Batı Avrupa Satışları" },
  { lat: 41.8719, lng: 12.5674, label: "İtalya", description: "Güney Avrupa" },
  { lat: 40.4637, lng: -3.7492, label: "İspanya", description: "İber Yarımadası" },
  { lat: 52.1326, lng: 5.2913, label: "Hollanda", description: "Lojistik Merkezi" },
  { lat: 60.1282, lng: 18.6435, label: "İsveç", description: "İskandinav İnovasyonu" },
  { lat: 46.8182, lng: 8.2275, label: "İsviçre", description: "Finans & Strateji" },
  { lat: 51.9194, lng: 19.1451, label: "Polonya", description: "Doğu Avrupa Desteği" },
  { lat: 39.9194, lng: 32.8663, label: "Türkiye", description: "Bölgesel Merkez" },

  // Asia
  { lat: 36.2048, lng: 138.2529, label: "Japonya", description: "APAC Merkezi" },
  { lat: 35.8617, lng: 104.1954, label: "Çin", description: "Doğu Asya Üretimi" },
  { lat: 20.5937, lng: 78.9629, label: "Hindistan", description: "Küresel Geliştirme Merkezi" },
  { lat: 1.3521, lng: 103.8198, label: "Singapur", description: "Güneydoğu Asya Bölgesel Merkezi" },
  { lat: 35.9078, lng: 127.7669, label: "Güney Kore", description: "Teknoloji Araştırması" },
  { lat: 14.0583, lng: 108.2772, label: "Vietnam", description: "Gelişmekte Olan Pazarlar" },
  { lat: 23.6978, lng: 120.9605, label: "Tayvan", description: "Donanım Mühendisliği" },
  { lat: 39.0742, lng: 21.8243, label: "Yunanistan", description: "Akdeniz" },
  { lat: 31.0461, lng: 34.8516, label: "İsrail", description: "Siber Güvenlik Laboratuvarı" },

  // Middle East & Africa
  { lat: 23.8859, lng: 45.0792, label: "Suudi Arabistan", description: "Orta Doğu Operasyonları" },
  { lat: 25.2048, lng: 55.2708, label: "BAE", description: "Bölgesel Ticaret" },
  { lat: -30.5595, lng: 22.9375, label: "Güney Afrika", description: "Afrika Merkezi" },
  { lat: 30.0444, lng: 31.2357, label: "Mısır", description: "Kuzey Afrika" },
  { lat: 6.5244, lng: 3.3792, label: "Nijerya", description: "Batı Afrika" },

  // Oceania
  { lat: -25.2744, lng: 133.7751, label: "Avustralya", description: "Okyanusya Merkezi" },
  { lat: -40.9006, lng: 174.8860, label: "Yeni Zelanda", description: "Pasifik Desteği" },
];

export default function GlobeSection() {
  return (
    <SectionWrapper 
      id="global-presence" 
      className="bg-slate-950 py-20 relative overflow-hidden !px-0"
    >
      <div className="container mx-auto px-4 mb-10 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Dünyayı Birleştiriyoruz
          </h2>
          <p className="text-slate-400 text-lg">
            Küresel ağımız, nerede olursanız olun kusursuz çözümler sunmamızı sağlar.
            30&apos;dan fazla ülkedeki aktif merkezlerimizi keşfedin.
          </p>
        </div>
      </div>

      <div className="w-full h-[600px] md:h-[700px] relative z-[2]">
        <GlobeViz markers={MARKERS} />
      </div>
      
      {/* Interactive Hint */}
      <div className="absolute bottom-10 w-full text-center z-10 pointer-events-none">
        <p className="text-slate-500 text-sm bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
          Döndürmek için sürükleyin • Kutlamak için ülkelerin üzerine gelin • Yakınlaştırmak için kaydırın
        </p>
      </div>
    </SectionWrapper>
  );
}
