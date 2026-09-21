import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/config/brand-mark";

export const alt = "ShootPX";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated share card (1200×630). Replace with a designed export by adding
// app/opengraph-image.png — a static file takes precedence over this one.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#000", color: "#fff" }}>
        <div style={{ display: "flex", marginBottom: 44 }}>
          <BrandMark size={120} />
        </div>
        <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>ShootPX</div>
        <div style={{ fontSize: 42, color: "#c3c8c4", marginTop: 28 }}>AI product photoshoots for e-commerce</div>
      </div>
    ),
    size,
  );
}
