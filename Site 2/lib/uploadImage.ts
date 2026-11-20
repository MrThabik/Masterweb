import { supabase } from "@/lib/supabase";

// Uploads a picture. If the direct upload is refused (missing folder, permissions), the server does it with its own key.
export async function uploadImage(bucket: "screenshots" | "gallery", path: string, file: File): Promise<{ url: string; error?: string }> {
  const direct = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (!direct.error) return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
  const { data } = await supabase.auth.getSession();
  const fd = new FormData();
  fd.append("bucket", bucket); fd.append("path", path); fd.append("file", file);
  const r = await fetch("/api/upload-image", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token}` }, body: fd }).catch(() => null);
  const j = r ? await r.json().catch(() => ({})) : {};
  if (r && r.ok && j.url) return { url: j.url };
  return { url: "", error: j.error || direct.error.message };
}
