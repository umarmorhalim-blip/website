"use client";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";
import { isSettled, journey, seg, settledAmountAt } from "@/lib/journey";
import { range } from "@/lib/math";
import { WALLET } from "../layout";
import { canvasTexture, dotTexture, font, redraw, roundRect } from "../textures";
import { MATERIAL_SLOTS, MODELS } from "./registry";
import { ModelSlot } from "./ModelSlot";

const W = 2.4;
const H = 1.5;

function drawFace(amount: string, settled: boolean, arriving: boolean) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#2A1458");
    g.addColorStop(1, "#0E0A1E");
    roundRect(ctx, 0, 0, w, h, 40);
    ctx.fillStyle = g;
    ctx.fill();

    // SafeFi+ mark
    roundRect(ctx, 44, 40, 64, 64, 18);
    ctx.fillStyle = BRAND.purpleDeep;
    ctx.fill();
    ctx.strokeStyle = BRAND.gold;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(76, 56);
    ctx.lineTo(76, 88);
    ctx.moveTo(60, 72);
    ctx.lineTo(92, 72);
    ctx.stroke();

    ctx.fillStyle = BRAND.ink;
    ctx.font = font(700, 34);
    ctx.fillText("SafeFi+ Wallet", 128, 84);

    ctx.fillStyle = BRAND.muted;
    ctx.font = font(500, 28);
    ctx.fillText("USDT received", 44, 200);
    ctx.fillStyle = settled ? BRAND.ink : "rgba(245,243,255,0.6)";
    ctx.font = font(800, 84);
    ctx.fillText(`${amount} USDT`, 44, 290);

    const label = settled ? "Settled ✓" : arriving ? "Arriving…" : "Pending";
    ctx.font = font(700, 30);
    const pw = ctx.measureText(label).width + 48;
    roundRect(ctx, 44, h - 104, pw, 60, 30);
    ctx.fillStyle = settled ? "rgba(20,83,45,0.9)" : "rgba(255,255,255,0.08)";
    ctx.fill();
    ctx.fillStyle = settled ? BRAND.green : BRAND.muted;
    ctx.fillText(label, 68, h - 63);

    ctx.fillStyle = "rgba(196,188,217,0.7)";
    ctx.font = font(500, 22);
    ctx.textAlign = "right";
    ctx.fillText("Example", w - 44, h - 64);
    ctx.textAlign = "left";
  };
}

export function Wallet() {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const last = useRef("");
  const texture = useMemo(() => canvasTexture(768, 480, drawFace("0.00", false, false)), []);
  const face = useMemo(() => new THREE.MeshBasicMaterial({ map: texture }), [texture]);
  const materials = useMemo(() => ({ [MATERIAL_SLOTS.walletFace]: face }), [face]);
  const glowMap = useMemo(dotTexture, []);
  useEffect(() => () => (texture.dispose(), face.dispose(), glowMap.dispose()), [texture, face, glowMap]);

  useFrame((s) => {
    const p = journey.p;
    const settled = isSettled(p);
    const arriving = seg(p, 5) > 0.05 && !settled;
    const amount = settledAmountAt(p).toFixed(2);
    const key = `${amount}|${settled}|${arriving}`;
    if (key !== last.current) {
      last.current = key;
      redraw(texture, drawFace(amount, settled, arriving));
    }
    const t = s.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = -0.22 + Math.sin(t * 0.45) * 0.06;
      group.current.position.y = WALLET[1] + Math.sin(t * 0.7 + 1) * 0.05;
    }
    if (halo.current) {
      const flash = range(seg(p, 5), 0.55, 0.65) * (1 - range(seg(p, 5), 0.7, 1));
      halo.current.opacity = flash * 0.9 + (settled ? 0.18 : 0);
      halo.current.color.set(settled ? BRAND.green : BRAND.gold);
    }
  });

  return (
    <group ref={group} position={WALLET}>
      <ModelSlot url={MODELS.wallet} materials={materials}>
        <RoundedBox args={[W, H, 0.08]} radius={0.06} smoothness={3}>
          <meshStandardMaterial color="#1A1230" metalness={0.6} roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0, 0.041]} material={face}>
          <planeGeometry args={[W - 0.06, H - 0.06]} />
        </mesh>
      </ModelSlot>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[W * 2, W * 2]} />
        <meshBasicMaterial ref={halo} map={glowMap} color={BRAND.gold} toneMapped={false} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight position={[0, 0.5, 1.6]} color={BRAND.gold} intensity={3} distance={5} />
    </group>
  );
}
