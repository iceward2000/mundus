"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import SectionWrapper from "@/components/SectionWrapper";
import { useLanguage } from "@/context/LanguageContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  text: string;
  modelPath: string;
}

interface TeamModelStageProps {
  members: TeamMember[];
  activeIndex: number;
}

interface ModelEntry {
  group: THREE.Group;
  baseY: number;
  baseRotationY: number;
  baseScale: number;
}

function setGroupOpacity(group: THREE.Group, opacity: number) {
  group.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = opacity;
      material.needsUpdate = true;
    });
  });
}

function TeamModelStage({ members, activeIndex }: TeamModelStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const modelEntriesRef = useRef<ModelEntry[]>([]);
  const currentIndexRef = useRef(0);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const revealRef = useRef<(nextIndex: number, animate?: boolean) => void>(() => {});
  const latestActiveIndexRef = useRef(activeIndex);
  const interactingRef = useRef(false);
  const azimuthDirectionRef = useRef(1);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    latestActiveIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.05, 4.8); // slightly more zoomed-out

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    // Front-only viewing bounds: prevent showing back and underside of bust.
    const minAzimuth = -0.36;
    const maxAzimuth = 0.36;
    const minPolar = Math.PI * 0.42;
    const maxPolar = Math.PI * 0.56;
    controls.minAzimuthAngle = minAzimuth;
    controls.maxAzimuthAngle = maxAzimuth;
    controls.minPolarAngle = minPolar;
    controls.maxPolarAngle = maxPolar;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.46;
    controls.target.set(0, 0.12, 0);

    const ambient = new THREE.AmbientLight("#ffffff", 1.0);
    const key = new THREE.DirectionalLight("#ffffff", 1.0);
    key.position.set(2.6, 2.1, 3.5);
    const fill = new THREE.DirectionalLight("#b9d2ff", 0.36);
    fill.position.set(-2.2, 0.9, 1.3);
    const rim = new THREE.DirectionalLight("#d4af37", 0.45);
    rim.position.set(0.5, 1.3, -2.8);
    scene.add(ambient, key, fill, rim);

    const loader = new GLTFLoader();
    let rafId = 0;

    const fitToView = (model: THREE.Group, index: number): ModelEntry => {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 1.58; // scale down busts a bit to avoid zoomed-in look
      const scale = targetSize / maxDim;
      model.scale.setScalar(scale);
      const baseRotationY = (index - 1) * 0.2;
      model.rotation.y = baseRotationY;
      model.position.y -= 0.08;
      model.visible = false;
      setGroupOpacity(model, 0);

      return {
        group: model,
        baseY: model.position.y,
        baseRotationY,
        baseScale: scale,
      };
    };

    const reveal = (nextIndex: number, animate = true) => {
      const entries = modelEntriesRef.current;
      const next = entries[nextIndex];
      if (!next) return;

      if (transitionRef.current) {
        transitionRef.current.kill();
        transitionRef.current = null;
      }

      const previousIndex = currentIndexRef.current;
      const previous = entries[previousIndex];

      if (!animate || prefersReducedMotion || !previous || previousIndex === nextIndex) {
        entries.forEach((entry, idx) => {
          entry.group.visible = idx === nextIndex;
          entry.group.position.y = entry.baseY;
          entry.group.rotation.y = entry.baseRotationY;
          entry.group.scale.setScalar(entry.baseScale);
          setGroupOpacity(entry.group, idx === nextIndex ? 1 : 0);
        });
        currentIndexRef.current = nextIndex;
        return;
      }

      entries.forEach((entry, idx) => {
        if (idx !== previousIndex && idx !== nextIndex) {
          entry.group.visible = false;
          setGroupOpacity(entry.group, 0);
          entry.group.position.y = entry.baseY;
          entry.group.rotation.y = entry.baseRotationY;
          entry.group.scale.setScalar(entry.baseScale);
        }
      });

      next.group.visible = true;
      next.group.position.y = next.baseY + 0.18;
      next.group.rotation.y = next.baseRotationY - 0.5;
      next.group.scale.setScalar(next.baseScale * 0.92);
      setGroupOpacity(next.group, 0);

      const outOpacity = { value: 1 };
      const inOpacity = { value: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          previous.group.visible = false;
          previous.group.position.y = previous.baseY;
          previous.group.rotation.y = previous.baseRotationY;
          previous.group.scale.setScalar(previous.baseScale);
          setGroupOpacity(previous.group, 0);

          next.group.visible = true;
          next.group.position.y = next.baseY;
          next.group.rotation.y = next.baseRotationY;
          next.group.scale.setScalar(next.baseScale);
          setGroupOpacity(next.group, 1);

          currentIndexRef.current = nextIndex;
        },
      });

      tl.to(previous.group.position, { y: previous.baseY - 0.15, duration: 0.3, ease: "power2.in" }, 0);
      tl.to(previous.group.rotation, { y: previous.baseRotationY + 0.42, duration: 0.3, ease: "power2.in" }, 0);
      tl.to(outOpacity, {
        value: 0,
        duration: 0.28,
        ease: "power1.in",
        onUpdate: () => setGroupOpacity(previous.group, outOpacity.value),
      }, 0);

      tl.to(next.group.position, { y: next.baseY, duration: 0.44, ease: "power3.out" }, 0.08);
      tl.to(next.group.rotation, { y: next.baseRotationY, duration: 0.44, ease: "power3.out" }, 0.08);
      tl.to(next.group.scale, { x: next.baseScale, y: next.baseScale, z: next.baseScale, duration: 0.44, ease: "power3.out" }, 0.08);
      tl.to(inOpacity, {
        value: 1,
        duration: 0.33,
        ease: "power1.out",
        onUpdate: () => setGroupOpacity(next.group, inOpacity.value),
      }, 0.12);

      transitionRef.current = tl;
    };

    revealRef.current = reveal;

    Promise.all(
      members.map(
        (member, index) =>
          new Promise<ModelEntry>((resolve, reject) => {
            loader.load(
              member.modelPath,
              (gltf) => {
                const model = gltf.scene;
                model.traverse((child) => {
                  if ((child as THREE.Mesh).isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                  }
                });
                resolve(fitToView(model, index));
              },
              undefined,
              reject
            );
          })
      )
    )
      .then((entries) => {
        if (!isMounted) return;
        modelEntriesRef.current = entries;
        entries.forEach((entry) => scene.add(entry.group));
        reveal(latestActiveIndexRef.current, false);
        controls.update();
        setStatus("ready");
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const handleControlStart = () => {
      interactingRef.current = true;
    };
    const handleControlEnd = () => {
      interactingRef.current = false;

      // When user drops at an edge, continue by moving toward the opposite side.
      const az = controls.getAzimuthalAngle();
      if (az >= maxAzimuth - 0.01) azimuthDirectionRef.current = -1;
      else if (az <= minAzimuth + 0.01) azimuthDirectionRef.current = 1;

      controls.autoRotateSpeed = Math.abs(controls.autoRotateSpeed) * azimuthDirectionRef.current;
    };

    controls.addEventListener("start", handleControlStart);
    controls.addEventListener("end", handleControlEnd);

    let lastFrameTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      // Custom bounded idle movement with automatic direction reversal.
      if (!interactingRef.current && !prefersReducedMotion) {
        const az = controls.getAzimuthalAngle();

        if (az >= maxAzimuth - 0.01) {
          azimuthDirectionRef.current = -1;
        } else if (az <= minAzimuth + 0.01) {
          azimuthDirectionRef.current = 1;
        }

        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.46 * azimuthDirectionRef.current;
      } else {
        controls.autoRotate = false;
      }

      controls.update();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      isMounted = false;
      if (transitionRef.current) transitionRef.current.kill();
      cancelAnimationFrame(rafId);
      controls.removeEventListener("start", handleControlStart);
      controls.removeEventListener("end", handleControlEnd);
      observer.disconnect();
      controls.dispose();

      modelEntriesRef.current.forEach((entry) => {
        entry.group.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material?.dispose();
          }
        });
      });

      scene.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [members, prefersReducedMotion]);

  useEffect(() => {
    if (status !== "ready") return;
    revealRef.current(activeIndex, true);
  }, [activeIndex, status]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-visible">
      {status !== "ready" && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-white/60">
          {status === "loading" ? "Loading 3D" : "Model unavailable"}
        </div>
      )}
    </div>
  );
}

