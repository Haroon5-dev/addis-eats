import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Addis Eats — delicious Ethiopian food";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px", background: "#10233f", color: "#fff" }}>
      <div style={{ fontSize: 28, color: "#f4c95d", letterSpacing: 8 }}>ADDIS EATS</div>
      <div style={{ marginTop: 32, fontSize: 76, fontWeight: 700 }}>Taste Ethiopia.</div>
      <div style={{ marginTop: 20, fontSize: 34, color: "#e5e7eb" }}>Discover your next favorite meal.</div>
      <div style={{ position: "absolute", right: 70, bottom: 54, fontSize: 24, color: "#f4c95d" }}>Delicious food, delivered</div>
    </div>, size
  );
}
