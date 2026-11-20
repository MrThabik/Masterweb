import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: s.site_name, short_name: s.site_name.slice(0, 12), description: s.seo_description, start_url: "/", display: "standalone",
    background_color: s.color_bg, theme_color: s.color_bg,
    icons: [{ src: "/pwa-icon/192", sizes: "192x192", type: "image/png" }, { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" }],
  };
}
