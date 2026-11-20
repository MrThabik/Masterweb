import { svc } from "@/lib/formGuard";
import { emailReady, postMail, sendMany } from "@/lib/email";
import { getSettings, siteBase } from "@/lib/settings";
import { plainText } from "@/lib/md";

type P = { id: string; slug: string; title: string; excerpt?: string | null; body?: string | null };
// Emails one post to every subscriber, then marks the post as emailed
export async function notifyPost(p: P): Promise<{ sent: number; failed: number; total: number; error?: string }> {
  if (!emailReady()) return { sent: 0, failed: 0, total: 0, error: "no_key" };
  const { data: subs, error } = await svc.from("subscribers").select("email,unsub_token");
  if (error) return { sent: 0, failed: 0, total: 0, error: "no_token_column" };
  const st = await getSettings();
  const excerpt = (p.excerpt || plainText(p.body ?? "")).slice(0, 220);
  const mails = (subs ?? []).filter((s) => s.unsub_token).map((s) => postMail({ base: siteBase(), siteName: st.site_name, slug: p.slug, title: p.title, excerpt, token: s.unsub_token, to: s.email }));
  if (!mails.length) return { sent: 0, failed: 0, total: 0, error: "no_subscribers" };
  const r = await sendMany(mails);
  if (r.sent > 0) await svc.from("posts").update({ notified_at: new Date().toISOString() }).eq("id", p.id);
  return { ...r, total: mails.length };
}
