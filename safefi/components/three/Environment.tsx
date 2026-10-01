"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";
import { journey, LAST_CHAPTER } from "@/lib/journey";
import { clamp } from "@/lib/math";
import { BLOCK, FLOOR_Y, GATE, PHONE, WALLET } from "./layout";
import { canvasTexture, dotTexture } from "./textures";

/** Ambient dust. Fewer points on low-end devices. */
export function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const map = useMemo(dotTexture, []);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = THREE.MathUtils.randFloat(-18, 16);
      a[i * 3 + 1] = THREE.MathUtils.randFloat(-1.5, 9);
      a[i * 3 + 2] = THREE.MathUtils.randFloat(-18, 9);
    }
    return a;
  }, [count]);
  useEffect(() => () => map.dispose(), [map]);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.03) * 0.15;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={map} size={0.09} sizeAttenuation color={BRAND.purpleLight} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/** Soft purple pool of light on the floor, for depth without a shadow pass. */
export function Floor() {
  const map = useMemo(
    () =>
      canvasTexture(256, 256, (ctx, w) => {
        const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
        g.addColorStop(0, "rgba(124,58,237,0.38)");
        g.addColorStop(0.5, "rgba(124,58,237,0.08)");
        g.addColorStop(1, "rgba(124,58,237,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, w);
      }),
    [],
  );
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, FLOOR_Y, -3]}>
      <planeGeometry args={[46, 34]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} />
    </mesh>
  );
}

/** The route the money travels: faint end to end, lit in gold up to where the story is. */
export function Route() {
  const lit = useRef<THREE.Mesh>(null);
  const { faint, bright } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...PHONE),
      new THREE.Vector3(...GATE),
      new THREE.Vector3(...BLOCK),
      new THREE.Vector3(3.6, 0, -1.4),
      new THREE.Vector3(...WALLET),
    ]);
    return {
      faint: new THREE.TubeGeometry(curve, 240, 0.014, 6, false),
      bright: new THREE.TubeGeometry(curve, 240, 0.022, 6, false),
    };
  }, []);
  useEffect(() => () => (faint.dispose(), bright.dispose()), [faint, bright]);
  useFrame(() => {
    const frac = clamp(journey.p / LAST_CHAPTER);
    const total = bright.index!.count;
    const perSeg = total / 240;
    bright.setDrawRange(0, Math.floor(frac * 240) * perSeg);
    if (lit.current) lit.current.visible = frac > 0.002;
  });
  return (
    <group position={[0, -1.25, 0]}>
      <mesh geometry={faint}>
        <meshBasicMaterial color={BRAND.purpleLight} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh ref={lit} geometry={bright}>
        <meshBasicMaterial color={new THREE.Color(BRAND.gold).multiplyScalar(1.4)} toneMapped={false} />
      </mesh>
    </group>
  );
}
