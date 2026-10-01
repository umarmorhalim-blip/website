"use client";
import { useEffect } from "react";
import { usePlatform } from "@/lib/device";
import { LAST_CHAPTER, useChapter, useJourneyMode } from "@/lib/journey";
import { PLAY_URL, PWA_URL } from "@/lib/site";
import { onStoreClick, storesFor } from "./StoreButtons";

/**
 * Mobile-only sticky bar, shown once the visitor passes the intro (brief §8).
 * Hidden while the final chapter card is on screen, since that card carries the
 * same buttons in the same spot.
 */
export function StickyCta() {
  const chapter = useChapter();
  const mode = useJourneyMode();
  const platform = usePlatform();
  const visible = chapter >= 1 && !(mode === "cinematic" && chapter === LAST_CHAPTER);
  const [primary, secondary] = storesFor(platform);
  // The iPhone variant carries an extra line of instructions; keep cards clear of it.
  useEffect(() => {
    if (platform === "ios") document.documentElement.style.setProperty("--sticky-h", "6.25rem");
  }, [platform]);
  const label = (s: string) => (s === "play" ? "Google Play" : "Open in Browser");

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="flex items-center gap-2">
        <a
          href={primary === "play" ? PLAY_URL : PWA_URL}
          rel="noopener"
          onClick={() => onStoreClick(primary, platform, "sticky")}
          className="flex-1 rounded-xl bg-purple-deep px-4 py-3 text-center font-semibold text-white"
        >
          {label(primary)}
        </a>
        {secondary && (
          <a
            href={secondary === "play" ? PLAY_URL : PWA_URL}
            rel="noopener"
            onClick={() => onStoreClick(secondary, platform, "sticky")}
            className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-text"
          >
            {label(secondary)}
          </a>
        )}
      </div>
      {platform === "ios" && (
        <p className="mt-2 text-center text-xs text-muted">Open in Safari, tap Share → Add to Home Screen</p>
      )}
    </div>
  );
}
