"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";
import { journey, seg } from "@/lib/journey";
import { easeOut, range } from "@/lib/math";
import { BLOCK, CHAIN_SLOT, GATE, PHONE, WALLET } from "../layout";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** World position of the phone's Confirm button. */
export const CONFIRM_BUTTON = v(PHONE[0], PHONE[1] - 0.66, PHONE[2] + 0.09);
const HOVER = v(PHONE[0] + 0.85, PHONE[1] - 0.3, PHONE[2] + 0.55);
const TO_GATE = new THREE.CatmullRomCurve3([HOVER, v(-7.6, 0.45, 0.6), v(GATE[0] - 0.7, 0, 0), v(...GATE), v(GATE[0] + 0.8, 0, 0)]);
const TO_BLOCK = new THREE.CatmullRomCurve3([v(GATE[0] + 0.8, 0, 0), v(-2.2, 0.35, 0.25), v(...BLOCK)]);
const TO_WALLET = new THREE.CatmullRomCurve3([
  v(CHAIN_SLOT[0], CHAIN_SLOT[1] + 0.9, CHAIN_SLOT[2]),
  v(3.6, 1.0, -1.3),
  v(WALLET[0] - 0.3, WALLET[1] + 0.2, WALLET[2] + 0.15),
]);

export type PacketState = { pos: THREE.Vector3; scale: number; gold: number };

/** Where the packet is for a given story position. Pure, so reverse scroll just works. */
export function packetAt(p: number, out: PacketState): PacketState {
  out.scale = 0;
  out.gold = p >= 5 ? 1 : 0;
  if (p < 1) {
    const t = range(seg(p, 0), 0.45, 0.95);
    out.pos.lerpVectors(CONFIRM_BUTTON, HOVER, easeOut(t));
    out.scale = range(t, 0, 0.3);
  } else if (p < 2) {
    TO_GATE.getPointAt(seg(p, 1), out.pos);
    out.scale = 1;
  } else if (p < 3) {
    const t = range(seg(p, 2), 0, 0.45);
    TO_BLOCK.getPointAt(t, out.pos);
    out.scale = 1 - range(t, 0.8, 1);
  } else if (p >= 5 && p < 6) {
    const t = range(seg(p, 5), 0, 0.6);
    TO_WALLET.getPointAt(t, out.pos);
    out.scale = range(t, 0, 0.12) * (1 - range(t, 0.9, 1));
  }
  return out;
}

const GHOSTS = 4;

export function Packet() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const states = useMemo(() => Array.from({ length: GHOSTS + 1 }, () => ({ pos: new THREE.Vector3(), scale: 0, gold: 0 })), []);
  const purple = useMemo(() => new THREE.Color(BRAND.purple).multiplyScalar(1.5), []);
  const gold = useMemo(() => new THREE.Color(BRAND.gold).multiplyScalar(1.8), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    for (let i = 0; i <= GHOSTS; i++) {
      const s = packetAt(journey.p - i * 0.012, states[i]);
      const m = refs.current[i];
      if (!m) continue;
      m.visible = s.scale > 0.001;
      m.position.copy(s.pos);
      m.position.y += Math.sin(time * 2.2) * 0.04;
      const k = i === 0 ? 1 : 0.7 - i * 0.13;
      m.scale.setScalar(s.scale * k * (1 + Math.sin(time * 4) * 0.06 * (i === 0 ? 1 : 0)));
      m.rotation.set(time * 0.9, time * 1.3, 0);
      (m.material as THREE.MeshBasicMaterial).color.copy(s.gold ? gold : purple);
    }
  });

  return (
    <group>
      {states.map((_, i) => (
        <mesh key={i} ref={(m) => void (refs.current[i] = m)} visible={false}>
          <icosahedronGeometry args={[0.085, 2]} />
          <meshBasicMaterial toneMapped={false} transparent opacity={i === 0 ? 1 : 0.45} depthWrite={i === 0} />
        </mesh>
      ))}
    </group>
  );
}
