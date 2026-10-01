/**
 * Thin analytics wrapper. Sends to whatever is present on the page: GA4 (gtag),
 * Plausible, and always the GTM-style dataLayer (so Meta/TikTok pixels can be
 * wired in a tag manager without code changes).
 *
 * Events (brief §9):
 *   chapter_reached { chapter: 0..6 }
 *   store_click     { store: "play" | "pwa", device, placement, chapter }
 *   sticky_click    { store, device }
 *   time_on_page    { seconds, max_chapter }
 */
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Params }) => void;
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    (window.dataLayer ??= []).push({ event, ...params });
    window.gtag?.("event", event, { ...params, transport_type: "beacon" });
    window.plausible?.(event, { props: params });
    if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
  } catch {
    /* analytics must never break the page */
  }
}
