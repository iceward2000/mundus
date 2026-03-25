# Mundus Codebase Analysis

Single-page website for Mundus premium beverage consultancy. This document covers architecture, security gaps, and recommendations around the age verification overlay and content loading strategy.

---

## 1. Architecture Overview

### Current Flow

```
Layout (app/layout.tsx)
├── AssetPreloader     → Preloads images/audio for desktop; dispatches mundus-load-progress
├── AgeVerificationOverlay → Gate: sessionStorage + overlay UX
├── SmoothScroll
│   ├── GrainOverlay
│   └── {children}     → Full page content (Hero, Hikaye, Matematik, etc.) loads immediately
```

**Important:** All page content (`{children}`) is rendered and downloaded **before** age verification. The overlay is a visual gate only—HTML, JS, and assets (videos, images, etc.) are already loaded. Content is visible in the DOM and network tab.

### Data-Heavy Sections

| Section          | Assets / Load                                    |
|------------------|--------------------------------------------------|
| RakiFrames       | 160 PNG frames (rakı frame/)                     |
| SparklingFrames  | 145 PNG frames (sparkling frame 3/)              |
| AssetPreloader   | ~150 cocktail images + 1 logo + 1 audio         |
| Hero / Videos    | Multiple MP4s (entrance, exit, cocktail)         |
| CocktailReveal   | Scroll-driven image gallery                     |

---

## 2. Security Gaps

### 2.1 Age Verification (High – Easily Bypassed)

**Location:** `AgeVerificationOverlay.tsx`, `sessionStorage.getItem("mundus-age-verified")`

**Issue:** Verification state is stored only in `sessionStorage`. Any user can bypass it:

```javascript
// In DevTools Console before/during page load:
sessionStorage.setItem("mundus-age-verified", "true");
// Then refresh
```

**Impact:** This is a common limitation for client-side age gates. They provide a compliance/UX layer, not strong enforcement. For alcohol-related sites, some jurisdictions expect best-effort checks; a client-side gate is typically acceptable for marketing sites.

**Recommendation:** Document this as an intentional design choice. If stronger compliance is required, consider server-side or third-party verification (e.g. ID verification).

---

### 2.2 Contact Form / API (Medium – XSS, Spam, Validation)

**Location:** `src/app/api/contact/route.ts`, `Contact.tsx`

**Issues:**

1. **HTML injection / XSS** – User input is interpolated directly into HTML:

   ```ts
   <p><strong>Ad:</strong> ${firstName}</p>
   <p><strong>Mesaj:</strong></p>
   <p>${message}</p>
   ```

   If Resend or any viewer renders HTML, malicious scripts could run. Example:

   ```
   message: "<script>...</script>"
   ```

2. **No rate limiting** – Endpoint can be spammed; no throttling or CAPTCHA.

3. **Weak validation** – No format checks for:
   - Email
   - Phone
   - Message length
   - Company/message content (e.g. script tags, HTML)

**Recommendations:**

- Sanitize/escape all user input before including in HTML (or use a templating/sanitization library).
- Add rate limiting (e.g. per IP or per session) or use a service with built-in protection.
- Validate email format, optional phone format, and max lengths before sending.

---

### 2.3 Security Headers (Low)

**Location:** `next.config.js`

**Issue:** No explicit security headers (CSP, X-Frame-Options, Referrer-Policy, etc.).

**Recommendation:** Add headers in `next.config.js`:

```js
headers: async () => [{
  source: "/:path*",
  headers: [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  ],
}],
```

---

### 2.4 Environment Variables (Good)

- `RESEND_API_KEY` is read from `process.env` on the server.
- Ensure `.env*` files are in `.gitignore` and never committed.

---

## 3. Content Loading Strategy

### Current Behavior

1. Layout renders `AssetPreloader`, `AgeVerificationOverlay`, and full `{children}`.
2. AssetPreloader runs on desktop and emits `mundus-load-progress`.
3. Age overlay blocks interaction and shows until the user clicks "Evet" or "Hayır".
4. "Evet" is disabled until `loadProgress >= 100` (desktop) or immediately (mobile).
5. On "Evet", `sessionStorage` is set and `mundus-entered` is dispatched.

### If You Want True Content Gating

To load page content **only after** age verification:

1. **Conditional children:**

   ```tsx
   // In layout or a wrapper component
   {verified ? <MainContent /> : null}
   ```

2. **Move the gate state up** – Use context or a wrapper that checks `sessionStorage` + `mundus-entered` before rendering `{children}`.

3. **Asset loading** – Keep `AssetPreloader` for verified users or delay it until after verification to avoid loading heavy assets for unverified visitors.

---

## 4. Recommendations Summary

| Priority | Item                              | Action                                           |
|----------|-----------------------------------|--------------------------------------------------|
| High     | Contact API XSS risk             | Sanitize/escape all user input before HTML use  |
| Medium   | Contact rate limiting            | Add rate limit (IP/session) or CAPTCHA          |
| Medium   | Contact validation               | Email/phone format, max lengths, content checks |
| Low      | Security headers                 | Add X-Frame-Options, X-Content-Type-Options, etc.|
| Doc      | Age gate limitations             | Document client-side nature and trade-offs      |
| Optional | Content gating                   | Consider conditional rendering of main content  |

---

## 5. File Inventory (Key Components)

| File                     | Purpose                                      |
|--------------------------|----------------------------------------------|
| `AgeVerificationOverlay` | Age gate, sessionStorage, mundus-entered     |
| `AssetPreloader`         | Preloads images/audio, mundus-load-progress   |
| `SketchReveal`           | Canvas sketch, reacts to mundus-entered      |
| `Navigation`             | Sidebar nav, audio, mundus-entered           |
| `Contact`                | Multi-step form → POST /api/contact           |
| `RakiFrames`             | 160-frame scroll animation                   |
| `SparklingFrames`        | 145-frame scroll animation                   |
| `layout.tsx`             | Root layout, providers, overlay               |
