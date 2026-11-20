import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const revalidate = 3600;
export default async function AppleIcon() {
  const s = await getSettings();
  return new ImageResponse((<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: s.color_bg, color: s.gold, fontSize: 112, fontWeight: 700 }}>{(s.site_name.trim()[0] ?? "T").toUpperCase()}</div>), size);
}
