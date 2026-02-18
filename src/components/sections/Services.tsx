"use client";

import { useState } from "react";
import SectionWrapper from "../SectionWrapper";
import clsx from "clsx";

const MATH_DATA = [
  {
    symbol: "+",
    title: "Değer Kazanımı",
    desc: "Sürdürülebilir büyüme ve pazar payı koruma stratejileri.",
    items: [
      "Sektörel Trend Uyumu: Markanın, pazarın genel organik artış hızına uyum sağlaması.",
      "Pazar Doygunluğu ve Mevzi Koruma: Yüksek penetrasyon oranına sahip markaların, mevcut pazar payını korumaya odaklanması.",
      "Fiyatlandırma Stratejileri: Satış hacmindeki durağanlığa rağmen, değer artışı sağlayan güncellemeler.",
      "Portföy Optimizasyonu: Yüksek kârlılığa sahip ana ürün gruplarına odaklanılması.",
      "Mevcut Müşteri Sadakati: Mevcut sadık kitlenin tüketim devamlılığına yönlendirilmesi."
    ],
    bg: "from-emerald-900/10 to-emerald-900/5",
    accent: "text-emerald-400"
  },
  {
    symbol: "×",
    title: "Çarpan Etkisi",
    desc: "Agresif büyüme ve pazar hakimiyeti için ölçeklendirme.",
    items: [
      "Üst Segmente Kayış: Yüksek katma değerli ve nitelikli segmentlere geçiş.",
      "Stratejik Kategori İnovasyonu: Y ve Z jenerasyonlarına uygun dinamik ürün konumlandırmaları.",
      "Dağıtım Kanalı Genişlemesi: Satış noktalarındaki sayısal bulunurluğun hızla artırılması.",
      "Etkili Marka İletişimi: Bilinirlik ve satın alma motivasyonu yaratan entegre pazarlama.",
      "Yeni Coğrafi Pazarlar: Yeni bölge veya ülkelerdeki dağıtım ağlarına entegrasyon.",
      "Yıkıcı İnovasyon: Ezber bozan ürün içerikleri ve iletişim metotları."
    ],
    bg: "from-amber-900/10 to-amber-900/5",
    accent: "text-amber-400"
  },
  {
    symbol: "-",
    title: "Risk Yönetimi",
    desc: "Negatif dışsallıkları minimize etme ve direnç kazanma.",
    items: [
      "Mali Düzenlemelerin Talep Esnekliği: Vergi artışlarının alım gücü üzerindeki baskısı.",
      "Rekabetçi Baskı: Yoğun promosyonel faaliyetler nedeniyle geçici kitle kaybı.",
      "Arz Zinciri Kısıtları: Hammadde ve lojistik süreçlerinde yaşanan aksaklıklar.",
      "Pazar Payı ve Sektörel Uyumsuzluk: Büyüme ivmesinin gerisinde kalma riski.",
      "Dönemsel İletişim Boşlukları: Görünürlükteki azalmaların yansıması."
    ],
    bg: "from-blue-900/10 to-blue-900/5",
    accent: "text-blue-400"
  },
  {
    symbol: "÷",
    title: "Kriz Bölünmesi",
    desc: "Yapısal sorunların ve küçülme risklerinin analizi.",
    items: [
      "Regülatif Kısıtlamalar: Yasal yaptırımların hacim kaybına yol açması.",
      "Güncellik Kaybı: Marka algısının hedef kitle nezdinde geçerliliğini yitirmesi.",
      "Makroekonomik Konjonktür: Satın alma gücündeki düşüşlerin alternatiflere yönlendirmesi.",
      "Marka Değeri Erozyonu: Operasyonel hataların sistematik uzaklaşmaya dönüşmesi.",
      "Stratejik Odak Dağılması: Kaynakların ana markadan uzaklaşması.",
      "Kanal Stok Yönetimi: Stok fazlasını eritmek için bilinçli yavaşlatma."
    ],
    bg: "from-red-900/10 to-red-900/5",
    accent: "text-red-400"
  }
];

export default function Services() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <SectionWrapper id="services" className="py-20">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-16">
           <span className="text-primary text-sm tracking-widest uppercase">02 / Uzmanlık</span>
           <h2 className="text-4xl md:text-5xl font-serif mt-4">Matematik</h2>
           <p className="mt-4 text-white/60 max-w-xl">
             İşinizi şansa bırakmıyoruz. Büyüme, risk ve verimlilik denklemlerini sizin için kuruyoruz.
           </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {MATH_DATA.map((item, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
              className={clsx(
                "group relative border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer",
                activeIdx === idx ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
              )}
            >
              {/* Background Gradient */}
              <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", item.bg)} />

              <div className="relative z-10 p-8 h-full min-h-[320px] flex flex-col">
                
                {/* Header: Symbol & Title */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className={clsx("text-6xl font-serif leading-none transition-transform duration-500", activeIdx === idx ? "scale-75 origin-left" : "")}>
                      {item.symbol}
                    </span>
                    <div>
                        <h3 className="text-xl font-serif">{item.title}</h3>
                        <p className={clsx("text-sm transition-colors duration-300", item.accent)}>{item.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Content: List Items (Hidden by default, revealed on hover/click) */}
                <div className={clsx(
                    "flex-1 overflow-hidden transition-all duration-700 ease-in-out",
                    activeIdx === idx ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 md:opacity-100 md:max-h-[100px] md:mask-image-b"
                )}>
                   {/* On desktop inactive: show partial preview? No, let's keep it clean. */}
                   {/* Mobile: Collapse. Desktop: Collapse. */}
                   
                   <ul className="space-y-3 pt-4 border-t border-white/10">
                      {item.items.map((sub, i) => {
                          const [bold, rest] = sub.split(":");
                          return (
                            <li key={i} className="text-sm text-white/70 leading-relaxed">
                                <span className={clsx("font-medium block mb-1", item.accent)}>{bold}</span>
                                {rest && <span className="text-white/50">{rest}</span>}
                            </li>
                          );
                      })}
                   </ul>
                </div>
                
                {/* Desktop Hint (When collapsed) */}
                <div className={clsx(
                    "absolute bottom-8 left-8 text-xs uppercase tracking-widest text-white/30 transition-opacity duration-300",
                    activeIdx === idx ? "opacity-0" : "opacity-100"
                )}>
                    Detaylar İçin İncele
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
