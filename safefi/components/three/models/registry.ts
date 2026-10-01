/**
 * GLB drop-in registry (brief §5).
 *
 * Every object in the scene renders a placeholder primitive until a URL is set
 * here. To swap in an authored model, export it as Draco-compressed GLB, put it
 * in /public/models and set the path, e.g. `phone: "/models/phone.glb"`.
 *
 * Conventions for authored models:
 *  - Origin at the object's centre, +Y up, facing +Z (towards the camera).
 *  - 1 unit ≈ the size of the placeholder (phone ≈ 1.15 × 2.3 units).
 *  - Meshes named in `MATERIAL_SLOTS` get their material replaced at runtime so
 *    live content (the phone screen, the wallet card face) keeps working.
 *  - Animation is driven by code, so each moving part is its own file: the six
 *    block slabs share `slab`, the shell is `blockShell`.
 *  - Keep the combined compressed budget under 1.5 MB.
 */
export const MODELS: Record<
  "phone" | "gate" | "blockShell" | "slab" | "validator" | "chainBlock" | "wallet",
  string | null
> = {
  phone: null,
  gate: null,
  blockShell: null,
  slab: null,
  validator: null,
  chainBlock: null,
  wallet: null,
};

/** Mesh names that receive live, code-driven materials. */
export const MATERIAL_SLOTS = {
  phoneScreen: "Screen",
  walletFace: "CardFace",
} as const;
