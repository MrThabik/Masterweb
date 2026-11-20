import { clean, json, svc } from "@/lib/formGuard";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const t = clean(b.t, 64);
  if (!UUID.test(t)) return json({ error: "invalid" }, 400);
  const { error } = await svc.from("subscribers").delete().eq("unsub_token", t);
  return error ? json({ error: "server" }, 500) : json({ ok: true });
}
