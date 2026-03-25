import Navigation from "@/components/Navigation";
import SketchReveal from "@/components/SketchReveal";
import Hero from "@/components/sections/Hero";
import Hikaye from "@/components/sections/Hikaye";
import Matematik from "@/components/sections/Matematik";
import RakiFrames from "@/components/sections/RakiFrames";
import Team from "@/components/sections/Team";
import GlobeSection from "@/components/sections/GlobeSection";
import Hayal from "@/components/sections/Hayal";
import CocktailDemo from "@/components/sections/CocktailDemo";
import Muvaffakiyet from "@/components/sections/Muvaffakiyet";
import SparklingFrames from "@/components/sections/SparklingFrames";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <SketchReveal />
      <Navigation />
      
      <Hero />
      <Hikaye />
      <Matematik />
      <RakiFrames />
      <GlobeSection />
      <Team />
      <Hayal />
      <CocktailDemo />
      <Muvaffakiyet />
      <SparklingFrames />
      <Contact />
    </main>
  );
}
