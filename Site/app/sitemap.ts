import type { MetadataRoute } from "next";
import { livePosts } from "@/lib/posts";

export const revalidate = 3600;
const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://masterweb.thaseenshabik.in").replace(/\/$/, "");

// Served at /sitemap.xml. Blog posts are added automatically when you publish them.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await livePosts({ select: "slug,created_at", order: false });
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/websites`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/moodboard`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...(data ?? []).map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
