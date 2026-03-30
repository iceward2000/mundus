import Navigation from "@/components/Navigation";
import LazySketchReveal from "@/components/LazySketchReveal";
import Hero from "@/components/sections/Hero";
import Hikaye from "@/components/sections/Hikaye";
import Matematik from "@/components/sections/Matematik";
import RakiFrames from "@/components/sections/RakiFrames";
import GlobeSection from "@/components/sections/GlobeSection";
import Hayal from "@/components/sections/Hayal";
import CocktailDemo from "@/components/sections/CocktailDemo";
import Muvaffakiyet from "@/components/sections/Muvaffakiyet";
import SparklingFrames from "@/components/sections/SparklingFrames";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <LazySketchReveal />
      <Navigation />
      
      <Hero />
      <Hikaye />
      <Matematik />
      <RakiFrames />
      <GlobeSection />
      <Hayal />
      <CocktailDemo />
      <Muvaffakiyet />
      <SparklingFrames />
      <Contact />
    </main>
  );
}
