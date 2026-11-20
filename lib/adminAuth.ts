import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
// True when the request carries the Master's login
export async function isMaster(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data } = await sb.auth.getUser(token);
  return !!data.user && data.user.email === process.env.MASTER_EMAIL;
}
