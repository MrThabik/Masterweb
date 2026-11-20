import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const revalidate = 3600;
export default async function Icon() {
  const s = await getSettings();
  return new ImageResponse((<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: s.color_bg, color: s.gold, fontSize: 40, fontWeight: 700, border: `3px solid ${s.gold}` }}>{(s.site_name.trim()[0] ?? "T").toUpperCase()}</div>), size);
}
