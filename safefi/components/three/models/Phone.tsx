"use client";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";
import { journey } from "@/lib/journey";
import { range } from "@/lib/math";
import { PHONE } from "../layout";
import { canvasTexture, font, redraw, roundRect } from "../textures";

/** Soft pill-shaped glow for the Confirm button. */
function pillGlow() {
  return canvasTexture(256, 96, (ctx, w, h) => {
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "#fff";
    roundRect(ctx, 26, 24, w - 52, h - 48, (h - 48) / 2);
    ctx.fill();
  });
}
import { MATERIAL_SLOTS, MODELS } from "./registry";
import { ModelSlot } from "./ModelSlot";

type ScreenState = "idle" | "confirming" | "sent";
const W = 1.15;
const H = 2.3;
const SCREEN_W = 1.03;
const SCREEN_H = 2.16;

/** The SafeFi+ buy flow, drawn to a canvas so copy can change without a model export. */
function drawScreen(state: ScreenState) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#1B1036");
    g.addColorStop(1, "#0C0818");
    ctx.fillStyle = g;
    roundRect(ctx, 0, 0, w, h, 48);
    ctx.fill();

    ctx.fillStyle = BRAND.ink;
    ctx.font = font(800, 40);
    ctx.fillText("SafeFi", 44, 120);
    ctx.fillStyle = BRAND.gold;
    ctx.fillText("+", 44 + ctx.measureText("SafeFi").width, 120);

    ctx.fillStyle = BRAND.muted;
    ctx.font = font(600, 30);
    ctx.fillText("Buy USDT", 44, 200);

    const field = (y: number, label: string, value: string, color: string) => {
      roundRect(ctx, 36, y, w - 72, 150, 24);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.fillStyle = BRAND.muted;
      ctx.font = font(500, 26);
      ctx.fillText(label, 64, y + 52);
      ctx.fillStyle = color;
      ctx.font = font(800, 50);
      ctx.fillText(value, 64, y + 116);
    };
    field(240, "You pay", "RM 1,000.00", BRAND.ink);
    field(410, "You receive", "242.72 USDT", BRAND.gold);

    ctx.fillStyle = BRAND.muted;
    ctx.font = font(500, 26);
    ctx.fillText("Rate  RM 4.12 / USDT", 44, 620);
    ctx.fillText("Example only", 44, 662);

    // Confirm button (its glow is a separate mesh so it can bloom).
    const by = h - 260;
    roundRect(ctx, 36, by, w - 72, 120, 60);
    ctx.fillStyle = state === "sent" ? "#14532D" : BRAND.purpleDeep;
    ctx.fill();
    ctx.fillStyle = state === "sent" ? BRAND.green : "#FFFFFF";
    ctx.font = font(800, 42);
    ctx.textAlign = "center";
    ctx.fillText(state === "idle" ? "Confirm" : state === "confirming" ? "Confirming…" : "Sent ✓", w / 2, by + 76);
    ctx.textAlign = "left";
  };
}

export function Phone() {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const stateRef = useRef<ScreenState>("idle");
  const texture = useMemo(() => canvasTexture(512, 1072, drawScreen("idle")), []);
  const screenMaterial = useMemo(() => new THREE.MeshBasicMaterial({ map: texture }), [texture]);
  const glowMap = useMemo(pillGlow, []);
  useEffect(() => () => glowMap.dispose(), [glowMap]);
  const materials = useMemo(() => ({ [MATERIAL_SLOTS.phoneScreen]: screenMaterial }), [screenMaterial]);
  useEffect(() => () => (texture.dispose(), screenMaterial.dispose()), [texture, screenMaterial]);

  useFrame((s) => {
    const p = journey.p;
    const next: ScreenState = p < 0.4 ? "idle" : p < 1.3 ? "confirming" : "sent";
    if (next !== stateRef.current) {
      stateRef.current = next;
      redraw(texture, drawScreen(next));
    }
    const t = s.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = -0.18 + Math.sin(t * 0.5) * 0.08;
      group.current.position.y = PHONE[1] + Math.sin(t * 0.8) * 0.05;
    }
    if (glow.current) {
      const press = range(p, 0.35, 0.5) * (1 - range(p, 1.2, 1.5));
      (glow.current.material as THREE.MeshBasicMaterial).opacity = press * (0.35 + Math.sin(t * 6) * 0.12);
    }
  });

  return (
    <group ref={group} position={PHONE}>
      <ModelSlot url={MODELS.phone} materials={materials}>
        <RoundedBox args={[W, H, 0.14]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#1A1530" metalness={0.7} roughness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0, 0.071]} material={screenMaterial}>
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        </mesh>
        <mesh position={[0, H / 2 - 0.12, 0.074]}>
          <planeGeometry args={[0.3, 0.06]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </ModelSlot>
      {/* Confirm button glow, aligned with the button drawn on the screen texture. */}
      <mesh ref={glow} position={[0, -0.66, 0.075]}>
        <planeGeometry args={[1.08, 0.4]} />
        <meshBasicMaterial map={glowMap} color={new THREE.Color(BRAND.purple).multiplyScalar(2)} toneMapped={false} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight position={[0, 0, 1.4]} color={BRAND.purple} intensity={4} distance={5} />
    </group>
  );
}
