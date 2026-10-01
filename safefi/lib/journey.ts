"use client";
/**
 * Shared journey state. `journey.p` is the single source of truth for the story:
 * a float from 0 (intro) to 6 (settled). Integer values are chapters at rest;
 * fractional values are the transitions between them. GSAP writes it, the 3D
 * scene and the HTML cards only read it, so scrolling backwards is free.
 */
import { useSyncExternalStore } from "react";
import { track } from "./analytics";
import { clamp, easeOut, range } from "./math";

export const LAST_CHAPTER = 6;
export const journey = { p: 0 };

/** Progress (0..1) of the transition that starts at chapter `from`. */
export const seg = (p: number, from: number) => clamp(p - from);

// ---- Story beats shared by the scene and the HTML cards -------------------
export const VALIDATOR_COUNT = 8; // illustrative, see brief §10
export function votesAt(p: number) {
  if (p >= 4) return VALIDATOR_COUNT;
  return Math.min(VALIDATOR_COUNT, Math.floor(range(seg(p, 3), 0.35, 0.95) * VALIDATOR_COUNT + 1e-6));
}
export const SAMPLE_USDT = 242.72; // illustrative, see brief §10
export function settledAmountAt(p: number) {
  return SAMPLE_USDT * easeOut(range(seg(p, 5), 0.6, 0.95));
}
export const isSettled = (p: number) => seg(p, 5) >= 0.6;

// ---- Chapter + mode stores (for React consumers) ---------------------------
export type JourneyMode = "cinematic" | "flow";
let chapter = 0;
let maxReached = -1;
let mode: JourneyMode | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function setChapter(c: number) {
  c = clamp(Math.round(c), 0, LAST_CHAPTER);
  for (let k = maxReached + 1; k <= c; k++) track("chapter_reached", { chapter: k });
  maxReached = Math.max(maxReached, c);
  if (c !== chapter) {
    chapter = c;
    emit();
  }
}
export const getMaxChapter = () => maxReached;

export function setJourneyMode(m: JourneyMode) {
  if (m === mode) return;
  mode = m;
  document.documentElement.dataset.journey = m;
  emit();
}

export const useChapter = () => useSyncExternalStore(subscribe, () => chapter, () => 0);
export const useJourneyMode = () => useSyncExternalStore(subscribe, () => mode, () => null);
