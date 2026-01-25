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
        "relative w-full overflow-hidden px-4 md:px-12 lg:px-24 py-20",
        fullHeight && "min-h-screen flex flex-col justify-center",
        className
      )}
    >
      {children}
    </section>
  );
}
