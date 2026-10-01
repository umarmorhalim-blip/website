import * as THREE from "three";

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/**
 * Canvas-backed texture for screens, cards and labels. Copy changes are a
 * redraw, not a model re-export (brief §5). Swap for an image texture or an
 * HTML-rendered texture without touching the meshes.
 */
export function canvasTexture(w: number, h: number, draw: Draw) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  redraw(tex, draw);
  return tex;
}

export function redraw(tex: THREE.CanvasTexture, draw: Draw) {
  const canvas = tex.image as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  tex.needsUpdate = true;
}

let family = "";
/** The page font (set by next/font), so 3D labels match the HTML. */
export function font(weight: number, px: number) {
  if (!family) family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  return `${weight} ${px}px ${family}`;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Pill label, e.g. "eKYC ✓". Returns texture + aspect for sizing a sprite. */
export function pillTexture(text: string, color: string, bg: string) {
  const w = 512;
  const h = 128;
  const tex = canvasTexture(w, h, (ctx) => {
    roundRect(ctx, 4, 4, w - 8, h - 8, (h - 8) / 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = font(700, 58);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 3);
  });
  return { tex, aspect: w / h };
}

/** Soft round dot for point sprites. */
export function dotTexture() {
  return canvasTexture(64, 64, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
}
