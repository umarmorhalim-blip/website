"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/content/chapters";
import { detectTier, hasWebGL, type Tier } from "@/lib/device";
import {
  journey,
  LAST_CHAPTER,
  setChapter,
  setJourneyMode,
  VALIDATOR_COUNT,
  votesAt,
  type JourneyMode,
} from "@/lib/journey";
import { smoothstep } from "@/lib/math";
import { ChapterCard } from "./ChapterCard";
import { ErrorBoundary } from "./ErrorBoundary";

// three.js and friends live in their own chunk, fetched after first paint.
const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

/**
 * Master timeline shape (brief §4). Each chapter's scroll distance is one unit:
 * the first and last 22% hold still so the card can be read, the middle 56%
 * moves the story on. Chapter c rests at timeline time c.
 */
const HOLD = 0.22;
const MOVE = 1 - 2 * HOLD;

export function Journey() {
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<{ labelToScroll(label: string): number } | null>(null);
  const [mode, setMode] = useState<JourneyMode | null>(null);
  const [tier, setTier] = useState<Tier>("high");
  const [loadScene, setLoadScene] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  // The inline <head> script has already chosen a mode before first paint.
  useEffect(() => {
    const m = document.documentElement.dataset.journey === "cinematic" ? "cinematic" : "flow";
    setJourneyMode(m);
    setMode(m);
    setTier(detectTier());
    setChapter(0);
  }, []);

  const fallBackToFlow = useCallback(() => {
    setLoadScene(false);
    setJourneyMode("flow");
    setMode("flow");
  }, []);

  // ---- Cinematic: scrubbed master timeline ---------------------------------
  useEffect(() => {
    if (mode !== "cinematic") return;
    const track = trackRef.current!;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".chapter"));
    const votesEl = track.querySelector<HTMLElement>("[data-votes]");
    const dots = Array.from(track.querySelectorAll<HTMLElement>("[data-dot]"));
    let killed = false;
    let cleanup = () => {};

    const render = () => {
      const p = journey.p;
      cards.forEach((el, c) => {
        const d = Math.abs(p - c);
        const o = 1 - smoothstep(0.1, 0.3, d);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.style.translate = `0 ${((c - p) * 48).toFixed(1)}px`;
      });
      if (votesEl) {
        const v = String(votesAt(p));
        if (votesEl.textContent !== v) votesEl.textContent = v;
      }
      const current = Math.round(p);
      dots.forEach((d, i) => d.toggleAttribute("data-active", i === current));
      setChapter(p);
    };

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: render,
          scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.7 },
        });
        tl.to(journey, { p: 0, duration: HOLD });
        for (let c = 1; c <= LAST_CHAPTER; c++) {
          tl.to(journey, { p: c, duration: MOVE, ease: "power1.inOut" });
          tl.to(journey, { p: c, duration: c === LAST_CHAPTER ? HOLD : 2 * HOLD });
        }
        // Chapter c rests at time c; the dots scroll to these labels.
        for (let c = 0; c <= LAST_CHAPTER; c++) tl.addLabel(`ch${c}`, c);
        scrollTriggerRef.current = tl.scrollTrigger ?? null;
      }, track);
      render();
      cleanup = () => {
        ctx.revert();
        scrollTriggerRef.current = null;
      };
    })();

    return () => {
      killed = true;
      cleanup();
      journey.p = 0;
      if (votesEl) votesEl.textContent = String(VALIDATOR_COUNT);
      cards.forEach((el) => {
        el.style.opacity = "";
        el.style.visibility = "";
        el.style.translate = "";
      });
    };
  }, [mode]);

  // ---- Cinematic: lazy-load the 3D scene after first paint -----------------
  useEffect(() => {
    if (mode !== "cinematic") return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      if (!hasWebGL()) return fallBackToFlow();
      setLoadScene(true);
    };
    const idle = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(go, { timeout: 2500 });
      else setTimeout(go, 1200);
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    // Start sooner if the visitor begins scrolling before the page is idle.
    window.addEventListener("scroll", go, { once: true, passive: true });
    return () => {
      done = true;
      window.removeEventListener("load", idle);
      window.removeEventListener("scroll", go);
    };
  }, [mode, fallBackToFlow]);

  // ---- Pause rendering while the journey is off-screen ---------------------
  useEffect(() => {
    if (mode !== "cinematic") return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(trackRef.current!);
    return () => io.disconnect();
  }, [mode]);

  // ---- Flow (reduced motion / no WebGL): simple fades + chapter tracking ---
  useEffect(() => {
    if (mode !== "flow") return;
    const track = trackRef.current!;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".chapter"));
    track.setAttribute("data-fade", "");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          setChapter(Number((e.target as HTMLElement).dataset.chapter));
        }
      },
      { threshold: 0.35 },
    );
    cards.forEach((c) => io.observe(c));
    return () => {
      io.disconnect();
      track.removeAttribute("data-fade");
    };
  }, [mode]);

  const goTo = (c: number) => {
    const st = scrollTriggerRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (st) window.scrollTo({ top: st.labelToScroll(`ch${c}`), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section ref={trackRef} id="journey" className="journey relative" aria-label="Journey of a transfer">
      <div className="journey-stage">
        <div className="journey-poster poster-glow" aria-hidden="true" />
        <div ref={canvasRef} className="journey-canvas" data-ready={ready ? "" : undefined} aria-hidden="true">
          {loadScene && (
            <ErrorBoundary fallback={null} onError={fallBackToFlow}>
              <Scene tier={tier} active={active} onReady={() => setReady(true)} />
            </ErrorBoundary>
          )}
        </div>

        <ol className="journey-chapters pt-20 md:pt-0">
          {CHAPTERS.map((ch) => (
            <ChapterCard key={ch.id} chapter={ch} />
          ))}
        </ol>

        <ChapterDots onSelect={goTo} />
      </div>
    </section>
  );
}

function ChapterDots({ onSelect }: { onSelect: (c: number) => void }) {
  return (
    <nav
      aria-label="Chapters"
      className="journey-dots absolute top-1/2 right-4 z-10 -translate-y-1/2 flex-col gap-3 md:right-8"
    >
      {CHAPTERS.map((ch) => (
        <button
          key={ch.id}
          type="button"
          onClick={() => onSelect(ch.index)}
          className="group flex items-center justify-end gap-3"
          aria-label={`Go to: ${ch.title}`}
        >
          <span className="text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {ch.title}
          </span>
          <ChapterDot index={ch.index} />
        </button>
      ))}
    </nav>
  );
}

function ChapterDot({ index }: { index: number }) {
  return <span data-dot={index} className="block h-2.5 w-2.5 rounded-full border border-purple-light/70 transition-colors data-[active]:border-gold data-[active]:bg-gold" />;
}
