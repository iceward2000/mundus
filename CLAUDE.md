# CLAUDE.md — Mundus Consultancy Website

## Project Overview

**Mundus** is a premium Turkish beverage consultancy website (İçecek Danışmanlığı). It is a single-page marketing site with heavy animation, a 3D globe, interactive cocktail reveal, and a contact form. The site is primarily in **Turkish**.

Live contact email: `hey@mundus.com.tr`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + custom CSS variables |
| Animation | GSAP 3 (ScrollTrigger, ScrollToPlugin) |
| Smooth Scroll | Lenis 1 (desktop only, `pointer: fine` devices) |
| 3D Globe | react-globe.gl + Three.js |
| Email | Resend |
| Icons | lucide-react |
| Utilities | clsx, tailwind-merge |

---

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Required Environment Variables

```
RESEND_API_KEY=   # Resend API key for contact form emails
```

---

## Project Structure

```
mundus/
├── src/
│   ├── app/
│   │   ├── api/contact/route.ts   # POST endpoint — sends email via Resend
│   │   ├── globals.css            # Global styles, CSS variables, keyframe animations
│   │   ├── layout.tsx             # Root layout: fonts, Google Analytics, global providers
│   │   ├── page.tsx               # Single page: composes all section components
│   │   ├── error.tsx              # Error boundary
│   │   └── global-error.tsx       # Global error boundary
│   ├── components/
│   │   ├── sections/              # One file per page section (see Section Order)
│   │   ├── AgeVerificationOverlay.tsx
│   │   ├── AssetPreloader.tsx
│   │   ├── CocktailReveal.tsx
│   │   ├── GlobeViz.tsx
│   │   ├── GrainOverlay.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── Navigation.tsx
│   │   ├── SectionWrapper.tsx
│   │   ├── SketchReveal.tsx
│   │   └── SmoothScroll.tsx
│   ├── hooks/
│   │   ├── useIsMobile.ts          # Detects touch/small-screen devices
│   │   └── usePrefersReducedMotion.ts
│   └── lib/
│       ├── cheersData.ts           # Country → "Cheers" phrase map for GlobeViz
│       └── constants.ts            # SECTIONS array (navigation config)
├── guide/                          # Design/content notes from the product owner
│   ├── section-order.txt           # Planned section sequence
│   ├── form.txt                    # Contact form field spec
│   ├── hikaye.txt / hayal.txt / matematik.txt / muvaffakiyet.txt / cheers.txt
├── public/
│   ├── mundus-text-logo.svg
│   ├── cocktail-images/            # 7.png – 150.png (144 images)
│   ├── hikaye-images/              # 13.png, 14.png
│   └── audio/loop.mp3              # Background music
├── next.config.js                  # Transpiles three.js packages for ESM/CJS compat
├── tailwind.config.ts
└── tsconfig.json
```

---

## Section Order

Defined in `src/lib/constants.ts` and rendered in `src/app/page.tsx`:

| # | Component | Section ID | Label |
|---|---|---|---|
| — | `Hero` | `hero` | Giriş |
| 01 | `Hikaye` | `hikaye` | Gerçeklik |
| 02 | `Matematik` | `matematik` | Uzmanlık |
| 03 | `Differentiators` | `differentiators` | Neden Biz |
| 04 | `Process` | `process` | Süreç |
| 05 | `Proof` | `proof` | Etki |
| — | `GlobeSection` | `global-presence` | Globe |
| — | `Hayal` | hayal | Hayal |
| — | `CocktailDemo` | `cocktail-demo` | Kokteyl |
| — | `Muvaffakiyet` | muvaffakiyet | Muvaffakiyet |
| 06 | `Contact` | `contact` | İletişim |

> **Adding a new section**: create the component in `src/components/sections/`, add an entry to `SECTIONS` in `src/lib/constants.ts`, and import/render it in `src/app/page.tsx` in the correct position.

---

## Key Components