export default function Team() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const members = useMemo(
    () => [
      {
        id: "member-1",
        name: t("team.member1"),
        role: t("team.member1.role"),
        text: t("team.member1.text"),
        modelPath: "/3dmodels/2ee9d13ede55de17c04c6bee53d51104.glb",
      },
      {
        id: "member-2",
        name: t("team.member2"),
        role: t("team.member2.role"),
        text: t("team.member2.text"),
        modelPath: "/3dmodels/38b5f35d012050b6c6a29316d009c91d.glb",
      },
      {
        id: "member-3",
        name: t("team.member3"),
        role: t("team.member3.role"),
        text: t("team.member3.text"),
        modelPath: "/3dmodels/b8a57bfd76a272ee4a6359a0dbc42ab6.glb",
      },
    ],
    [t]
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!sectionRef.current || !trackRef.current || members.length < 1) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: trackRef.current,
        start: "top top",
        end: "bottom bottom",
        snap: !prefersReducedMotion && members.length > 1
          ? {
              snapTo: 1 / (members.length - 1),
              duration: { min: 0.15, max: 0.35 },
              ease: "power2.inOut",
              delay: 0.02,
            }
          : undefined,
        onUpdate: (self) => {
          const maxIndex = members.length - 1;
          const idx = Math.max(0, Math.min(maxIndex, Math.round(self.progress * maxIndex)));
          if (idx !== activeIndexRef.current) {
            activeIndexRef.current = idx;
            setActiveIndex(idx);
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [members.length, prefersReducedMotion]);

  useEffect(() => {
    if (!textRef.current || prefersReducedMotion) return;
    gsap.fromTo(
      textRef.current,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.38, ease: "power3.out" }
    );
  }, [activeIndex, prefersReducedMotion]);

  const scrollToProfile = (index: number) => {
    if (!trackRef.current || members.length <= 1) return;
    const rect = trackRef.current.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const scrollable = trackRef.current.offsetHeight - window.innerHeight;
    const y = start + (index / (members.length - 1)) * scrollable;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <SectionWrapper
      id="team"
      fullHeight={false}
      className="!overflow-visible !px-0 !py-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.08),_rgba(0,0,0,1)_58%)]"
    >
      <section ref={sectionRef} className="relative w-full">
        <div ref={trackRef} className="relative" style={{ height: `${members.length * 120}vh` }}>
          <div className="sticky top-0 h-screen w-full">
            <div className="mx-auto flex h-full w-full max-w-7xl items-center px-4 md:px-12 lg:px-24">
              <div className="grid w-full items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
                <div className="order-2 h-[44vh] min-h-[280px] w-full md:h-[52vh] lg:order-1 lg:h-[60vh]">
                  <TeamModelStage members={members} activeIndex={activeIndex} />
                </div>

                <div className="order-1 lg:order-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Mundus</p>
                  <h2 className="mt-3 text-4xl font-serif md:text-5xl">{t("team.title")}</h2>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/68 md:text-base">
                    {t("team.subtitle")}
                  </p>

                  <div ref={textRef} className="mt-7 min-h-[160px] md:min-h-[180px]">
                    <p className="text-sm uppercase tracking-[0.23em] text-white/45">
                      {members[activeIndex]?.role}
                    </p>
                    <h3 className="mt-2 text-2xl font-serif text-white md:text-3xl">
                      {members[activeIndex]?.name}
                    </h3>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/72 md:text-base">
                      {members[activeIndex]?.text}
                    </p>
                  </div>

                  <div className="mt-7 flex items-center gap-3">
                    {members.map((member, index) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => scrollToProfile(index)}
                        aria-label={member.name}
                        className={
                          index === activeIndex
                            ? "h-1.5 w-8 rounded-full bg-primary transition-all duration-300"
                            : "h-1.5 w-1.5 rounded-full bg-white/25 transition-all duration-300 hover:bg-white/45"
                        }
                      />
                    ))}
                  </div>

                  <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/42 md:text-xs">
                    {t("team.scrollHint")} - {t("team.dragHint")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
}

