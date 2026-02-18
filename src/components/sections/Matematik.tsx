"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionWrapper from "../SectionWrapper";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const OPERATIONS = [
  {
    label: "Toplama",
    items: [
      { title: "Sektörel Trend Uyumu", desc: "Markanın, pazarın genel organik artış hızına uyum sağlaması." },
      { title: "Pazar Doygunluğu ve Mevzi Koruma", desc: "Yüksek penetrasyon oranına sahip markaların, yeni kazanımlardan ziyade mevcut pazar payını korumaya odaklanması." },
      { title: "Fiyatlandırma Stratejileri", desc: "Satış hacmindeki durağanlığa rağmen, maliyet yansıtmaları ve periyodik fiyat güncellemeleriyle sağlanan değer artışı." },
      { title: "Portföy Optimizasyonu", desc: "Agresif hacim artışı yerine, yüksek kârlılığa sahip ana ürün gruplarına odaklanılması." },
      { title: "Mevcut Müşteri Sadakati", desc: "Pazarlama yatırımlarının yeni kitle denemelerinden ziyade, mevcut sadık kitlenin tüketim devamlılığına yönlendirilmesi." },
    ],
  },
  {
    label: "Çarpma",
    items: [
      { title: "Üst Segmente Kayış", desc: "Tüketici tercihlerinin standart ürünlerden daha yüksek katma değerli ve nitelikli segmentlere kaymasıyla elde edilen birim değer artışı." },
      { title: "Stratejik Kategori İnovasyonu", desc: "Gelişen tüketim eğilimlerine yenilikçi ve vizyoner yaklaşımlarla öncülük ederek, özellikle Y ve Z jenerasyonlarının değişen yaşam tarzlarına uygun dinamik ürün konumlandırmaları yapılması." },
      { title: "Dağıtım Kanalı Genişlemesi", desc: "Satış noktalarındaki sayısal bulunurluğun ve raf payının stratejik hamlelerle hızla artırılması." },
      { title: "Etkili Marka İletişimi", desc: "Hedef kitlede hızlı bir bilinirlik ve satın alma motivasyonu yaratan başarılı entegre pazarlama faaliyetleri." },
      { title: "Yeni Coğrafi Pazarlar", desc: "Markanın operasyon sahasını genişleterek yeni bölge veya ülkelerdeki dağıtım ağlarına entegre olması." },
      { title: "Rekabet Avantajı", desc: "Rakip organizasyonların yaşadığı operasyonel boşlukların veya pazar kayıplarının hızla realize edilmesi." },
      { title: "Yıkıcı İnovasyon", desc: "Ezber bozan ürün içerikleri, yenilikçi tasarımlar veya geleneksel yöntemlerin dışına çıkan iletişim metotları ile pazar dinamiklerini yeniden şekillendirerek müşteriyle en üst seviyede etkileşim." },
    ],
  },
  {
    label: "Bölme",
    items: [
      { title: "Regülatif Kısıtlamalar", desc: "Satış kanalları, pazarlama faaliyetleri veya operasyonel süreçler üzerindeki ağır yasal yaptırımların doğrudan hacim kaybına yol açması." },
      { title: "Güncellik Kaybı ve Demografik Kopuş", desc: "Marka algısının hedef kitle nezdinde geçerliliğini yitirmesi ve tüketicinin farklı içecek kategorilerine kitlesel geçiş yapması." },
      { title: "Makroekonomik Konjonktür", desc: "Satın alma gücündeki keskin düşüşlerin tüketiciyi markalı ürünlerden düşük maliyetli veya kayıt dışı alternatiflere yönlendirmesi." },
      { title: "Marka Değeri Erozyonu", desc: "Güven sarsıcı operasyonel hataların veya krizlerin tüketici nezdinde sistematik bir uzaklaşmaya dönüşmesi." },
      { title: "Stratejik Odak Dağılması", desc: "Organizasyonel kaynakların ana markadan uzaklaşması sonucu çekirdek ürünlerin rekabet gücünü kaybetmesi." },
      { title: "Kanal Stok Yönetimi", desc: "Dağıtım ağındaki stok fazlasını eritmek amacıyla sevkiyatların bilinçli olarak yavaşlatılması sonucu oluşan teknik daralma." },
    ],
  },
  {
    label: "Çıkarma",
    items: [
      { title: "Mali Düzenlemelerin Talep Esnekliği", desc: "Dönemsel vergi artışlarının tüketici alım gücü üzerindeki kısa vadeli baskısı." },
      { title: "Rekabetçi Baskı", desc: "Rakiplerin yoğun promosyonel faaliyetleri nedeniyle sadık kitle dışındaki değişken tüketicinin geçici kaybı." },
      { title: "Arz Zinciri Kısıtları", desc: "Hammadde lojistiği veya ambalaj tedarik süreçlerinde yaşanan kısa süreli aksaklıkların arz üzerindeki etkisi." },
      { title: "Pazar Payı ve Sektörel Uyumsuzluk", desc: "Sektör genel bir büyüme içerisindeyken markanın bu ivmenin gerisinde kalması veya pazarın genel daralma eğiliminden markanın negatif etkilenmesi." },
      { title: "Dönemsel İletişim Boşlukları", desc: "Marka görünürlüğündeki geçici azalmaların veya ürün bulunurluk sorunlarının yansıması." },
    ],
  },
];