### `AssetPreloader` (`src/components/AssetPreloader.tsx`)
- Desktop-only loading screen (hidden on mobile/touch devices).
- Preloads 144 cocktail images + 2 hikaye images + `loop.mp3`.
- Minimum display time: 1800 ms.
- Four phases: `load → hold → morph → done`.
- On `done`, morphs into a music player button (top-right corner) using GSAP.
- Dispatches `mundus-preload-complete` window event when finished.

### `AgeVerificationOverlay` (`src/components/AgeVerificationOverlay.tsx`)
- 18+ age gate shown on first visit.
- Stores consent in `sessionStorage` key `mundus-age-verified = "true"`.
- Animated logo (6 CSS-animated squares, "snake-fly" keyframes in `globals.css`).
- Dispatches `mundus-entered` window event on confirmation.
- If already verified, renders only the static logo in the top-left corner.

### `Navigation` (`src/components/Navigation.tsx`)
- **Desktop**: Starts centered on screen, transitions to a left sidebar as the user scrolls past 100px. Uses GSAP ScrollTrigger for the pin/transition. Accordion toggle shows section list in sidebar mode.
- **Mobile**: Fixed bottom pill with dot indicators.
- Reads `SECTIONS` from `src/lib/constants.ts`.
- Scroll percentage counter shown top-right on desktop.
- `usePrefersReducedMotion` disables smooth scroll-to animations.

### `SmoothScroll` (`src/components/SmoothScroll.tsx`)
- Wraps the app in Lenis for smooth scrolling.
- **Only activates on `pointer: fine` devices (desktop mouse)**. Touch devices use native scroll.
- Synchronizes Lenis scroll events with GSAP `ScrollTrigger`.

### `SketchReveal` (`src/components/SketchReveal.tsx`)
- Fixed canvas overlay (`z-index: 1`, `mix-blend-mode: screen`, `opacity: 0.5`).
- Allows drawing gold brush strokes on the hero section (scroll position < 100px).
- Uses Catmull-Rom spline interpolation + spring physics for stroke width.
- Drawing is enabled only after age verification (`mundus-entered` event or `sessionStorage`).
- Click clears the canvas; double-tap clears on touch.
- Scroll animates canvas scale and hue rotation via GSAP.

### `GlobeViz` (`src/components/GlobeViz.tsx`)
- Uses `react-globe.gl` (dynamically imported, SSR disabled).
- Loads GeoJSON from `vasturiano/react-globe.gl` GitHub CDN.
- Hover tooltip shows country name + local "Cheers" phrase (`src/lib/cheersData.ts`).
- Animated country border paths with gold/neon dashes.
- Manually disposes the WebGL renderer on unmount to avoid context leaks.
- `data-lenis-prevent` attribute stops Lenis from hijacking drag events.

### `CocktailReveal` (`src/components/CocktailReveal.tsx`)
- Desktop: Images (7.png–150.png) spawn at cursor position as the mouse moves; they scale, then fade out.
- Mobile/reduced-motion: Static fallback with tap-to-cycle functionality.
- Toggle button switches between transparent and colored (random) image backgrounds.
- Images are preloaded by `AssetPreloader` — do not add duplicate preloading.

### `SectionWrapper` (`src/components/SectionWrapper.tsx`)
- Standard `<section>` wrapper with consistent padding (`px-4 md:px-12 lg:px-24 py-20`).
- `fullHeight` prop (default `true`) adds `min-h-screen flex flex-col justify-center`.
- All sections must use this component and pass a unique `id`.

### Contact Form (`src/components/sections/Contact.tsx` + `src/app/api/contact/route.ts`)
- Fields: Ad Soyad, Şirket (optional), Telefon, E-posta, Danışmanlık Talebi.
- Floating label inputs with animated text alignment.
- Submit triggers a GSAP paper-plane animation (desktop only).
- API route sends email via Resend from `noreply@mundus.com.tr` to `hey@mundus.com.tr`.
- Required fields: `firstName`, `lastName`, `email`, `message`.

---

## Design System

### Colors (CSS Variables in `globals.css`)
```css
--background: #0a0a0a   /* Near-black page background */
--foreground: #ededed   /* Off-white text */
--primary:    #d4af37   /* Gold — brand accent */
--secondary:  #1a1a1a   /* Dark card/surface */
--accent:     #2a2a2a   /* Slightly lighter surface */
```

