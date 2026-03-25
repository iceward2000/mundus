"use client";

import CocktailReveal from "@/components/CocktailReveal";

export default function CocktailDemo() {
  return (
    <section
      id="cocktail-demo"
      className="relative z-10 w-full overflow-hidden bg-black min-h-[78svh] md:min-h-screen"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src="/videos/mundus%20cocktail%20video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-10 bg-black/30" />

      <div className="absolute inset-0 z-20">
        <CocktailReveal />
      </div>
    </section>
  );
}
