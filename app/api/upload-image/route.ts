import { isMaster } from "@/lib/adminAuth";
import { json, svc } from "@/lib/formGuard";

export const runtime = "nodejs";
export const maxDuration = 30;

// Fallback uploader: also creates the storage folder and makes it public when that is the problem
export async function POST(req: Request) {
  if (!(await isMaster(req))) return json({ error: "Forbidden" }, 403);
  const fd = await req.formData().catch(() => null);
  if (!fd) return json({ error: "Bad upload." }, 400);
  const bucket = String(fd.get("bucket"));
  if (!["screenshots", "gallery"].includes(bucket)) return json({ error: "Unknown folder." }, 400);
  const path = String(fd.get("path") ?? "").replace(/[^\w\-./]/g, "_").replace(/\.\.+/g, ".");
  const file = fd.get("file");
  if (!path || path.startsWith("/") || !(file instanceof File)) return json({ error: "Bad upload." }, 400);
  if (!/^image\//.test(file.type) && file.type !== "application/pdf") return json({ error: "Only pictures and PDF files can be uploaded." }, 400);
  if (file.size > 4_000_000) return json({ error: "The file is over 4 MB. Choose a smaller one." }, 413);

  const b = await svc.storage.getBucket(bucket);
  if (b.error) await svc.storage.createBucket(bucket, { public: true });
  else if (!b.data.public) await svc.storage.updateBucket(bucket, { public: true });
  const up = await svc.storage.from(bucket).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true });
  if (up.error) return json({ error: `Could not save the picture: ${up.error.message}` }, 500);
  return json({ url: svc.storage.from(bucket).getPublicUrl(path).data.publicUrl });
}
