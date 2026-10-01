"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";
import { journey, VALIDATOR_COUNT, votesAt } from "@/lib/journey";
import { range } from "@/lib/math";
import { BLOCK } from "../layout";
import { MODELS } from "./registry";
import { ModelSlot } from "./ModelSlot";

const RADIUS = 2.55;

/** Validator nodes on a halo around the block; they vote one by one in chapter 4. */
export function Validators() {
  const root = useRef<THREE.Group>(null);
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const nodeMats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const beams = useRef<(THREE.Mesh | null)[]>([]);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const purple = useMemo(() => new THREE.Color(BRAND.purple), []);
  const green = useMemo(() => new THREE.Color(BRAND.green), []);
  const spots = useMemo(
    () =>
      Array.from({ length: VALIDATOR_COUNT }, (_, k) => {
        const a = Math.PI / 2 - (k / VALIDATOR_COUNT) * Math.PI * 2 - Math.PI / VALIDATOR_COUNT;
        return { x: Math.cos(a) * RADIUS, y: Math.sin(a) * RADIUS, a };
      }),
    [],
  );
  // When each vote lands, so the newest one can "pop".
  const votedAt = useRef<number[]>(Array(VALIDATOR_COUNT).fill(-1));

  useFrame((s) => {
    const p = journey.p;
    const t = s.clock.elapsedTime;
    const vis = range(p, 2.6, 3.15) * (1 - range(p, 4.25, 4.75));
    if (root.current) root.current.visible = vis > 0.01;
    if (!root.current?.visible) return;
    const votes = votesAt(p);
    if (halo.current) halo.current.opacity = 0.18 * vis;

    for (let k = 0; k < VALIDATOR_COUNT; k++) {
      const voted = k < votes;
      if (voted && votedAt.current[k] < 0) votedAt.current[k] = t;
      if (!voted) votedAt.current[k] = -1;
      const pop = voted ? Math.max(0, 1 - (t - votedAt.current[k]) * 2.5) : 0;
      const g = nodes.current[k];
      if (g) g.scale.setScalar(vis * (1 + pop * 0.6 + Math.sin(t * 2 + k) * 0.04));
      const m = nodeMats.current[k];
      if (m) {
        m.emissive.copy(voted ? green : purple);
        m.color.copy(m.emissive);
        m.emissiveIntensity = voted ? 1.8 + pop * 2 : 0.6;
      }
      const b = beams.current[k];
      if (b) {
        b.visible = voted;
        (b.material as THREE.MeshBasicMaterial).opacity = vis * (0.35 + pop * 0.5);
      }
    }
  });

  return (
    <group ref={root} position={BLOCK} visible={false}>
      <mesh>
        <torusGeometry args={[RADIUS, 0.01, 6, 128]} />
        <meshBasicMaterial ref={halo} color={BRAND.purpleLight} transparent opacity={0} />
      </mesh>
      {spots.map((s, k) => (
        <group key={k}>
          <group position={[s.x, s.y, 0]} ref={(g) => void (nodes.current[k] = g)}>
            <ModelSlot url={MODELS.validator}>
              <mesh>
                <icosahedronGeometry args={[0.2, 1]} />
                <meshStandardMaterial ref={(m) => void (nodeMats.current[k] = m)} color={BRAND.purple} emissive={BRAND.purple} emissiveIntensity={0.6} toneMapped={false} flatShading />
              </mesh>
            </ModelSlot>
          </group>
          {/* Beam from node towards the block. */}
          <mesh
            ref={(m) => void (beams.current[k] = m)}
            position={[s.x * 0.62, s.y * 0.62, 0]}
            rotation={[0, 0, s.a + Math.PI / 2]}
            visible={false}
          >
            <boxGeometry args={[0.025, RADIUS * 0.62, 0.025]} />
            <meshBasicMaterial color={BRAND.green} toneMapped={false} transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
