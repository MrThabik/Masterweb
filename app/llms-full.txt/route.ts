import { supabase } from "@/lib/supabase";
import { livePosts } from "@/lib/posts";
import { getSettings, list, parseFaq, siteBase } from "@/lib/settings";
import { plainText } from "@/lib/md";

export const revalidate = 3600;

// The whole website as plain text for AI assistants and AI search
export async function GET() {
  const s = await getSettings();
  const base = siteBase();
  const { data: sites } = await supabase.from("sites").select("name,url,description").eq("hidden", false).order("sort");
  const posts = await livePosts({ limit: 30 });
  const names = Array.from(new Set([s.owner_name, ...list(s.also_known_as)])).join(", ");
  const body = [
    `# ${s.owner_name} (Mr Thabik)`,
    `Also searched as: ${names}`,
    `${s.owner_name} works as ${s.job_title}. Official website: ${base}`,
    "",
    "## About", s.about_body, "",
    "## Questions and answers", ...parseFaq(s.about_faq).flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, ""]),
    "## All websites", ...(sites ?? []).map((x) => `- ${x.name}: ${x.url}${x.description ? ` (${x.description})` : ""}`), "",
    "## Other official profiles", ...list(s.same_as).map((u) => `- ${u}`), "",
    "## Blog posts", ...posts.flatMap((p) => [`### ${p.title} (${String(p.created_at).slice(0, 10)}, ${p.lang})`, `${base}/blog/${p.slug}`, plainText(p.body ?? "").slice(0, 1500), ""]),
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
