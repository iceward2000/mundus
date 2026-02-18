"use client";

import { useState } from "react";
import SectionWrapper from "../SectionWrapper";
import clsx from "clsx";

const STORIES = {
  yalan: {
    title: "Yalan",
    subtitle: "Hikaye - Yalan",
    content: "Hem kendine hem aynaya durmadan yalan. Eline ne geçti söyle hepimiz inanalım tamam. İşten çıkarttın yetmedi, şiddet işlemedi, mutsuz ettin doymadı söyle sen bunu kendine neden yaparsın. Kurulu düzen mi, bu işler böyle mi, eski köyün adeti mi söyle nedir senin derdin. Görüyorsun sen de kaybediyorsun, biliyoruz bu sana güç yetiyor, zevk veriyor ortak etmek ızdırabına ama yeni adetler bozacak dengeni yakında. Soğuk yenen yemekler karnını ağrıtacak tez zamanda, bize sorarsan tezatlaşma doğru insanlarla onun yerine anlaş barış yarını yaratacak aydınlarla. Kararlısın içeceksin bugün çok kadeh, ayna kırık ellerin kan kırmızı bade içinde. Kararını verdin içeceksin yarın az kadeh, ayna parlak ellerin titrek beyaz köpüklü bade, kutlayacaksın doğruluğun zaferini iyiliğinin onurunu. O gün tut elimizi, beraber koşalım, coşalım verdiği güçle baharın, yazın, güzün ve gündüzün geceyle karıştığı kışın. Kısa süren yalanlar bitti, hepimiz için uzun ve güzel bir hikaye anlatmak ister misin?",
    theme: "from-red-900/20 to-black",
    accent: "text-red-400"
  },
  dogru: {
    title: "Doğru",
    subtitle: "Hikaye - Doğru",
    content: "Geriye yaslandın rahat belki kambur ve gergin yada dik kendinden emin, nasıl olursak olalım seviyoruz hikaye anlatanları doğru veya yalan dinliyoruz onları. Mavi veya ela gözler, esmer yada kumral fark etmeksizin inaniyor veya inanmıyoruz. Kimi zaman fanatik, kimi zaman kayıtsız oluyoruz. Fakat hepimiz doğru ile yanlışı göreceli buluyor ama yine de bir doğruya bir yanlışa inanıyoruz. Çakırkeyifken ayrı sarhoşken ayrı olmuyoruz, içtikçe ayılıyor ayıldıkça içiyoruz. Kim iyi kimin kötü olduğunu suyu kaçmış balıktan anlıyoruz. Sonra balığın başına bakıyoruz, koklamaya gerek kalmadan bakıyoruz gözünün içine sonra tamam diyoruz. Dolaptaki yetmez diyor duruyoruz, seninle karşılaşıyor uzun uzun bakışıyor yada görür görmez yapışıyoruz. Aşka inanmıyor, gönül eğlendiriyoruz yada doğru kişinin sen olduğuna karar veremiyoruz. Başlıyorsun anlatmaya geçmiş hikayeleri, aldığın dersleri dürüstçe mertçe diyorsun ki yanlış yaptım. Kimse sormamışken o çalışan geliyor aklına, müzik sesleniyor bize bir doğrucu lazım. Halbuki doğruları söylediği için gitmemiş miydi o da, derin bir nefes tamam önce ben değişeceğim. Bu kadeh doğruculara, doğruyu söyleme cüreti olan aslanlara süt çocuklarına. Çünkü biliyorsun hikayenin başını da sonunu da, senin gibi biz de biliyoruz sakladığın doğruları da yanlışları da. Şimdi, ilk olmanın heyecanındasın üzüm kadar değerli, çocuk kadar korkak, akıllı bir erkek, bilge bir kadınsın. Geçmişinle barışmış bugünün değerini anlıyorsun, gelecek sokaktan ben de geçtim demek için buradasın.",
    theme: "from-emerald-900/20 to-black",
    accent: "text-emerald-400"
  }
};

export default function Problem() {
  const [activeTab, setActiveTab] = useState<'yalan' | 'dogru'>('yalan');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabChange = (tab: 'yalan' | 'dogru') => {
    if (tab === activeTab || isAnimating) return;
    setIsAnimating(true);
    setActiveTab(tab);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <SectionWrapper id="problem" className="py-20">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
        <span className="text-primary text-sm tracking-widest uppercase">01 / Gerçeklik</span>
            <h2 className="text-4xl md:text-6xl font-serif mt-4">İki Hikaye</h2>
          </div>
          
          {/* Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-sm">
            {(['yalan', 'dogru'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={clsx(
                  "px-8 py-3 rounded-full text-sm uppercase tracking-widest transition-all duration-500",
                  activeTab === tab 
                    ? "bg-white text-black shadow-lg" 
                    : "text-white/50 hover:text-white"
                )}
              >
                {STORIES[tab].title}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[60vh] bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm transition-colors duration-1000">
            {/* Background Atmosphere */}
            <div 
                className={clsx(
                    "absolute inset-0 bg-gradient-to-br transition-all duration-1000 opacity-50",
                    STORIES[activeTab].theme
                )} 
            />
            
            <div className="relative z-10 p-8 md:p-16 h-full flex flex-col justify-center">
                 {/* Content Wrapper for Fade Effect */}
                 <div key={activeTab} className="animate-fade-in">
                    <h3 className={clsx("text-2xl md:text-3xl font-serif mb-8 transition-colors duration-500", STORIES[activeTab].accent)}>
                        {STORIES[activeTab].subtitle}
                    </h3>
                    <div className="columns-1 md:columns-2 gap-12 space-y-4">
                        <p className="text-lg md:text-xl leading-relaxed text-white/90 font-light indent-8 text-balance">
                            {STORIES[activeTab].content}
                        </p>
                    </div>
                 </div>
      </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none transition-all duration-1000">
                 <div className={clsx("w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000", activeTab === 'yalan' ? 'bg-red-600' : 'bg-emerald-600')} />
            </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </SectionWrapper>
  );
}