export default function Matematik() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Individual SVG element refs - all independent, not nested
  const hBarRef = useRef<SVGRectElement>(null);
  const vBarRef = useRef<SVGRectElement>(null);
  const topDotRef = useRef<SVGCircleElement>(null);
  const bottomDotRef = useRef<SVGCircleElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const didInit = useRef(false);

  // Set initial SVG state: + symbol (hBar visible, vBar visible, dots hidden)
  useEffect(() => {
    if (didInit.current) return;
    if (!hBarRef.current || !vBarRef.current || !topDotRef.current || !bottomDotRef.current) return;
    didInit.current = true;

    // Horizontal bar: always visible, rotates for x
    gsap.set(hBarRef.current, { transformOrigin: "50% 50%" });
    gsap.set(vBarRef.current, { transformOrigin: "50% 50%", scaleY: 1 });
    gsap.set(topDotRef.current, { transformOrigin: "50% 50%", scale: 0, opacity: 0 });
    gsap.set(bottomDotRef.current, { transformOrigin: "50% 50%", scale: 0, opacity: 0 });
  }, []);

  // Entrance scroll animation
  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#matematik",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
      tl.from(".mat-header", { y: 40, opacity: 0, duration: 0.8, ease: "power2.out" });
      tl.from(".mat-symbol-area", { scale: 0.85, opacity: 0, duration: 0.9, ease: "power2.out" }, "-=0.5");
      tl.from(".mat-content-wrap", { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");
    }, sectionRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Animate content when activeIndex changes (skip first render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!contentRef.current) return;

    const d = prefersReducedMotion ? 0 : 0.35;
    gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: d, ease: "power2.out" });

    const items = contentRef.current.querySelectorAll(".mat-item");
    if (items.length) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, stagger: 0.05, duration: d, ease: "power2.out", delay: 0.06, onComplete: () => setIsAnimating(false) }
      );
    } else {
      setIsAnimating(false);
    }
  }, [activeIndex, prefersReducedMotion]);

  const handleClick = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (!hasInteracted) setHasInteracted(true);

    const next = (activeIndex + 1) % 4;
    const d = prefersReducedMotion ? 0.01 : 0.55;
    const tl = gsap.timeline();

    // Fade out content
    if (contentRef.current) {
      tl.to(contentRef.current, { opacity: 0, y: 12, duration: d * 0.45, ease: "power2.in" });
    }

    // SVG morphs - each transition described:
    // State 0 = +  : hBar rotation=0, vBar scaleY=1, dots scale=0
    // State 1 = x  : hBar rotation=45, vBar rotation=45 (via hBar+vBar both rotated), dots scale=0
    // State 2 = ÷  : hBar rotation=0, vBar scaleY=0, dots scale=1
    // State 3 = -  : hBar rotation=0, vBar scaleY=0, dots scale=0

    switch (activeIndex) {
      // + -> x : rotate both bars 45 degrees
      case 0:
        tl.to(hBarRef.current, { rotation: 45, duration: d, ease: "power2.inOut" }, "<+=0.15");
        tl.to(vBarRef.current, { rotation: 45, duration: d, ease: "power2.inOut" }, "<");
        break;

      // x -> ÷ : rotate bars back to 0, shrink vBar, show dots
      case 1:
        tl.to(hBarRef.current, { rotation: 0, duration: d * 0.7, ease: "power2.inOut" }, "<+=0.1");
        tl.to(vBarRef.current, { rotation: 0, duration: d * 0.7, ease: "power2.inOut" }, "<");
        tl.to(vBarRef.current, { scaleY: 0, duration: d * 0.4, ease: "power2.in" }, "-=0.15");
        tl.to([topDotRef.current, bottomDotRef.current], { scale: 1, opacity: 1, duration: d * 0.4, ease: "back.out(1.7)", stagger: 0.07 }, "-=0.08");
        break;

      // ÷ -> - : shrink dots away
      case 2:
        tl.to(topDotRef.current, { scale: 0, opacity: 0, duration: d * 0.45, ease: "power2.in" }, "<+=0.1");
        tl.to(bottomDotRef.current, { scale: 0, opacity: 0, duration: d * 0.45, ease: "power2.in" }, "<+=0.06");
        break;

      // - -> + : grow vBar back
      case 3:
        tl.to(vBarRef.current, { scaleY: 1, duration: d * 0.55, ease: "back.out(1.7)" }, "<+=0.1");
        break;
    }

    tl.call(() => setActiveIndex(next));
  }, [activeIndex, isAnimating, hasInteracted, prefersReducedMotion]);

  const current = OPERATIONS[activeIndex];

  return (
    <SectionWrapper id="matematik" fullHeight={false}>
      <div ref={sectionRef} className="max-w-6xl mx-auto w-full py-10 md:py-20">
        {/* Header */}
        <div className="mat-header text-center mb-10 md:mb-14">
          <span className="text-primary text-sm tracking-widest uppercase">Matematik</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mt-4">Büyümenin Formülü</h2>
        </div>

        {/* Symbol area */}
        <div className="mat-symbol-area flex flex-col items-center mb-10 md:mb-14">
          <button
            onClick={handleClick}
            disabled={isAnimating}
            className="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
            aria-label="Click to see the next operation"
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/15 transition-all duration-700 scale-[2.5] pointer-events-none" />
            {/* Ring */}
            <div className="absolute inset-0 rounded-full border border-primary/10 group-hover:border-primary/30 transition-colors duration-500 pointer-events-none" />

            <svg
              ref={svgRef}
              viewBox="0 0 200 200"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 relative z-10 drop-shadow-[0_0_30px_rgba(212,175,55,0.2)] group-hover:drop-shadow-[0_0_50px_rgba(212,175,55,0.4)] transition-[filter] duration-500"
              aria-hidden="true"
            >
              {/* Horizontal bar - always present */}
              <rect
                ref={hBarRef}
                x="30" y="91" width="140" height="18" rx="9"
                className="fill-primary"
              />
              {/* Vertical bar - present for + and x, hidden for ÷ and - */}
              <rect
                ref={vBarRef}
                x="91" y="30" width="18" height="140" rx="9"
                className="fill-primary"
              />
              {/* Top dot for ÷ */}
              <circle
                ref={topDotRef}
                cx="100" cy="52" r="14"
                className="fill-primary"
              />
              {/* Bottom dot for ÷ */}
              <circle
                ref={bottomDotRef}
                cx="100" cy="148" r="14"
                className="fill-primary"
              />
            </svg>

            {/* Hint */}
            {!hasInteracted && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/25 text-xs sm:text-sm whitespace-nowrap animate-pulse select-none pointer-events-none">
                Tıklayarak keşfedin
              </span>
            )}
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2.5 mt-10" aria-hidden="true">
            {OPERATIONS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${i === activeIndex ? "bg-primary scale-150" : "bg-white/15"}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="mat-content-wrap">
          <h3 className="text-2xl md:text-3xl font-serif text-primary text-center mb-8 md:mb-10">
            {current.label}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
            {current.items.map((item, i) => (
              <div
                key={`${activeIndex}-${i}`}
                className="mat-item border-l-2 border-primary/20 hover:border-primary/50 pl-5 md:pl-6 py-3 transition-colors duration-300"
              >
                <h4 className="text-base md:text-lg font-medium text-white/90 mb-1.5">{item.title}</h4>
                <p className="text-white/45 text-sm md:text-[15px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
