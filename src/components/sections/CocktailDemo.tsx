import React from "react";
import SectionWrapper from "@/components/SectionWrapper";
import CocktailReveal from "@/components/CocktailReveal";

export default function CocktailDemo() {
  return (
    <SectionWrapper id="cocktail-demo" fullHeight={false}>
      <div className="w-full mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Our Cocktails
          </h2>
          <p className="text-neutral-600 max-w-lg mx-auto">
            Experience our colorful selection.
          </p>
        </div>
        
        <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm -mr-4 md:-mr-12 lg:-mr-12 xl:-mr-24 rounded-r-none border-r-0">
          <CocktailReveal />
        </div>
      </div>
    </SectionWrapper>
  );
}
