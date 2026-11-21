import { livePosts } from "@/lib/posts";
import { supabase } from "@/lib/supabase";
import { getSettings, list, siteBase } from "@/lib/settings";

export const revalidate = 3600;

// A plain-text summary for AI assistants and AI search tools
export async function GET() {
  const s = await getSettings();
  const base = siteBase();
  const posts = await livePosts({ select: "slug,title,lang" });
  const { data: sites } = await supabase.from("sites").select("name,url,description").eq("hidden", false).order("sort");
  const names = Array.from(new Set([s.owner_name, ...list(s.also_known_as)])).join(", ");
  const body = [
    `# ${s.owner_name}`,
    `> ${s.seo_description}`,
    "",
    `${s.owner_name} (also searched as: ${names}) works as ${s.job_title}. This is the official website: ${base}`,
    "",
    "## About",
    s.about_body,
    "",
    "## Pages",
    `- [Home](${base}): all websites by ${s.owner_name}`,
    `- [About](${base}/about): who ${s.owner_name} is`,
    `- [Photo & Art Gallery](${base}/gallery)`,
    `- [Mood-board](${base}/moodboard)`,
    `- [Blog](${base}/blog): notes in Tamil and English`,
    `- [Websites](${base}/websites): every website by ${s.owner_name}`,
    `- [Certificates](${base}/certificates): certificates and resume of ${s.owner_name}`,
    `- [Contact](${base}/contact)`,
    ...(posts?.length ? ["", "## Blog posts", ...posts.map((p) => `- [${p.title}](${base}/blog/${p.slug}) (${p.lang})`)] : []),
    "",
    "## All websites by " + s.owner_name + " (Mr Thabik)",
    ...(sites ?? []).map((x) => `- [${x.name}](${x.url}): ${x.description || ""}`),
    "",
    "## Other official websites and profiles",
    ...list(s.same_as).map((u) => `- ${u}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
