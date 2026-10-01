# SafeFi+ — Journey of a Transfer

Scroll-driven 3D landing page for SafeFi+ (Next.js App Router, TypeScript, Tailwind v4,
React Three Fiber + drei, GSAP ScrollTrigger, @react-three/postprocessing). Built to the
"Journey of a Transfer" technical brief.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out (deploy to Vercel / Netlify / any CDN)
```

Optional env vars: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`,
`NEXT_PUBLIC_PLAY_PACKAGE_ID`, `NEXT_PUBLIC_COMPANY_REG_NO`.

## How it works

- **One number drives the story.** `journey.p` (`lib/journey.ts`) runs from 0 (intro) to 6
  (settled). A scrubbed GSAP master timeline (`components/Journey.tsx`) writes it; the 3D scene
  and the HTML cards only read it. Every scene state is a pure function of `p`, so scrolling up
  plays the story in reverse for free.
- **Reading pauses.** Each chapter's scroll distance holds still for its first and last 22%
  (`HOLD` in `Journey.tsx`) and moves for the middle 56%. Tune `HOLD` and `--chapter-scroll`
  (`app/globals.css`) after user testing.
- **Pinning** uses `position: sticky` on the stage inside a tall track, with ScrollTrigger
  scrubbing the timeline over the track. This pins exactly like `pin: true` but needs no
  pin-spacer, so the layout is final at first paint (no CLS) and there is no iOS pin jitter.
- **Copy is real HTML** (`content/chapters.ts` → `components/ChapterCard.tsx`). The intro
  headline is the `<h1>` and the LCP element; it renders before any JavaScript.
- **Lazy 3D.** `components/three/*` is a separate ~290 KB gz chunk loaded on idle after
  `load` (or on first scroll). Until then a CSS glow poster sits behind the cards.

## Modes

The inline script in `app/layout.tsx` picks a layout before first paint:

| Mode | When | What |
|---|---|---|
| cinematic | motion allowed + WebGL | Pinned canvas, overlay cards, chapter dots |
| flow | `prefers-reduced-motion`, no WebGL, WebGL init failure, or no JS | Readable story, one static SVG per chapter, simple fades |

Within cinematic, the **low-end tier** (≤ 4 cores, ≤ 2 GB memory, Save-Data or 2G/3G, or a failed
frame-rate check via drei `PerformanceMonitor`) drops bloom/vignette, caps DPR at 1 and cuts
particles. Rendering stops when the journey is off-screen.

QA overrides: `?mode=flow`, `?mode=nowebgl`, `?mode=cinematic`, `?quality=low`, `?quality=high`.

## Dropping in GLB models

Every object renders placeholder primitives through `<ModelSlot>`. Set a path in
`components/three/models/registry.ts` (e.g. `phone: "/models/phone.glb"`) and put the
Draco-compressed file in `public/models/`. Conventions (origin, axes, scale, named meshes
`Screen` / `CardFace` that receive live canvas textures) are documented in that file. Animation
stays in code, so block slabs are a separate `slab` model positioned by `Block.tsx`.

## Funnel and analytics

- Store buttons: nav, final chapter card, final CTA section and the mobile sticky bar (shown
  after the intro, hidden while the chapter-6 card's own buttons are on screen).
- Android: Google Play first. Desktop: PWA first, then Play. iPhone: PWA only (no App Store
  listing) with "Open in Safari, tap Share → Add to Home Screen".
- Referral `SAFEFIWEB` is passed as `?ref=` on the PWA link and inside the Play `referrer`.
- Events (`lib/analytics.ts`, sent to GA4 / Plausible / `dataLayer`): `chapter_reached`,
  `store_click` (store, device, placement, chapter), `sticky_click`, `time_on_page`.

## Content requiring sign-off (brief §10)

Search the code for `SIGN-OFF`. Open items:

- Sample figures RM 1,000 → 242.72 USDT at RM 4.12 (labelled "Example").
- Validator count (8) is visual only; copy describes validation generally.
- Settlement claim "typically within 5–15 minutes".
- Shariah reviewer: copy says "an independent Shariah adviser" until the entity name and
  written permission are confirmed.
- Company registration number and risk/regulatory wording in the footer.
- Play package id (`com.safefiplus.app` placeholder) and the official Google Play badge artwork.
- `app/opengraph-image.tsx` is a generated placeholder card; replace with a designed render.
