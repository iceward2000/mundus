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
  return (
    <section
      id={id}
      className={clsx(
        "relative w-full overflow-hidden py-20",
        // Base horizontal padding
        "px-4 md:px-12 lg:px-24",
        fullHeight && "min-h-screen flex flex-col justify-center",
        className
      )}
    >
      {children}
    </section>
  );
}
