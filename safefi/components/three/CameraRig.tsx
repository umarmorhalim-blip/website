"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { journey, LAST_CHAPTER } from "@/lib/journey";
import { CAMERA_KEYS } from "./layout";

const DEG = Math.PI / 180;
const BASE_HALF_TAN = Math.tan(20 * DEG); // 40° vertical fov on desktop
const DESKTOP_H_HALF_TAN = BASE_HALF_TAN * 1.6; // horizontal coverage at 16:10
const MAX_HALF_TAN = Math.tan(31 * DEG);

/**
 * Flies the camera between the chapter keyframes as `journey.p` changes.
 * Also reframes for the viewport: portrait screens get a wider fov (and pull
 * back if that is not enough), and the subject is nudged away from the card.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const keys = useMemo(
    () => CAMERA_KEYS.map((k) => ({ pos: new THREE.Vector3(...k.pos), target: new THREE.Vector3(...k.target), arc: k.arc ?? 0 })),
    [],
  );
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), target: new THREE.Vector3() }), []);
  const framing = useRef({ w: 0, h: 0, dist: 1 });

  useFrame((state) => {
    const { width: w, height: h } = state.size;
    const f = framing.current;
    if (w !== f.w || h !== f.h) {
      f.w = w;
      f.h = h;
      const aspect = w / h;
      const wantH = aspect < 1 ? DESKTOP_H_HALF_TAN * 0.72 : DESKTOP_H_HALF_TAN;
      const needV = Math.max(BASE_HALF_TAN, wantH / aspect);
      f.dist = needV > MAX_HALF_TAN ? needV / MAX_HALF_TAN : 1;
      camera.fov = (2 * Math.atan(Math.min(needV, MAX_HALF_TAN))) / DEG;
      // Card sits left on wide screens and at the bottom on phones.
      if (w >= 768) camera.setViewOffset(w, h, -w * 0.15, 0, w, h);
      else camera.setViewOffset(w, h, 0, h * 0.17, w, h);
      camera.updateProjectionMatrix();
    }

    const p = journey.p;
    const c = Math.min(Math.floor(p), LAST_CHAPTER - 1);
    const t = p - c;
    const a = keys[c];
    const b = keys[c + 1];
    tmp.pos.lerpVectors(a.pos, b.pos, t);
    tmp.target.lerpVectors(a.target, b.target, t);
    tmp.pos.y += Math.sin(t * Math.PI) * b.arc;
    tmp.pos.sub(tmp.target).multiplyScalar(f.dist).add(tmp.target);

    // Gentle idle drift so held chapters still feel alive.
    const time = state.clock.elapsedTime;
    tmp.pos.x += Math.sin(time * 0.35) * 0.1;
    tmp.pos.y += Math.sin(time * 0.27) * 0.07;

    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.target);
  });

  return null;
}
