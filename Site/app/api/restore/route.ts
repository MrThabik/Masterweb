import { isMaster } from "@/lib/adminAuth";
import { json, svc } from "@/lib/formGuard";

export const runtime = "nodejs";
export const maxDuration = 60;
const ALLOWED = ["settings", "sites", "artworks", "moods", "posts", "subscribers", "messages"];

// Replaces the chosen tables with the rows from a backup file. The editor downloads a safety backup first.
export async function POST(req: Request) {
  if (!(await isMaster(req))) return json({ error: "Forbidden" }, 403);
  const text = await req.text();
  if (text.length > 4_000_000) return json({ error: "The backup file is too big for one restore (over 4 MB)." }, 413);
  let b: { app?: string; tables?: Record<string, Record<string, unknown>[]>; only?: string[]; confirm?: string };
  try { b = JSON.parse(text); } catch { return json({ error: "That file is not a valid backup." }, 400); }
  if (b.app !== "thaseen-os" || !b.tables || b.confirm !== "RESTORE") return json({ error: "That file is not a THASEEN OS backup, or the confirmation is missing." }, 400);

  const results: Record<string, string> = {};
  for (const t of (b.only ?? Object.keys(b.tables)).filter((x) => ALLOWED.includes(x) && Array.isArray(b.tables![x]))) {
    const rows = b.tables[t];
    const del = await svc.from(t).delete().not("id", "is", null);
    if (del.error) { results[t] = `failed while clearing: ${del.error.message}`; continue; }
    let ok = true;
    for (let i = 0; i < rows.length; i += 200) {
      const ins = await svc.from(t).insert(rows.slice(i, i + 200));
      if (ins.error) { results[t] = `failed while inserting: ${ins.error.message}`; ok = false; break; }
    }
    if (ok) results[t] = `restored ${rows.length} rows`;
  }
  return json({ results });
}
