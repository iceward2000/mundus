"use client";

import { useState } from "react";
import SectionWrapper from "../SectionWrapper";
import clsx from "clsx";

const DATA = [
  {
    id: "kim",
    title: "Kim",
    text: "İlk ipi göğüsleyen siz olacaksınız, adım atan, konfor alanından çıkan. Sonra biz; markanın bir logodan, havalı bir etiketten ibaret olmadığını, markanın değerlerini her pozisyonda bizzat yaşayan çalışma arkadaşlarımız, stratejik iş ortaklarımız ve bizi bir ticari metadan ziyade bir yaşam tarzı olarak gören bilinçli tüketici kitlemizle başaracağız. Sektörde yılların deneyim ve tecrübesiyle harmanlanmış, aynı zamanda alkollü içecek konusunda tutkulu gençler ile çalışılması gerektiği bilinciyle, sektörü herhangi bir hızlı tüketim ürünü, ilaç veya tütün gibi pazarlaması bir takım kurallara tabi sektörler ile bir görmeyen emekçiler ile yeni ufuklar keşfedilecektir. Mümkün olan tüm pozisyonlarda cinsiyet eşitliliğinin sağlayarak Y ve Z jenerasyonun dilinden anlayan, sağlıklı iletişim ve sağlam bağlar kurup, bünyesinde onlardan yetenekler barındırabilenler muvaffak oluyor ve olacaktır."
  },
  {
    id: "neden",
    title: "Neden",
    text: "Elbetteki iş dünyasındaki her oyuncunun temel var olma motivasyonu maddiyattır. Ancak genellikle mali olarak başarılı firmalar, etik ve ahlaki kazanımlarını en az maddi kazançları kadar tüketicilerine arz ederler. Bu strateji organik birer canlı olan işletmelerin maddiyat ve maneviyat dengelerini kurmalarına hizmet eder. Küçük ve orta ölçekli firmaların yanılabildiği nokta ise finansal zafer kazanılmadan etik kaygı güdülme imkansızlığının düşünülmesidir. Fakat unutulmamalıdır ki dünya ile birlikte şirketler ve şirketleri oluşturan insanlarda değişmektedir. Kullanıcıların tüketim ve üretim alışkanlıkları şekillendirmeye başladığı bu yüzyılda müşterilerin markalarla kurduğu aidiyet bağı, o markanın etik duruşuna ve temsil ettiği değerlere dayanmaktadır. Şirketler, kendini bu konularda geliştirmezler ise uzun soluklu bir şirket olamama riskiyle karşı karşıya kalınmaktadır. Tüketiciler yalnızca, markayı ve ürünü kendisini ve hayat görüşlerini temsil eden bir sembol olarak gördüğünde gerçek bir marka sadakati oluşur."
  },
  {
    id: "nasil",
    title: "Nasıl",
    text: "Hangi yöntem, proje ve stratejilerin benimseneceği, markanın temel değerleriyle uyumlu olmalıdır. Bu başarı; şeffaf bir çalışma ekosistemi içerisinde, kolektif karar alma mekanizmalarıyla, vizyon ve misyonların yazılı ve sözlü kalmadığını şirket bünyesinde her kademe ve pozisyonda uygulamak, hissettirmektir. Satış, pazarlama ve tasarım kararlarımız insanı merkezine alan bir yaklaşımla müzakere ve ortak akıl ile hayata geçirilmektir. Sözün özü çalışmaktır, çok çalışmak çalışmaya özendirmek takdir etmektir. Danışmanlık hizmetimizin ana sorusu olan başarının nasıl tahsis edileceği karşılıklı özverinin ta kendisidir."
  },
  {
    id: "ne-zaman",
    title: "Ne Zaman",
    text: "Hemen şimdi, çünkü trendler kitleselleşmeden çok önce öngörüldüğü anlarda başlar ve süreklilik gerektirir. Markalar tüketici eğilimlerini sadece pazar verileriyle değil, toplumsal dönüşümlerle okumaya başladığı an başarıyı yakalar. Gelecekte markayla aidiyet bağı kuracak nesillerin beklentilerini bugünden karşılamak; yeşil aklama yapmadan gerçek anlamda sosyal ve çevresel sürdürülebilirlik adımları atan, hedef koyan ve bu hedeflere ulaşılıp ulaşılamadığı gibi konularda öz eleştirilerde bulunabilen transparan bir süreç izleyen, bu başarın ne ölçüde ve ne zaman diliminde yapılacağının taahüdünün garanti altına alınması gibi konularla sağlanır. Bu proaktif duruş, gelecekte de pazarın ilgili ve geçerli bir aktörü olmamızı sağlar."
  },
  {
    id: "nerede",
    title: "Nerede",
    text: "Başarı sadece yerel pazarlarda değil, global bir sahnede gerçekleşmelidir. Öncelikle Türk diasporasının yoğun yaşadığı, Türk kültürünün ve ürünlerinin merak edildiği, beğenildiği tüm global coğrafyalarda varlık göstermektir. Başarı, markamızı ve ürünümüzü; dünyanın her noktasında tüketicinin kendisini ve hayat görüşünü temsil eden bir sembol olarak konumlandırabildiğimiz açık satış deneyiminden perakende satış erişilebilirliğine bir mangal başı sohbetinden Türklerin olmadığı bir sofraya kadar olan her yerdedir."
  },
  {
    id: "ne",
    title: "Ne",
    text: "Başarı; yüksek kârlılık rasyolarının ve hacimsel büyümenin ötesinde, aynı zamanda markanın her bir paydaşı için yarattığı değer, inovasyon yeteneğidir. Muvaffakiyet anlayışımız; dil, din, etnik köken, cinsiyet ve cinsel yönelim gibi konularda her türlü ayrımcılığa, psikolojik ve fiziksel şiddete tamamen karşı duran, gerektiriği durumlarda ivedilikle yaptırım uygulayan, toplumsal yarar güden ve gün geçtikçe artan bir sosyal sorumluluk bilinciyle hareket eden bir kurumsal kimlik inşa etmektir. Çünkü inanıyoruz ki başarılı markalar yalnızca tükettiğimiz ürünler değil aynı toplumun paydaşı olarak gördüğümüz yapılardır."
  }
];

export default function Muvaffakiyet() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <SectionWrapper id="muvaffakiyet" className="py-20">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-16">
          <span className="text-primary text-sm tracking-widest uppercase">Manifesto</span>
          <h2 className="text-4xl md:text-5xl font-serif mt-4">Muvaffakiyet</h2>
          <p className="mt-4 text-white/60 max-w-xl">
            Başarının 5N1K&apos;sı.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DATA.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveId(activeId === item.id ? null : item.id)}
              className={clsx(
                "group relative border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer bg-white/5 hover:bg-white/10",
                activeId === item.id && "bg-white/10 ring-1 ring-primary/50"
              )}
            >
              <div className="relative z-10 p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-2xl font-serif text-primary">{item.title}</h3>
                   <div className={clsx(
                     "w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-transform duration-300",
                     activeId === item.id ? "rotate-45" : ""
                   )}>
                     <span className="text-xs">+</span>
                   </div>
                </div>
                
                <div className={clsx(
                  "overflow-hidden transition-all duration-500",
                  activeId === item.id ? "max-h-[500px] opacity-100" : "max-h-24 opacity-60 mask-image-b"
                )}>
                  <p className="text-sm text-white/80 leading-relaxed font-light">
                    {item.text}
                  </p>
                </div>

                {activeId !== item.id && (
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
