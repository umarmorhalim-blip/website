"use client";
import { useSyncExternalStore } from "react";

export type Platform = "android" | "ios" | "desktop";
export type Tier = "high" | "low";

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  // iPadOS reports itself as a Mac; touch points give it away.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return "desktop";
}

const noop = () => () => {};
/** Platform on the client, `null` during SSR and hydration (so markup matches). */
export function usePlatform(): Platform | null {
  return useSyncExternalStore(noop, detectPlatform, () => null);
}

function param(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Low-end heuristic (brief §6). The runtime frame-rate check lives in the scene
 * (drei PerformanceMonitor) and can demote a "high" device to "low" later.
 * Override for QA with ?quality=low|high.
 */
export function detectTier(): Tier {
  const q = param("quality");
  if (q === "low" || q === "high") return q;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const conn = nav.connection;
  if (cores <= 4 || memory <= 2) return "low";
  if (conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? "")) return "low";
  return "high";
}

export function hasWebGL(): boolean {
  if (param("mode") === "nowebgl") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}
