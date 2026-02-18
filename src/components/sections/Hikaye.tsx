"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import SectionWrapper from "../SectionWrapper";

const HIKAYE_CONTENT = {
  dogru: `Geriye yaslandın rahat belki kambur ve gergin yada dik kendinden emin, nasıl olursak olalım seviyoruz hikaye anlatanları doğru veya yalan dinliyoruz onları. Mavi veya ela gözler, esmer yada kumral fark etmeksizin inaniyor veya inanmıyoruz. Kimi zaman fanatik, kimi zaman kayıtsız oluyoruz. Fakat hepimiz doğru ile yanlışı göreceli buluyor ama yine de bir doğruya bir yanlışa inanıyoruz. Çakırkeyifken ayrı sarhoşken ayrı olmuyoruz, içtikçe ayılıyor ayıldıkça içiyoruz. Kim iyi kimin kötü olduğunu suyu kaçmış balıktan anlıyoruz. Sonra balığın başına bakıyoruz, koklamaya gerek kalmadan bakıyoruz gözünün içine sonra tamam diyoruz. Dolaptaki yetmez diyor duruyoruz, seninle karşılaşıyor uzun uzun bakışıyor yada görür görmez yapışıyoruz. Aşka inanmıyor, gönül eğlendiriyoruz yada doğru kişinin sen olduğuna karar veremiyoruz. Başlıyorsun anlatmaya geçmiş hikayeleri, aldığın dersleri dürüstçe mertçe diyorsun ki yanlış yaptım. Kimse sormamışken o çalışan geliyor aklına, müzik sesleniyor bize bir doğrucu lazım. Halbuki doğruları söylediği için gitmemiş miydi o da, derin bir nefes tamam önce ben değişeceğim. Bu kadeh doğruculara, doğruyu söyleme cüreti olan aslanlara süt çocuklarına. Çünkü biliyorsun hikayenin başını da sonunu da, senin gibi biz de biliyoruz sakladığın doğruları da yanlışları da. Şimdi, ilk olmanın heyecanındasın üzüm kadar değerli, çocuk kadar korkak, akıllı bir erkek, bilge bir kadınsın. Geçmişinle barışmış bugünün değerini anlıyorsun, gelecek sokaktan ben de geçtim demek için buradasın.`,
  yalan: `Hem kendine hem aynaya durmadan yalan. Eline ne geçti söyle hepimiz inanalım tamam. İşten çıkarttın yetmedi, şiddet işlemedi, mutsuz ettin doymadı söyle sen bunu kendine neden yaparsın. Kurulu düzen mi, bu işler böyle mi, eski köyün adeti mi söyle nedir senin derdin. Görüyorsun sen de kaybediyorsun, biliyoruz bu sana güç yetiyor, zevk veriyor ortak etmek ızdırabına ama yeni adetler bozacak dengeni yakında. Soğuk yenen yemekler karnını ağrıtacak tez zamanda, bize sorarsan tezatlaşma doğru insanlarla onun yerine anlaş barış yarını yaratacak aydınlarla. Kararlısın içeceksin bugün çok kadeh, ayna kırık ellerin kan kırmızı bade içinde. Kararını verdin içeceksin yarın az kadeh, ayna parlak ellerin titrek beyaz köpüklü bade, kutlayacaksın doğruluğun zaferini iyiliğinin onurunu. O gün tut elimizi, beraber koşalım, coşalım verdiği güçle baharın, yazın, güzün ve gündüzün geceyle karıştığı kışın. Kısa süren yalanlar bitti, hepimiz için uzun ve güzel bir hikaye anlatmak ister misin?`,
};

export default function Hikaye() {
  const [active, setActive] = useState<"dogru" | "yalan" | null>(null);

  const handleEnter = useCallback((side: "dogru" | "yalan") => {
    setActive(side);
  }, []);

  const handleLeave = useCallback(() => {
    setActive(null);
  }, []);

  const handleTap = useCallback((side: "dogru" | "yalan") => {
    setActive((prev) => (prev === side ? null : side));
  }, []);

  return (
    <SectionWrapper id="hikaye" fullHeight={false} className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto w-full">
        {/* ── Images Row with Vertical "hikaye" Text ── */}
        <div className="flex items-stretch justify-center">
          {/* Left Image — Doğru (14.png) */}
          <div className="relative w-[40vw] max-w-[480px] aspect-square overflow-hidden rounded-sm flex-shrink-0">
            <Image
              src="/hikaye-images/14.png"
              alt="Hikaye - Doğru"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 40vw, 480px"
              priority
            />
          </div>

          {/* Vertical "hikaye" Text — stretches full image height */}
          <div className="flex flex-col items-center justify-between mx-2 sm:mx-4 md:mx-8 select-none py-1">
            {"hikaye".split("").map((letter, i) => (
              <span
                key={i}
                className="block font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl text-white/60 leading-none"
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Right Image — Yalan (13.png) */}
          <div className="relative w-[40vw] max-w-[480px] aspect-square overflow-hidden rounded-sm flex-shrink-0">
            <Image
              src="/hikaye-images/13.png"
              alt="Hikaye - Yalan"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 40vw, 480px"
              priority
            />
          </div>
        </div>

        {/* ── Doğru / Yalan Titles — fixed positions, never move ── */}
        <div className="flex justify-between items-center mt-10 md:mt-14 px-1">
          {/* Doğru trigger — generous hit area */}
          <div
            className="py-4 pr-12 cursor-pointer"
            onMouseEnter={() => handleEnter("dogru")}
            onMouseLeave={handleLeave}
            onClick={() => handleTap("dogru")}
          >
            <h3
              className={`font-serif text-2xl md:text-4xl lg:text-5xl transition-[opacity,color] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                active === "yalan"
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              } ${active === "dogru" ? "text-primary" : "text-white"}`}
            >
              Doğru
            </h3>
          </div>

          {/* Yalan trigger — generous hit area */}
          <div
            className="py-4 pl-12 cursor-pointer"
            onMouseEnter={() => handleEnter("yalan")}
            onMouseLeave={handleLeave}
            onClick={() => handleTap("yalan")}
          >
            <h3
              className={`font-serif text-2xl md:text-4xl lg:text-5xl transition-[opacity,color] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                active === "dogru"
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              } ${active === "yalan" ? "text-primary" : "text-white"}`}
            >
              Yalan
            </h3>
          </div>
        </div>

        {/* ── Description Area — fixed height, absolute children, ZERO layout shift ── */}
        <div
          className="relative mt-6 md:mt-10 min-h-[280px] sm:min-h-[240px] md:min-h-[260px]"
          onMouseEnter={() => {
            if (active) handleEnter(active);
          }}
          onMouseLeave={handleLeave}
        >
          {/* Border line */}
          <div
            className={`absolute top-0 left-0 right-0 h-px bg-white/10 transition-[transform,opacity] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left ${
              active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            }`}
          />

          {/* Doğru Description — always absolute */}
          <div
            className={`absolute inset-x-0 top-0 pt-8 pb-4 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              active === "dogru"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5 pointer-events-none"
            }`}
          >
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/80 font-light max-w-4xl">
              {HIKAYE_CONTENT.dogru}
            </p>
          </div>

          {/* Yalan Description — always absolute */}
          <div
            className={`absolute inset-x-0 top-0 pt-8 pb-4 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              active === "yalan"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5 pointer-events-none"
            }`}
          >
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/80 font-light max-w-4xl ml-auto text-right">
              {HIKAYE_CONTENT.yalan}
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
