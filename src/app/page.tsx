import Navigation from "@/components/Navigation";
import SketchReveal from "@/components/SketchReveal";
import Hero from "@/components/sections/Hero";
import Hikaye from "@/components/sections/Hikaye";
import Differentiators from "@/components/sections/Differentiators";
import Process from "@/components/sections/Process";
import Proof from "@/components/sections/Proof";
import GlobeSection from "@/components/sections/GlobeSection";
import Hayal from "@/components/sections/Hayal";
import CocktailDemo from "@/components/sections/CocktailDemo";
import Muvaffakiyet from "@/components/sections/Muvaffakiyet";
import Matematik from "@/components/sections/Matematik";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <SketchReveal />
      <Navigation />
      
      <Hero />
      <Hikaye />
      <Matematik />
      <Differentiators />
      <Process />
      <Proof />
      <GlobeSection />
      <Hayal />
      <CocktailDemo />
      <Muvaffakiyet />
      <Contact />
    </main>
  );
}