### Typography
- **Sans**: Inter (`--font-sans`, `var(--font-sans)`)
- **Serif**: Playfair Display (`--font-serif`, `var(--font-serif)`)
- Tailwind classes: `font-sans`, `font-serif`

### Z-Index Layers
| Layer | z-index | Element |
|---|---|---|
| SketchReveal canvas | 1 | Background drawing |
| Sections | default | Page content |
| Navigation | 50 | Nav sidebar/pill |
| Scroll counter | 50 | Top-right % |
| AgeVerification | 10000 | Age gate |
| AssetPreloader | 10002 | Loading screen |

### Custom Animations (Tailwind + globals.css)
- `animate-pulse-slow` / `animate-pulse-slower` — ambient hero glows
- `animate-float` — floating elements
- `animate-audio-wave` — music player bars
- `animate-scroll-left` — horizontal marquee
- `ConsentLogo` — complex 6-square snake animation for the age-gate logo
- `overlay-content-reveal` — delayed fade-in for age-gate content

---

## Custom Window Events

| Event | Fired by | Consumed by |
|---|---|---|
| `mundus-entered` | `AgeVerificationOverlay` (on confirm) | `SketchReveal` (enables drawing) |
| `mundus-preload-complete` | `AssetPreloader` (on morph done) | (available for future use) |

---

## Accessibility & Motion

- `usePrefersReducedMotion` hook respects `prefers-reduced-motion: reduce`.
- When reduced motion is preferred: GSAP scroll animations are skipped, `CocktailReveal` shows static fallback, navigation uses `scrollIntoView({ behavior: 'auto' })`.
- `focus-visible` ring uses `--primary` color.
- Navigation accordion has `aria-expanded` and `aria-label`.
- Globe hover labels render in HTML strings (not accessible — known limitation).

---

## Mobile Behavior

- Lenis smooth scroll is **disabled** on touch/mobile devices.
- `AssetPreloader` is **hidden** on mobile (skips to `done` phase immediately).
- `SketchReveal` drawing is supported on touch but **only on the hero section** (scrollY < 100).
- `CocktailReveal` uses the `StaticFallback` component on mobile.
- Navigation switches from sidebar to a bottom pill (`useIsMobile` hook).
- Contact form paper-plane animation disabled on mobile (window width ≤ 768).

---

## next.config.js Notes

Three.js and related packages must be transpiled to avoid ESM/CJS conflicts:
```js
transpilePackages: ['three', 'react-globe.gl', 'globe.gl', 'three-globe', 'three-render-objects']
```

Do not remove these entries or the globe will fail to build.

---

## Adding / Modifying Sections

1. Create `src/components/sections/YourSection.tsx` using `SectionWrapper` with a unique `id`.
2. Add the section to `SECTIONS` in `src/lib/constants.ts` (for navigation tracking).
3. Import and place the component in `src/app/page.tsx` in the correct order.
4. If the section needs assets preloaded, add them to the `IMAGE_ASSETS` or `AUDIO_ASSETS` arrays in `AssetPreloader.tsx`.

---

## Guide Files (`/guide/`)

These are product-owner notes describing design intent. Refer to them when:
- Working on section content/copy
- Implementing planned but missing sections (e.g., Partnerships, animated raki section, footer liquid animation)
- Understanding Turkish terminology for section names

The `section-order.txt` file lists the full planned section sequence including sections not yet implemented.

---

## Known Patterns & Conventions

- All interactive components use `"use client"` directive.
- GSAP contexts are always cleaned up with `ctx.revert()` in effect cleanup.
- `useLayoutEffect` is used for GSAP ScrollTrigger setup (runs before paint).
- All GSAP plugins must be registered before use: `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)`.
- The `data-lenis-prevent` attribute on containers prevents Lenis from capturing scroll/drag events (used on `GlobeViz`).
- Avoid using `any` in TypeScript unless interfacing with `react-globe.gl` or Three.js internals where types are unavailable.
- Tailwind class merging: use `clsx` for conditional classes, `tailwind-merge` via `twMerge` for merging with overrides.
