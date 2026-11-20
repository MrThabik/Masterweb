import { json, svc } from "@/lib/formGuard";
import { notifyPost } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Runs once a day (see vercel.json): emails posts that are now public and were marked "Email subscribers when published"
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "Unauthorized" }, 401);
  const now = new Date().toISOString();
  const { data: posts, error } = await svc.from("posts").select("*").eq("published", true).eq("email_on_publish", true).is("notified_at", null).or(`publish_at.is.null,publish_at.lte.${now}`);
  if (error) return json({ error: error.message }, 500);
  const out = [];
  for (const p of posts ?? []) out.push({ slug: p.slug, ...(await notifyPost(p)) });
  return json({ checked: posts?.length ?? 0, results: out });
}
