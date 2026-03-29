"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
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

interface TeamModelCardProps {
  modelPath: string;
}

function TeamModelCard({ modelPath }: TeamModelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [shouldLoad, setShouldLoad] = useState(false);
  const interactingRef = useRef(false);
  const azimuthDirectionRef = useRef(1);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let modelGroup: THREE.Group | null = null;
    const isCompactViewport = window.matchMedia("(max-width: 1024px)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.05, isCompactViewport ? 5.2 : 4.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isCompactViewport,
      alpha: true,
      powerPreference: isCompactViewport ? "default" : "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactViewport ? 1.25 : 1.75));
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

    const fitToView = (model: THREE.Group) => {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = isCompactViewport ? 1.4 : 1.58;
      const scale = targetSize / maxDim;
      model.scale.setScalar(scale);
      model.rotation.y = -0.05;
      model.position.y -= 0.08;
      setGroupOpacity(model, 1);
    };
    loader.load(
      modelPath,
      (gltf) => {
        if (!isMounted) return;
        modelGroup = gltf.scene;
        modelGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });
        fitToView(modelGroup);
        scene.add(modelGroup);
        controls.update();
        setStatus("ready");
      },
      undefined,
      () => {
        if (isMounted) setStatus("error");
      }
    );

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
      cancelAnimationFrame(rafId);
      controls.removeEventListener("start", handleControlStart);
      controls.removeEventListener("end", handleControlEnd);
      observer.disconnect();
      controls.dispose();

      if (modelGroup) {
        modelGroup.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material?.dispose();
          }
        });
      }

      scene.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, prefersReducedMotion, shouldLoad]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-visible">
      {(!shouldLoad || status !== "ready") && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-white/60">
          {!shouldLoad || status === "loading" ? "Loading 3D" : "Model unavailable"}
        </div>
      )}
    </div>
  );
}

export default function Team() {
  const { t } = useLanguage();

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

  return (
    <SectionWrapper
      id="team"
      fullHeight={false}
      className="!overflow-visible !px-0 !py-12 md:!py-16 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.08),_rgba(0,0,0,1)_58%)]"
    >
      <section className="relative w-full">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-12 lg:px-24">
          <div className="mb-10 md:mb-14">
            <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Mundus</p>
            <h2 className="mt-3 text-4xl font-serif md:text-5xl">{t("team.title")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68 md:text-base">
              {t("team.subtitle")}
            </p>
          </div>

          <div className="space-y-14 md:space-y-20">
            {members.map((member, index) => (
              <article
                key={member.id}
                className="grid min-h-[72vh] items-center gap-8 border-b border-white/10 pb-12 last:border-b-0 md:min-h-[78vh] md:pb-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:pb-16"
              >
                <div className={`relative z-[3] ${index % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="h-[42vh] min-h-[280px] w-full md:h-[50vh] lg:h-[58vh]">
                    <TeamModelCard modelPath={member.modelPath} />
                  </div>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : "lg:order-2"}>
                  <p className="text-sm uppercase tracking-[0.23em] text-white/45">{member.role}</p>
                  <h3 className="mt-2 text-3xl font-serif text-white md:text-4xl">{member.name}</h3>
                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/72 md:text-base">
                    {member.text}
                  </p>
                  <p className="mt-7 text-[11px] uppercase tracking-[0.22em] text-white/42 md:text-xs">
                    {t("team.dragHint")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
}

