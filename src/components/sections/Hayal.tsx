"use client";

import { useState } from "react";
import SectionWrapper from "../SectionWrapper";
import clsx from "clsx";

const TABS = {
  gercek: {
    title: "Gerçek",
    subtitle: "Hayal - Gerçek",
    content: "Asırlardır insanlık gerçek veya kurgu hikayeler anlattı. Çoğunlukla geçmişi, bazen bugünü nadiren de alternatifi tasavvur etti. 21. Yüzyıl fütüristleri haklı çıkarttı, hayalperest olanları daha çok ödüllendirdi. Hayatlarımızda yeni olmayan ama her geçen gün daha gerçek olmaya başlayan, olmasa bile gerçekleşeceğine inandığımız düşler, dinlemek istediğimiz masallar var. Geleneksel Türk kültüründe hayalbaz olarak bilinen düş anlatıcısı ise zaman içinde unutuldu, önemini kaybetti. Batının benimsediği masallar kurduğu hayallere ortak olduk, rolümüzü sahnede değil izleyici koltuğunda oynadık. Herhangi bir seyirci olmayan bizler bir sonraki oyunun herkes için sıkıcı olduğunu artık biliyoruz, dünya değişiyor Yeni Dünya geçmişe saygı içerisinde hızla büyümeye devam ediyor. Köpüklü şarap üretmeye başlayan yerler, fermentasyonla tanışan üzümler, içmeni bekleyen hazır kokteyller ve memleketinden gelen tahıllar, ürünler, yöntemler hemen her sektör gibi alkollü içecekler de yeniliğin cazibesiyle harmanlanıyor. Geçmişin zenginliği doyum veriyor eskilere, iştahını kabartıyor ilk defa gelecek rekoltenin veya tadılmış olacak yeni bir hammaddenin. Şunu biliyoruz, bu yüzyıl hayalperestlerin, düşlerini anlatmaktan çekinmeyen, bir gelecek hikayesi yazmaya cesareti olanların zaferiyle taçlandırılacak. Ayağı yere basan gerçekçi hayaller kuranlar, gülmeyi unutmadan güldürmekten zevk alan profesyonellerin ellerinde yükselecek cirolar, karlılıklar. Değişimi kucaklamaktan öte değişimin kaynağı olan vizyonerlerin yönettiği, insan sermayesine yatırım yapan şirketler kazanacak. Geçtiğimiz yıllarda iyiden iyiye neşemizi kaybetmeye başladık, hayatımızın içerisindeki gerçekler ve kötülüklerle hepimiz çok yorulduk. Yeniden uyanmak, dinlenmek ve güzel bir güne başlamak için ihtiyacımız olan tatlı bir rüya, içilen lezzetli bir kahve ve hoş bir müzik ile başlanacak masalsı bir güne. Sevgi, saygı ve şevk dolsun içimiz hadi bize bir masal anlat içinde sen, ben ve biz olalım, tüm gün çalışıp akşam misafirlerimize anlatalım hayal dünyamızı biraz esrik biraz eksik de olsa.",
    theme: "from-indigo-900/20 to-black",
    accent: "text-indigo-400"
  },
  sahte: {
    title: "Sahte",
    subtitle: "Hayal - Sahte",
    content: "Hepimiz biliyoruz, gelecek beklediğimiz kadar iyi olmayacak lakin sandığımız kadar kötü de olmayacak. Bugün kesin olarak bilebildiğimiz yegane şey ise toplumun genelinin daha önce yaşamış tüm insanlardan daha iyi hayat şartlarına sahip olduğudur. Ütopya ve distopyaların aynı anda yaşandığı dünyamız göreceli olarak evriliyor. Hem ekolojik hem de küresel olan bu değişimler hayallerimizi doğrudan etkiliyor. İçkimizdeki buzlar eriyor ne var ki bu zevk-i sefadan geri durmaya hiçbirimiz değiliz gibi niyetli. Bu noktada insan sorguluyor, nedir bu işin derdi dermanı o noktada anlıyor yarın kadehin boş kalacağını, ondan koyuyor bir duble daha bu sefer unutmak için derdi dermanı. Şimdi iş bize düşüyor, ayağa kaldırmak gerekli umutsuz olanı bu kişi sensin yada sana en yakın olan iş arkadaşı. Sahtelikten uzak samimi bir hayal arkadaşlığı, herkesten çok gördüğün zaruri yoldaşlığı, şimdi birlikte bakacağız göğe gerçekleri öğrenmeye sonra yine çalışacağız birlikte sahte olan hayalleri gerçeklerle değiştirmeye. Umut satmayan bir işe uyanacağız hoş bir düşten, istifa gününü kollamadan; gelecekle barışık, güzel hayalleri olanlarla başlayacak günümüz. Bundan böyle kandırmayacağız sizi ne de siz bizi, hakiki hayaller kuracağız ulaşabileceğimiz nevi şahsımıza münhasır bir hikaye. Özgün ve esaslı hazırlanmış bir rapor sunumu, önce alkışlayacağımız sonra eleştireceğimiz bir toplantı sonrası ruh halimizin benzersiz dinginliği saracak yerini bir güvercinin tedirginliğini. Hadi gerçek bir hayale inanmaya devam edelim, sahte hayalleri anlatanlara inat.",
    theme: "from-purple-900/20 to-black",
    accent: "text-purple-400"
  }
};

export default function Hayal() {
  const [activeTab, setActiveTab] = useState<'gercek' | 'sahte'>('gercek');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabChange = (tab: 'gercek' | 'sahte') => {
    if (tab === activeTab || isAnimating) return;
    setIsAnimating(true);
    setActiveTab(tab);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <SectionWrapper id="hayal" className="py-20">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-primary text-sm tracking-widest uppercase">Vizyon</span>
            <h2 className="text-4xl md:text-6xl font-serif mt-4">Hayal</h2>
          </div>
          
          {/* Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-sm">
            {(['gercek', 'sahte'] as const).map((tab) => (
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
                {TABS[tab].title}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[60vh] bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm transition-colors duration-1000">
            {/* Background Atmosphere */}
            <div 
                className={clsx(
                    "absolute inset-0 bg-gradient-to-br transition-all duration-1000 opacity-50",
                    TABS[activeTab].theme
                )} 
            />
            
            <div className="relative z-10 p-8 md:p-16 h-full flex flex-col justify-center">
                 {/* Content Wrapper for Fade Effect */}
                 <div key={activeTab} className="animate-fade-in">
                    <h3 className={clsx("text-2xl md:text-3xl font-serif mb-8 transition-colors duration-500", TABS[activeTab].accent)}>
                        {TABS[activeTab].subtitle}
                    </h3>
                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-lg md:text-xl leading-relaxed text-white/90 font-light indent-8 text-balance whitespace-pre-line">
                            {TABS[activeTab].content}
                        </p>
                    </div>
                 </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none transition-all duration-1000">
                 <div className={clsx("w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000", activeTab === 'gercek' ? 'bg-indigo-600' : 'bg-purple-600')} />
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
