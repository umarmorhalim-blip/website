import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "SafeFi+ — Journey of a Transfer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Placeholder OG card generated at build time. Replace with a designed render of the scene.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(circle at 70% 40%, #4C1D95 0%, #07050F 60%)",
          color: "#F5F3FF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>
          SafeFi<span style={{ color: "#D4A853" }}>+</span>
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 24, lineHeight: 1.05 }}>Where Does Your Money Go?</div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#C4BCD9" }}>
          Follow one Shariah-compliant USDT ↔ MYR transfer from your phone to settlement.
        </div>
      </div>
    ),
    size,
  );
}
