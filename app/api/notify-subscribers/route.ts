import { isMaster } from "@/lib/adminAuth";
import { json, svc } from "@/lib/formGuard";
import { notifyPost } from "@/lib/notify";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isMaster(req))) return json({ error: "Forbidden" }, 403);
  const b = await req.json().catch(() => ({}));
  const { data: post } = await svc.from("posts").select("*").eq("id", String(b.postId ?? "")).maybeSingle();
  if (!post) return json({ error: "no_post" }, 404);
  const live = post.published && (!post.publish_at || new Date(post.publish_at) <= new Date());
  if (!live) return json({ error: "not_live" }, 400);
  if (post.notified_at && !b.force) return json({ error: "already_sent", at: post.notified_at }, 409);
  const r = await notifyPost(post);
  return json(r, r.error ? (r.error === "no_key" ? 501 : 400) : 200);
}
