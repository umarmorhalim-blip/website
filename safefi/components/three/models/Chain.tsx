"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";
import { journey, seg } from "@/lib/journey";
import { range, smoothstep } from "@/lib/math";
import { CHAIN_LENGTH, CHAIN_SLOT, CHAIN_STEP } from "../layout";
import { MODELS } from "./registry";
import { ModelSlot } from "./ModelSlot";

const SIZE = 1.3;

/**
 * The existing chain. Block 0 in this list is the slot the new block locks
 * into (rendered by <Block/>); 1..CHAIN_LENGTH are older blocks.
 */
export function Chain() {
  const edgeMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const links = useRef<(THREE.Mesh | null)[]>([]);
  const pulse = useRef<THREE.Mesh>(null);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE, SIZE, SIZE)), []);
  const slot = useMemo(() => new THREE.Vector3(...CHAIN_SLOT), []);
  const step = useMemo(() => new THREE.Vector3(...CHAIN_STEP), []);
  const base = useMemo(() => new THREE.Color(BRAND.purpleDeep), []);
  const gold = useMemo(() => new THREE.Color(BRAND.gold).multiplyScalar(1.8), []);
  const blocks = useMemo(() => Array.from({ length: CHAIN_LENGTH }, (_, i) => slot.clone().addScaledVector(step, i + 1)), [slot, step]);

  useFrame((s) => {
    const p = journey.p;
    const lock = range(seg(p, 4), 0.55, 0.7);
    // Pulse driven by scroll as the block locks in, then an idle repeat while chapter 5 is on screen.
    const scrollU = range(seg(p, 4), 0.6, 1);
    const idleW = 1 - smoothstep(0, 0.3, Math.abs(p - 5));
    const idleU = (s.clock.elapsedTime * 0.3) % 1.4;
    const u = p < 5 && scrollU < 1 ? scrollU : idleW > 0.05 ? idleU : -1;
    const strength = p < 5 && scrollU < 1 ? (scrollU > 0 ? 1 : 0) : idleW;
    const head = u * (CHAIN_LENGTH + 0.5);

    if (pulse.current) {
      pulse.current.visible = u >= 0 && u <= 1 && strength > 0.02;
      pulse.current.position.copy(slot).addScaledVector(step, head);
      pulse.current.scale.setScalar(strength);
    }
    edgeMats.current.forEach((m, i) => {
      if (!m) return;
      const near = u >= 0 ? Math.max(0, 1 - Math.abs(head - (i + 1)) * 1.2) * strength : 0;
      m.color.copy(base).lerp(gold, near);
    });
    links.current.forEach((l, i) => {
      if (!l) return;
      // Link 0 joins the new block to the chain; it appears as the block locks in.
      const k = i === 0 ? lock : 1;
      l.scale.set(1, Math.max(0.001, k), 1);
      l.visible = k > 0.001;
    });
  });

  return (
    <group>
      {blocks.map((pos, i) => (
        <group key={i} position={pos}>
          <ModelSlot url={MODELS.chainBlock}>
            <mesh>
              <boxGeometry args={[SIZE, SIZE, SIZE]} />
              <meshStandardMaterial color="#140E28" metalness={0.5} roughness={0.45} emissive={BRAND.purpleDeep} emissiveIntensity={0.12} />
            </mesh>
            <lineSegments geometry={edges}>
              <lineBasicMaterial ref={(m) => void (edgeMats.current[i] = m)} color={BRAND.purpleDeep} toneMapped={false} />
            </lineSegments>
          </ModelSlot>
        </group>
      ))}
      {Array.from({ length: CHAIN_LENGTH }, (_, i) => {
        const a = slot.clone().addScaledVector(step, i + 0.5);
        return (
          <mesh key={i} ref={(m) => void (links.current[i] = m)} position={a} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, step.length() - SIZE + 0.1, 12]} />
            <meshStandardMaterial color={BRAND.gold} emissive={BRAND.gold} emissiveIntensity={0.6} metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
      <mesh ref={pulse} visible={false}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color={gold} toneMapped={false} />
      </mesh>
    </group>
  );
}
