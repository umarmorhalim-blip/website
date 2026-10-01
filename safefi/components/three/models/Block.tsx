"use client";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";
import { journey, seg } from "@/lib/journey";
import { easeInOut, lerp, range } from "@/lib/math";
import { BLOCK, CHAIN_SLOT } from "../layout";
import { canvasTexture, font, roundRect } from "../textures";
import { MODELS } from "./registry";
import { ModelSlot } from "./ModelSlot";

const SLABS = [
  { title: "HEADER", sub: "version · nonce" },
  { title: "PREV HASH", sub: "0x9f3e…a21c" },
  { title: "TIMESTAMP", sub: "01 Oct · 09:41" },
  { title: "TX", sub: "0x4c1b…77e0" },
  { title: "YOUR TRANSFER", sub: "242.72 USDT", gold: true },
  { title: "TX", sub: "0x7da9…03f2" },
];
const SIZE = 1.45;
const THICK = 0.2;
const GAP = 0.05;
const EXPLODED_SCALE = 0.68;

/** How far the block is blown apart: opens in chapter 3, closes again in chapter 4. */
export function explodeAt(p: number) {
  return p < 3 ? range(seg(p, 2), 0.45, 1) : 1 - range(seg(p, 3), 0, 0.35);
}
/** Block travel from the validation spot to the head of the chain. */
export const lockTravelAt = (p: number) => easeInOut(range(seg(p, 4), 0, 0.6));

function slabLabel(title: string, sub: string, gold?: boolean) {
  return canvasTexture(256, 256, (ctx, w, h) => {
    roundRect(ctx, 6, 6, w - 12, h - 12, 22);
    ctx.fillStyle = gold ? "rgba(60,44,12,0.95)" : "rgba(26,18,52,0.95)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = gold ? BRAND.gold : "rgba(192,132,252,0.7)";
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = gold ? BRAND.gold : BRAND.purpleLight;
    ctx.font = font(800, title.length > 10 ? 25 : 32);
    ctx.fillText(title, w / 2, h / 2 - 8);
    ctx.fillStyle = BRAND.ink;
    ctx.font = font(500, 24);
    ctx.fillText(sub, w / 2, h / 2 + 32);
  });
}

export function Block() {
  const root = useRef<THREE.Group>(null);
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const shell = useRef<THREE.Group>(null);
  const shellMat = useRef<THREE.MeshStandardMaterial>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const goldMat = useRef<THREE.MeshStandardMaterial>(null);
  const labels = useMemo(() => SLABS.map((s) => slabLabel(s.title, s.sub, s.gold)), []);
  useEffect(() => () => labels.forEach((t) => t.dispose()), [labels]);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.7, 1.7, 1.7)), []);
  const from = useMemo(() => new THREE.Vector3(...BLOCK), []);
  const to = useMemo(() => new THREE.Vector3(...CHAIN_SLOT), []);
  const purple = useMemo(() => new THREE.Color(BRAND.purpleLight), []);
  const green = useMemo(() => new THREE.Color(BRAND.green), []);
  const gold = useMemo(() => new THREE.Color(BRAND.gold), []);

  useFrame((s) => {
    const p = journey.p;
    const e = explodeAt(p);
    const travel = lockTravelAt(p);
    const t = s.clock.elapsedTime;
    if (root.current) {
      root.current.position.lerpVectors(from, to, travel);
      root.current.position.y += Math.sin(travel * Math.PI) * 0.8;
      root.current.rotation.y = travel * Math.PI * 0.5 + (1 - e) * Math.sin(t * 0.4) * 0.12;
    }

    slabs.current.forEach((g, i) => {
      if (!g) return;
      const k = easeInOut(range(e, i * 0.06, 0.64 + i * 0.06));
      const col = i % 2;
      const row = Math.floor(i / 2);
      const stackY = (5 * (THICK + GAP)) / 2 - i * (THICK + GAP);
      g.position.set(lerp(0, col ? 0.62 : -0.62, k), lerp(stackY, 1.05 - row * 1.05, k), lerp(0, 0.4, k));
      g.rotation.set(k * (Math.PI / 2 - 0.3), k * (col ? -0.18 : 0.18), 0);
      g.scale.setScalar(lerp(1, EXPLODED_SCALE, k));
      if (k > 0) g.position.y += Math.sin(t * 1.3 + i) * 0.03 * k;
    });

    // Packet becomes the gold slab when it enters the block.
    if (goldMat.current) {
      const g = p >= 3 ? 1 : range(seg(p, 2), 0.38, 0.55);
      goldMat.current.emissiveIntensity = 0.15 + g * (1.6 + Math.sin(t * 3) * 0.3 * e);
      goldMat.current.emissive.copy(purple).lerp(gold, g);
    }

    // Shell fades while exploded; flashes green when the network accepts it.
    const approved = range(seg(p, 3), 0.92, 1) * (1 - range(seg(p, 4), 0.25, 0.55));
    if (shell.current) shell.current.scale.setScalar(1 + e * 0.4);
    if (shellMat.current) shellMat.current.opacity = 0.1 * (1 - e);
    if (edgeMat.current) {
      edgeMat.current.opacity = (1 - e) * 0.9;
      edgeMat.current.color.copy(purple).lerp(green, approved).lerp(gold, range(seg(p, 4), 0.55, 0.75));
    }
  });

  return (
    <group ref={root} position={BLOCK}>
      {SLABS.map((slab, i) => (
        <group key={i} ref={(g) => void (slabs.current[i] = g)}>
          <ModelSlot url={MODELS.slab}>
            <RoundedBox args={[SIZE, THICK, SIZE]} radius={0.04} smoothness={2}>
              {slab.gold ? (
                <meshStandardMaterial ref={goldMat} color="#3A2A10" emissive={BRAND.purpleLight} emissiveIntensity={0.15} metalness={0.4} roughness={0.4} toneMapped={false} />
              ) : (
                <meshStandardMaterial color="#1E1638" emissive={BRAND.purpleDeep} emissiveIntensity={0.18} metalness={0.5} roughness={0.35} />
              )}
            </RoundedBox>
          </ModelSlot>
          <mesh position={[0, THICK / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[SIZE - 0.08, SIZE - 0.08]} />
            <meshBasicMaterial map={labels[i]} transparent />
          </mesh>
        </group>
      ))}
      <group ref={shell}>
        <ModelSlot url={MODELS.blockShell}>
          <mesh>
            <boxGeometry args={[1.7, 1.7, 1.7]} />
            <meshStandardMaterial ref={shellMat} color={BRAND.purple} transparent opacity={0.1} depthWrite={false} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial ref={edgeMat} color={BRAND.purpleLight} transparent opacity={0.9} toneMapped={false} />
          </lineSegments>
        </ModelSlot>
      </group>
    </group>
  );
}
