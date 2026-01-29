import Navigation from "@/components/Navigation";
import SketchReveal from "@/components/SketchReveal";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Services from "@/components/sections/Services";
import Differentiators from "@/components/sections/Differentiators";
import Process from "@/components/sections/Process";
import Proof from "@/components/sections/Proof";
import GlobeSection from "@/components/sections/GlobeSection";
import CocktailDemo from "@/components/sections/CocktailDemo";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <SketchReveal />
      <Navigation />
      
      <Hero />
      <Problem />
      <Services />
      <Differentiators />
      <Process />
      <Proof />
      <GlobeSection />
      <CocktailDemo />
      <Contact />
    </main>
  );
}
