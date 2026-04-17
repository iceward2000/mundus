"use client";

import clsx from "clsx";
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

export default function Team() {
  const prefersReducedMotion = usePrefersReducedMotion();

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
            className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/25 to-transparent md:block"
          />
          {TEAM_MEMBERS.map((member, index) => (
            <div
              key={member.name}
              className={clsx(
                "relative flex w-full",
                index % 2 === 0 ? "md:justify-start" : "md:justify-end"
              )}
            >
              <article
                className={clsx(
                  "group relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-7",
                  "shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
                  "focus-within:ring-2 focus-within:ring-primary/50",
                  index % 2 === 0 ? "md:mr-8" : "md:ml-8",
                  !prefersReducedMotion &&
                    "transition-transform duration-500 ease-out hover:-translate-y-1 hover:border-primary/50"
                )}
              >
                <div
                  aria-hidden
                  className={clsx(
                    "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.16),_transparent_58%)] opacity-70",
                    !prefersReducedMotion && "transition-opacity duration-500 group-hover:opacity-100"
                  )}
                />

                <div
                  aria-hidden
                  className={clsx(
                    "absolute top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-primary/55 bg-black shadow-[0_0_0_4px_rgba(212,175,55,0.12)] md:block",
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
