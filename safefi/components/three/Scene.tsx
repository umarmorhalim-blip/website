"use client";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useState } from "react";
import { BRAND } from "@/lib/brand";
import { isMobileViewport, type Tier } from "@/lib/device";
import { CameraRig } from "./CameraRig";
import { Floor, Particles, Route } from "./Environment";
import { Block } from "./models/Block";
import { Chain } from "./models/Chain";
import { Gate } from "./models/Gate";
import { Packet } from "./models/Packet";
import { Phone } from "./models/Phone";
import { Validators } from "./models/Validators";
import { Wallet } from "./models/Wallet";

type Props = {
  tier: Tier;
  /** False while the journey is off-screen: rendering stops entirely. */
  active: boolean;
  onReady: () => void;
};

/**
 * The one pinned canvas. Everything in it is a pure function of `journey.p`
 * (plus a little time-based idle motion), so it plays identically forwards and
 * backwards. Default-exported for next/dynamic.
 */
// If the WebGL context can't be created, R3F throws; the <ErrorBoundary> around
// this component in <Journey> catches it and switches to the flow layout.
export default function Scene({ tier, active, onReady }: Props) {
  // Starts from the device heuristic; the frame-rate check can demote it.
  const [low, setLow] = useState(tier === "low");
  const mobile = useMemo(isMobileViewport, []);
  const maxDpr = low ? 1 : mobile ? 1.5 : 2;

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, maxDpr]}
      // MSAA is handled by the composer; on the low tier there is none (dpr does the work).
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.1, far: 120, position: [-1.5, 7.5, 19] }}
      onCreated={({ gl }) => {
        gl.setClearColor(BRAND.bg);
        // Allow the browser to restore a lost context (e.g. after backgrounding on iOS).
        gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
        requestAnimationFrame(onReady);
      }}
    >
      <fog attach="fog" args={[BRAND.bg, 22, 62]} />
      <PerformanceMonitor bounds={(r) => (r > 90 ? [50, 90] : [36, 60])} flipflops={3} onDecline={() => setLow(true)} onFallback={() => setLow(true)} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={[BRAND.purpleLight, BRAND.bg, 0.6]} />
      <directionalLight position={[6, 9, 7]} intensity={1.6} />

      <CameraRig />
      <Floor />
      <Route />
      <Particles count={low ? 140 : mobile ? 320 : 600} />
      <Phone />
      <Gate />
      <Block />
      <Validators />
      <Chain />
      <Wallet />
      <Packet />

      {!low && (
        <EffectComposer multisampling={mobile ? 0 : 4} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.72} luminanceSmoothing={0.2} />
          <Vignette offset={0.3} darkness={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
