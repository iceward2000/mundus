import React from "react";
import SectionWrapper from "@/components/SectionWrapper";
import CocktailReveal from "@/components/CocktailReveal";

export default function CocktailDemo() {
  return (
    <SectionWrapper id="cocktail-demo" fullHeight={false} className="!px-0">
      <div className="w-full mx-auto space-y-8">
        <div className="text-center space-y-4 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Kokteyllerimiz
          </h2>
          <p className="text-neutral-600 max-w-lg mx-auto">
            Renkli seçkimizi deneyimleyin.
          </p>
        </div>
        
        <div className="border-y border-neutral-200 overflow-hidden shadow-sm w-full">
          <CocktailReveal />
        </div>
      </div>
    </SectionWrapper>
  );
}
