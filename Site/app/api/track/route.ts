import { clean, json, svc } from "@/lib/formGuard";

export const runtime = "nodejs";
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|monitor|curl|wget|python|node-fetch|axios|pingdom/i;

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return json({ ok: true });
  const b = await req.json().catch(() => ({}));
  const path = clean(b.path, 200);
  if (!path.startsWith("/") || path.startsWith("/developer") || path.startsWith("/api")) return json({ ok: true });
  const vid = clean(b.vid, 64).replace(/[^\w-]/g, "");
  if (!vid) return json({ ok: true });

  let ref = "";
  try { const u = new URL(String(b.ref)); const own = new URL(req.url).host; if (u.host !== own) ref = u.host.replace(/^www\./, ""); } catch {}
  const device = /ipad|tablet/i.test(ua) ? "tablet" : /mobi|android|iphone/i.test(ua) ? "mobile" : "desktop";
  const country = (req.headers.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase();
  const lang = /^ta/i.test(String(b.lang ?? "")) ? "ta" : "en";

  // at most 20 page views per visitor per minute
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await svc.from("page_views").select("*", { count: "exact", head: true }).eq("vid", vid).gte("created_at", since);
  if ((count ?? 0) >= 20) return json({ ok: true });
  await svc.from("page_views").insert({ path, ref, country, device, lang, vid });
  return json({ ok: true });
}
