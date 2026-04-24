"use client";

import clsx from "clsx";
import { useState, type CSSProperties, type MouseEvent } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import { StableLocaleText } from "@/components/StableLocaleText";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type TeamMember = {
  name: string;
  roleTr: string;
  roleEn: string;
  orgTr?: string;
  orgEn?: string;
};

type CardLightState = {
  x: number;
  y: number;
  colorShift: number;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Rezzak Sezgin",
    roleTr: "Kreatif Direktör",
    roleEn: "Creative Director",
    orgTr: "Deveci Agency",
    orgEn: "Deveci Agency",
  },
  {
    name: "Hüseyin Yiğit Gemici",
    roleTr: "Web Geliştiricisi ve Tasarımcısı",
    roleEn: "Web Developer and Designer",
    orgTr: "greywork",
    orgEn: "greywork",
  },
  {
    name: "Göktan Karaaydın",
    roleTr: "Prodüktör ve DJ",
    roleEn: "Producer and DJ",
    orgTr: "Caelo",
    orgEn: "Caelo",
  },
  {
    name: "Tuna Demir",
    roleTr: "Avukat ve Hukuki Danışman",
    roleEn: "Lawyer and Legal Advisor",
    orgTr: "Demir & Demir",
    orgEn: "Demir & Demir",
  },
  {
    name: "Barış Yılmaz",
    roleTr: "3D Modelleme Uzmanı",
    roleEn: "3D Modeling Specialist",
  },
  {
    name: "Alper Bulut",
    roleTr: "Karikatürist ve 2D Sanatçı",
    roleEn: "Cartoonist and 2D Artist",
  },
];

const COHESIVE_COLOR_STEPS = [-2.2, -1.2, -0.4, 0.4, 1.2, 2.2];

const randomCohesiveColorShift = () => {
  const step = COHESIVE_COLOR_STEPS[Math.floor(Math.random() * COHESIVE_COLOR_STEPS.length)];
  const jitter = Math.random() * 0.8 - 0.4;
  return Math.round((step + jitter) * 100) / 100;
};

const randomCardLightState = (): CardLightState => ({
  x: Math.round((18 + Math.random() * 64) * 100) / 100,
  y: Math.round((16 + Math.random() * 68) * 100) / 100,
  colorShift: randomCohesiveColorShift(),
});

