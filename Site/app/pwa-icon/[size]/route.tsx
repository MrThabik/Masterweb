import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;
export async function GET(_: Request, { params }: { params: { size: string } }) {
  const px = params.size === "512" ? 512 : params.size === "180" ? 180 : params.size === "64" ? 64 : 192;
  const s = await getSettings();
  const letter = (s.site_name.trim()[0] ?? "T").toUpperCase();
  return new ImageResponse(
    (<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: s.color_bg, color: s.gold, fontSize: px * 0.62, fontWeight: 700, border: `${Math.round(px / 24)}px solid ${s.gold}` }}>{letter}</div>),
    { width: px, height: px }
  );
}
