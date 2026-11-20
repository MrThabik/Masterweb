import { isMaster } from "@/lib/adminAuth";
import { json, svc } from "@/lib/formGuard";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function all(table: string) {
  const rows: unknown[] = [];
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await svc.from(table).select("*").range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

export async function GET(req: Request) {
  if (!(await isMaster(req))) return json({ error: "Forbidden" }, 403);
  const u = new URL(req.url);
  const tables = ["settings", "sites", "artworks", "moods", "posts", ...(u.searchParams.get("subs") ? ["subscribers"] : []), ...(u.searchParams.get("msgs") ? ["messages"] : [])];
  try {
    const out: Record<string, unknown[]> = {};
    for (const t of tables) out[t] = await all(t);
    const body = JSON.stringify({ app: "thaseen-os", version: 1, created_at: new Date().toISOString(), tables: out });
    return new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (e) { return json({ error: (e as Error).message }, 500); }
}