export default function Team() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [cardLightPositions, setCardLightPositions] = useState(() =>
    TEAM_MEMBERS.map(() => randomCardLightState())
  );

  const getCardIntensity = (index: number) => {
    if (prefersReducedMotion || activeCardIndex === null) return 0;
    const distance = Math.abs(activeCardIndex - index);
    if (distance === 0) return 1;
    if (distance === 1) return 0.38;
    if (distance === 2) return 0.16;
    return 0;
  };

  const handleCardMouseMove = (
    event: MouseEvent<HTMLElement>,
    index: number
  ) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const normalizedX = (x - 50) / 50;
    const normalizedY = (y - 50) / 50;
    const hueShift = normalizedX * 14 + normalizedY * 8;
    const lightShift = -normalizedY * 7 + Math.abs(normalizedX) * 2;

    event.currentTarget.style.setProperty("--team-mx", `${x.toFixed(2)}%`);
    event.currentTarget.style.setProperty("--team-my", `${y.toFixed(2)}%`);
    event.currentTarget.style.setProperty("--team-hue-shift", hueShift.toFixed(2));
    event.currentTarget.style.setProperty("--team-light-shift", `${lightShift.toFixed(2)}%`);
    setActiveCardIndex(index);
  };

  const randomizePassiveLights = (activeIndex: number) => {
    setCardLightPositions((prev) =>
      prev.map((state, index) => (index === activeIndex ? state : randomCardLightState()))
    );
  };

  return (
    <SectionWrapper
      id="team"
      fullHeight={false}
      className="bg-gradient-to-b from-neutral-950 via-black to-neutral-950"
    >
      <div className="relative mx-auto w-full max-w-7xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 -top-10 h-36 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative z-10 mb-10 flex flex-col gap-4 md:mb-14">
          <h2 className="font-serif text-4xl leading-tight text-white md:text-6xl">
            <StableLocaleText tr="Partnerlerimiz" en="Partnerlerimiz" fill />
          </h2>
        </div>

        <div className="relative flex flex-col gap-4 md:gap-6">
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent md:left-1/2 md:-translate-x-1/2"
          />
          {TEAM_MEMBERS.map((member, index) => (
            <div
              key={member.name}
              className={clsx(
                "relative flex w-full pl-10 md:pl-0",
                index % 2 === 0 ? "md:justify-start" : "md:justify-end"
              )}
            >
              <article
                onMouseEnter={() => {
                  if (prefersReducedMotion) return;
                  randomizePassiveLights(index);
                  setActiveCardIndex(index);
                }}
                onMouseLeave={(event) => {
                  if (prefersReducedMotion) return;
                  const fallback = cardLightPositions[index] ?? { x: 50, y: 50, colorShift: 0 };
                  event.currentTarget.style.setProperty("--team-mx", `${fallback.x}%`);
                  event.currentTarget.style.setProperty("--team-my", `${fallback.y}%`);
                  event.currentTarget.style.setProperty("--team-hue-shift", "0");
                  event.currentTarget.style.setProperty("--team-light-shift", "0%");
                  event.currentTarget.style.setProperty(
                    "--team-color-shift",
                    fallback.colorShift.toFixed(2)
                  );
                  setActiveCardIndex(null);
                }}
                onMouseMove={(event) => handleCardMouseMove(event, index)}
                style={
                  {
                    "--team-mx": `${cardLightPositions[index]?.x ?? 50}%`,
                    "--team-my": `${cardLightPositions[index]?.y ?? 50}%`,
                    "--team-hue-shift": 0,
                    "--team-light-shift": "0%",
                    "--team-color-shift": cardLightPositions[index]?.colorShift ?? 0,
                    "--team-glass-intensity": getCardIntensity(index),
                  } as CSSProperties
                }
                className={clsx(
                  "team-glass-card group relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-white/[0.04] p-5 sm:p-7",
                  "shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
                  "focus-within:ring-2 focus-within:ring-primary/50",
                  prefersReducedMotion && "team-glass-card--reduced-motion",
                  index % 2 === 0 ? "md:mr-8" : "md:ml-8",
                  !prefersReducedMotion && "transition-shadow duration-500 ease-out"
                )}
              >
                <div
                  aria-hidden
                  className={clsx(
                    "team-glass-base pointer-events-none absolute inset-0",
                    prefersReducedMotion && "opacity-80"
                  )}
                />
                <div
                  aria-hidden
                  className={clsx(
                    "team-glass-spotlight pointer-events-none absolute inset-0",
                    !prefersReducedMotion && "transition-opacity duration-300"
                  )}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 md:hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(235,249,255,0.22) 0%, rgba(194,232,255,0.1) 38%, rgba(194,232,255,0.04) 62%, rgba(255,255,255,0) 100%)",
                  }}
                />
                <div
                  aria-hidden
                  className={clsx("team-glass-specular pointer-events-none absolute inset-0")}
                />

                <div
                  aria-hidden
                  className="absolute left-5 top-8 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-cyan-200/60 bg-black shadow-[0_0_0_4px_rgba(167,243,255,0.15)] md:hidden"
                />

                <div
                  aria-hidden
                  className={clsx(
                    "absolute top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-cyan-200/60 bg-black shadow-[0_0_0_4px_rgba(167,243,255,0.15)] md:block",
                    index % 2 === 0 ? "-right-[1.15rem]" : "-left-[1.15rem]"
                  )}
                />

                <div
                  className={clsx(
                    "relative z-10 flex h-full flex-col gap-4",
                    index % 2 === 1 && "md:items-end md:text-right"
                  )}
                >
                  <h3 className="text-xl font-semibold leading-snug text-white md:text-2xl">
                    {member.name}
                  </h3>

                  <p className="text-sm leading-relaxed text-white/80 md:text-base">
                    <StableLocaleText tr={member.roleTr} en={member.roleEn} fill />
                  </p>

                  {member.orgTr && member.orgEn ? (
                    <span className="mt-auto inline-flex w-fit text-sm tracking-wide text-white/55">
                      <StableLocaleText tr={member.orgTr} en={member.orgEn} nowrap />
                    </span>
                  ) : null}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
