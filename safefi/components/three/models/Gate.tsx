"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";
import { journey } from "@/lib/journey";
import { range } from "@/lib/math";
import { GATE } from "../layout";
import { pillTexture } from "../textures";
import { MODELS } from "./registry";
import { ModelSlot } from "./ModelSlot";
import { packetAt } from "./Packet";

/** How "passed" the gate is: 0 until the packet crosses the ring, then 1. */
export function gatePassed(p: number, scratch: { pos: THREE.Vector3; scale: number; gold: number }) {
  if (p >= 2) return 1;
  if (p < 1) return 0;
  return range(packetAt(p, scratch).pos.x, GATE[0] - 0.15, GATE[0] + 0.25);
}

export function Gate() {
  const ring = useRef<THREE.MeshStandardMaterial>(null);
  const scan = useRef<THREE.Mesh>(null);
  const labels = useRef<THREE.Group>(null);
  const scratch = useMemo(() => ({ pos: new THREE.Vector3(), scale: 0, gold: 0 }), []);
  const purple = useMemo(() => new THREE.Color(BRAND.purple), []);
  const green = useMemo(() => new THREE.Color(BRAND.green), []);
  const pills = useMemo(
    () => [pillTexture("eKYC ✓", BRAND.green, "rgba(10,40,24,0.92)"), pillTexture("Shariah ✓", BRAND.green, "rgba(10,40,24,0.92)")],
    [],
  );
  useEffect(() => () => pills.forEach((l) => l.tex.dispose()), [pills]);

  useFrame((s) => {
    const p = journey.p;
    const passed = gatePassed(p, scratch);
    if (ring.current) {
      ring.current.emissive.copy(purple).lerp(green, passed);
      ring.current.color.copy(ring.current.emissive);
      ring.current.emissiveIntensity = 1.4 + passed * 1.2;
    }
    if (scan.current) scan.current.rotation.x = s.clock.elapsedTime * 0.8;
    if (labels.current) {
      const show = range(passed, 0.4, 1) * (1 - range(p, 2.35, 2.75));
      labels.current.visible = show > 0.01;
      labels.current.children.forEach((c, i) => {
        const sprite = c as THREE.Sprite;
        sprite.material.opacity = range(show, i * 0.25, 0.75 + i * 0.25);
        const k = 0.3 * (0.8 + 0.2 * sprite.material.opacity);
        sprite.scale.set(k * pills[i].aspect, k, 1);
      });
    }
  });

  return (
    <group position={GATE}>
      <group rotation={[0, Math.PI / 2, 0]}>
        <ModelSlot url={MODELS.gate}>
          <mesh>
            <torusGeometry args={[1.25, 0.07, 20, 96]} />
            <meshStandardMaterial ref={ring} color={BRAND.purple} emissive={BRAND.purple} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh ref={scan}>
            <torusGeometry args={[1.05, 0.015, 8, 64, Math.PI * 1.2]} />
            <meshBasicMaterial color={BRAND.purpleLight} transparent opacity={0.6} />
          </mesh>
        </ModelSlot>
      </group>
      <group ref={labels} visible={false}>
        <sprite position={[-0.65, 1.6, 0.3]}>
          <spriteMaterial map={pills[0].tex} transparent opacity={0} depthWrite={false} />
        </sprite>
        <sprite position={[0.75, 1.6, 0.3]}>
          <spriteMaterial map={pills[1].tex} transparent opacity={0} depthWrite={false} />
        </sprite>
      </group>
    </group>
  );
}
