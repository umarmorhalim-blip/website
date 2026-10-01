"use client";
import Script from "next/script";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { getMaxChapter } from "@/lib/journey";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/**
 * Loads GA4 and/or Plausible only when configured, after the page is
 * interactive, and reports visible time on page when the visitor leaves.
 */
export function Analytics() {
  useEffect(() => {
    // Visible time only; re-reported (cumulatively) each time the page is hidden.
    let visibleSince = document.visibilityState === "visible" ? performance.now() : 0;
    let total = 0;
    let lastSent = -1;
    const report = () => {
      if (visibleSince) total += performance.now() - visibleSince;
      visibleSince = 0;
      const seconds = Math.round(total / 1000);
      if (seconds === lastSent) return;
      lastSent = seconds;
      track("time_on_page", { seconds, max_chapter: getMaxChapter() });
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") visibleSince = performance.now();
      else report();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", report);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", report);
    };
  }, []);

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {PLAUSIBLE_DOMAIN && (
        <Script src="https://plausible.io/js/script.js" data-domain={PLAUSIBLE_DOMAIN} strategy="afterInteractive" />
      )}
    </>
  );
}
