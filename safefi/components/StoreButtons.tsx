"use client";
import { track } from "@/lib/analytics";
import { usePlatform, type Platform } from "@/lib/device";
import { getMaxChapter } from "@/lib/journey";
import { PLAY_URL, PWA_URL } from "@/lib/site";

type Store = "play" | "pwa";
export type Placement = "nav" | "chapter" | "final" | "sticky";

/**
 * Store order follows the device (brief §8): Android sees Google Play first;
 * iPhone and desktop see the PWA first. There is no iOS App Store listing, so
 * iPhone visitors only get the PWA plus Add to Home Screen instructions.
 * During SSR the platform is unknown and Play leads (most traffic is Android).
 */
export function storesFor(platform: Platform | null): Store[] {
  if (platform === "ios") return ["pwa"];
  if (platform === "desktop") return ["pwa", "play"];
  return ["play", "pwa"];
}

export function onStoreClick(store: Store, platform: Platform | null, placement: Placement) {
  const device = platform ?? "unknown";
  track("store_click", { store, device, placement, chapter: getMaxChapter() });
  if (placement === "sticky") track("sticky_click", { store, device });
}

export function StoreButtons({
  placement,
  compact = false,
  showHint = true,
  className = "",
}: {
  placement: Placement;
  compact?: boolean;
  showHint?: boolean;
  className?: string;
}) {
  const platform = usePlatform();
  const stores = storesFor(platform);
  return (
    <div className={className}>
      <div className={`flex flex-wrap gap-2.5 ${compact ? "" : "sm:gap-3"}`}>
        {stores.map((store, i) => (
          <StoreButton
            key={store}
            store={store}
            primary={i === 0}
            compact={compact}
            onClick={() => onStoreClick(store, platform, placement)}
          />
        ))}
      </div>
      {showHint && platform === "ios" && (
        <p className="mt-3 text-sm text-muted">
          Open in Safari, tap <strong className="text-text">Share</strong> →{" "}
          <strong className="text-text">Add to Home Screen</strong>.
        </p>
      )}
      {showHint && platform === "desktop" && (
        <p className="mt-3 text-sm text-muted">
          The web app runs in any modern browser. Use your browser&apos;s install icon to keep it on your desktop.
        </p>
      )}
    </div>
  );
}

function StoreButton({
  store,
  primary,
  compact,
  onClick,
}: {
  store: Store;
  primary: boolean;
  compact: boolean;
  onClick: () => void;
}) {
  const play = store === "play";
  const base =
    "group inline-flex items-center gap-2.5 rounded-xl font-semibold transition-colors focus-visible:outline-2 " +
    (compact ? "px-3.5 py-2 text-sm" : "px-4 py-2.5");
  const look = primary
    ? "bg-purple-deep text-white hover:bg-purple border border-purple/60"
    : "bg-white/5 text-text hover:bg-white/10 border border-white/15";
  return (
    <a
      href={play ? PLAY_URL : PWA_URL}
      rel="noopener"
      className={`${base} ${look}`}
      onClick={onClick}
      data-store={store}
    >
      {play ? <PlayIcon /> : <BrowserIcon />}
      <span className="flex flex-col leading-tight text-left">
        {!compact && (
          <span className="text-[0.68rem] font-medium uppercase tracking-wider opacity-80">
            {play ? "Get it on" : "Open in"}
          </span>
        )}
        <span>{play ? "Google Play" : "Browser"}</span>
      </span>
    </a>
  );
}

// Generic glyphs. Swap for the official Google Play badge artwork before launch.
function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none">
      <path d="M5 3.5v17l14-8.5L5 3.5Z" fill="currentColor" opacity=".9" />
    </svg>
  );
}
function BrowserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}
