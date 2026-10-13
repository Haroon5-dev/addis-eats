import { ImageResponse } from "next/og";
import dishes from "../../../public/dishes.json";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }) {
  const { id } = await params;
  const dish = dishes.find((item) => String(item.id) === String(id));
  const name = dish?.name || "Addis Eats Menu";
  const description = dish?.description || "Discover delicious meals at Addis Eats";
  const price = dish ? `${dish.price} ETB` : "";

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px", background: "#10233f", color: "#fff" }}>
      <div style={{ fontSize: 25, color: "#f4c95d", letterSpacing: 7 }}>ADDIS EATS MENU</div>
      <div style={{ marginTop: 28, fontSize: 72, fontWeight: 700 }}>{name}</div>
      <div style={{ marginTop: 20, fontSize: 28, color: "#e5e7eb", maxWidth: "950px" }}>{description}</div>
      <div style={{ marginTop: 28, fontSize: 32, color: "#f4c95d" }}>{price}</div>
    </div>, size
  );
}
