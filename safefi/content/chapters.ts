/**
 * Story copy, one entry per chapter (brief §4). This is the only place copy
 * lives: the same text renders as the cinematic overlay cards, the reduced-
 * motion / no-WebGL story, and what search engines index.
 *
 * Items marked SIGN-OFF are illustrative and need compliance review (brief §10).
 */
export type Chapter = {
  index: number;
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  facts?: { label: string; value: string }[];
  tags?: string[];
  note?: string;
};

export const CHAPTERS: Chapter[] = [
  {
    index: 0,
    id: "intro",
    eyebrow: "SafeFi+ · Journey of a Transfer",
    title: "Where Does Your Money Go?",
    body: "Follow one transfer from the moment you tap Confirm to the moment it lands in your wallet. Scroll to see every step it takes, and every check it passes.",
  },
  {
    index: 1,
    id: "app",
    eyebrow: "Chapter 1 · The app",
    title: "It Starts in the App",
    body: "You choose an amount, see the rate and what you will receive on one screen, and tap Confirm. Your request leaves the phone as a single, signed instruction.",
    // SIGN-OFF: sample amount and rate are illustrative.
    facts: [
      { label: "You pay", value: "RM 1,000.00" },
      { label: "You receive", value: "242.72 USDT" },
      { label: "Rate", value: "RM 4.12 / USDT" },
    ],
    note: "Example figures for illustration only.",
  },
  {
    index: 2,
    id: "verification",
    eyebrow: "Chapter 2 · Verification",
    title: "Verified & Shariah-Compliant",
    // SIGN-OFF: name the Shariah reviewer only once the entity has given written permission.
    body: "Before anything moves, the transfer passes two gates: your identity, confirmed once through eKYC, and the transaction itself, screened against Shariah requirements set with an independent Shariah adviser.",
    tags: ["eKYC verified", "Shariah screened"],
  },
  {
    index: 3,
    id: "block",
    eyebrow: "Chapter 3 · The block",
    title: "Packed Into a Block",
    body: "Your transfer is bundled with others into a block. Each block carries a header, the fingerprint (hash) of the block before it and a timestamp, so nothing inside can be quietly changed later.",
  },
  {
    index: 4,
    id: "validation",
    eyebrow: "Chapter 4 · Validation",
    title: "Validated by the Network",
    // SIGN-OFF: copy describes validation generally; validator count in the visual is illustrative.
    body: "Independent validators across the network check the block. It is only accepted once enough of them agree, so no single party can approve it alone.",
  },
  {
    index: 5,
    id: "chain",
    eyebrow: "Chapter 5 · The chain",
    title: "Locked Into the Chain",
    body: "The accepted block is linked to the one before it. Altering it would mean rewriting every block that follows, which is what makes the record permanent and publicly checkable.",
  },
  {
    index: 6,
    id: "settlement",
    eyebrow: "Chapter 6 · Settlement",
    title: "Settled in Minutes",
    // SIGN-OFF: settlement time must match operational data.
    body: "The USDT arrives in your wallet and the status changes to Settled, typically within 5–15 minutes. Ready to make your first transfer?",
  },
];
