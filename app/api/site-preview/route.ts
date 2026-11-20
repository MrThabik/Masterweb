import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 30;

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const blocked = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1)/;
const publicHttps = (u: URL) => u.protocol === "https:" && u.hostname.includes(".") && !blocked.test(u.hostname);
const json = (b: object, status = 200) => Response.json(b, { status, headers: { "Cache-Control": "no-store" } });

// Finds the website's og:image / twitter:image, copies it into your screenshots bucket and returns its link
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data } = await sb.auth.getUser(token);
  if (!data.user || data.user.email !== process.env.MASTER_EMAIL) return json({ error: "Forbidden" }, 403);

  const { url, id } = await req.json().catch(() => ({}));
  let target: URL;
  try { target = new URL(String(url)); } catch { return json({ error: "That link is not valid." }, 400); }
  if (!publicHttps(target)) return json({ error: "Only public https links can be used." }, 400);

  try {
    const page = await fetch(target.href, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ThaseenOS-Preview/1.0)", Accept: "text/html" }, signal: AbortSignal.timeout(9000) });
    if (!publicHttps(new URL(page.url))) return json({ error: "The website redirected somewhere not allowed." }, 400);
    const html = (await page.text()).slice(0, 400_000);
    const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
    let src = "";
    for (const t of tags) {
      if (/(?:property|name)\s*=\s*["'](?:og:image|twitter:image)(?::src)?["']/i.test(t)) { const m = t.match(/content\s*=\s*["']([^"']+)["']/i); if (m) { src = m[1]; break; } }
    }
    if (!src) return json({ error: "That website has no preview image. Use Upload screenshot instead." }, 404);
    const imgUrl = new URL(src.replace(/&amp;/g, "&"), page.url);
    if (!publicHttps(imgUrl)) return json({ error: "The preview image link is not allowed." }, 400);

    const ir = await fetch(imgUrl.href, { signal: AbortSignal.timeout(9000) });
    const type = (ir.headers.get("content-type") || "").split(";")[0];
    if (!ir.ok || !/^image\/(png|jpeg|webp|gif)$/i.test(type)) return json({ error: "The preview image could not be downloaded." }, 502);
    const buf = Buffer.from(await ir.arrayBuffer());
    if (buf.length > 6_000_000) return json({ error: "The preview image is too large." }, 413);

    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "jpg";
    const path = `${String(id).replace(/[^\w-]/g, "")}-${Date.now()}.${ext}`;
    const up = await sb.storage.from("screenshots").upload(path, buf, { contentType: type, upsert: true });
    if (up.error) return json({ error: `Could not save the image: ${up.error.message}` }, 500);
    return json({ url: sb.storage.from("screenshots").getPublicUrl(path).data.publicUrl });
  } catch (e) {
    return json({ error: (e as Error).name === "TimeoutError" ? "The website took too long to answer." : "Could not read that website." }, 502);
  }
}
