"use client";

import clsx from "clsx";
import { ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  className?: string;
  children: ReactNode;
  fullHeight?: boolean;
}

export default function SectionWrapper({
  id,
  className,
  children,
  fullHeight = true,
}: SectionWrapperProps) {
  // Hero section doesn't need sidebar offset since nav morphs from center
  const isHero = id === "hero";
  
  return (
    <section
      id={id}
      className={clsx(
        "relative w-full overflow-hidden py-20",
        // Base horizontal padding
        "px-4 md:px-12",
        // Hero keeps standard padding, other sections get sidebar offset on large screens
        isHero 
          ? "lg:px-24" 
          : "lg:pl-72 xl:pl-80 lg:pr-12 xl:pr-24",
        fullHeight && "min-h-screen flex flex-col justify-center",
        className
      )}
    >
      {children}
    </section>
  );
}
