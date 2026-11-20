import { supabase } from "@/lib/supabase";

// Public posts: published, and not scheduled for the future. If the schedule column does not exist yet, falls back to published only.
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export async function livePosts(opts: { select?: string; limit?: number; order?: boolean } = {}): Promise<Row[]> {
  const run = async (filter: boolean) => {
    let q: any = supabase.from("posts").select(opts.select ?? "*").eq("published", true); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (filter) q = q.or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`);
    if (opts.order !== false) q = q.order("created_at", { ascending: false });
    if (opts.limit) q = q.limit(opts.limit);
    return q;
  };
  const a = await run(true);
  if (!a.error) return a.data ?? [];
  const b = await run(false);
  return b.data ?? [];
}
export async function livePost(slug: string): Promise<Row | null> {
  const run = async (filter: boolean) => {
    let q: any = supabase.from("posts").select("*").eq("slug", slug).eq("published", true); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (filter) q = q.or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`);
    return q.maybeSingle();
  };
  const a = await run(true);
  if (!a.error) return a.data ?? null;
  const b = await run(false);
  return b.data ?? null;
}
