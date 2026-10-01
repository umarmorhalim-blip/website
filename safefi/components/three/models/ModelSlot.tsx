"use client";
import { useGLTF } from "@react-three/drei";
import { Suspense, useMemo, type ReactNode } from "react";
import type * as THREE from "three";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type Props = {
  /** GLB path from the registry; `null` renders the placeholder. */
  url: string | null;
  /** Placeholder primitives, also shown while the GLB loads or if it fails. */
  children: ReactNode;
  /** Replace materials on named meshes, e.g. `{ Screen: screenMaterial }`. */
  materials?: Record<string, THREE.Material>;
};

export function ModelSlot({ url, children, materials }: Props) {
  if (!url) return <>{children}</>;
  return (
    <ErrorBoundary fallback={children}>
      <Suspense fallback={children}>
        <Glb url={url} materials={materials} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Glb({ url, materials }: { url: string; materials?: Record<string, THREE.Material> }) {
  // `true` uses drei's hosted Draco decoder; point it at /draco/ to self-host.
  const { scene } = useGLTF(url, true);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && materials?.[mesh.name]) mesh.material = materials[mesh.name];
    });
    return clone;
  }, [scene, materials]);
  return <primitive object={object} />;
}
