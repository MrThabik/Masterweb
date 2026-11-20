"use client";
import { useEffect, useState } from "react";
import { supabase, Site } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";
import { CaptureButton } from "@/components/CaptureButton";
import { useDnD } from "@/hooks/useDnD";
import { resizeImage } from "@/lib/image";
import { uploadImage } from "@/lib/uploadImage";

const inp = "w-full rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
const btn = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";
const chk = "flex items-center gap-2 text-sm text-fg";
const hint = (m: string) => (/not found/i.test(m) ? "The image storage is not set up: run the Update 7 SQL in Supabase." : /row-level|policy|unauthor|permission/i.test(m) ? "No permission to upload: run the Update 7 SQL, and check that MASTER_EMAIL in Vercel is the same email as your Supabase user." : m);

function Manager() {
  const [sites, setSites] = useState<Site[]>([]);
  const [top, setTop] = useState("");
  const [row, setRow] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string>("");

  const load = async () => { const { data } = await supabase.from("sites").select("*").order("sort"); setSites((data as Site[]) ?? []); };
  useEffect(() => { load(); }, []);
  const say = (id: string, m: string) => setRow((r) => ({ ...r, [id]: m }));
  const edit = (id: string, p: Partial<Site>) => setSites((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));

  // saves only the fields you edit here (the visit counter is never overwritten)
  const persist = async (x: Site, over: Partial<Site> = {}) => {
    const v = { ...x, ...over };
    const { error } = await supabase.from("sites").update({ name: v.name, url: v.url, description: v.description, tags: v.tags, screenshot_url: v.screenshot_url || null, live_preview: v.live_preview, hidden: v.hidden }).eq("id", x.id);
    return error ? hint(error.message) : "";
  };
  const save = async (x: Site) => { const e = await persist(x); say(x.id, e || "Saved."); setTop(e ? "" : `Saved ${x.name}`); };
  const setImage = async (x: Site, imageUrl: string) => {
    edit(x.id, { screenshot_url: imageUrl });
    const e = await persist(x, { screenshot_url: imageUrl });
    say(x.id, e || "Picture saved. It is now on your website.");
  };
  const upload = async (x: Site, f: File) => {
    setBusy(x.id); say(x.id, "Preparing the picture…");
    const small = await resizeImage(f);
    say(x.id, "Uploading…");
    const path = `${x.id}-${Date.now()}.${small.type === "image/png" ? "png" : small.type === "image/webp" ? "webp" : "jpg"}`;
    const up = await uploadImage("screenshots", path, small);
    setBusy("");
    if (up.error) { say(x.id, hint(up.error)); return; }
    await setImage(x, up.url);
  };
  const fromSite = async (x: Site) => {
    setBusy(x.id); say(x.id, "Reading the website…");
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/site-preview", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ id: x.id, url: x.url }) });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) { say(x.id, j.error || "Could not get the preview image."); return; }
    await setImage(x, j.url);
  };
  const add = async () => {
    const { error } = await supabase.from("sites").insert({ name: "New website", url: "https://", sort: sites.length });
    setTop(error ? error.message : "New website added (hidden until you fill it in, untick Hide and Save).");
    load();
  };
  const del = async (id: string) => { if (confirm("Delete this website?")) { await supabase.from("sites").delete().eq("id", id); load(); } };
  const reorder = async (next: Site[]) => { setSites(next); await Promise.all(next.map((x, k) => supabase.from("sites").update({ sort: k }).eq("id", x.id))); };
  const dnd = useDnD(sites, reorder);
  const move = (i: number, d: number) => { const a = [...sites]; if (!a[i + d]) return; [a[i], a[i + d]] = [a[i + d], a[i]]; reorder(a); };

  return (
    <main className="w-full">
      <h1 className="font-serif text-3xl text-gold">Websites</h1>
      <div className="mt-3"><Tips id="websites" items={["Each card’s picture: Upload screenshot (from your phone or laptop), Use the site’s own preview image (automatic), or Capture screenshot. The picture is saved by itself.", "New websites start hidden: fill the link, untick Hide, then press Save on that row.", "Drag a card (laptop) or use ↑ ↓ to change the order on your home page.", "If a picture does not show, a message on that card tells you why."]} /></div>
      {top && <p className="bd-gold-30 r-card sticky top-2 z-20 mt-3 border bg-bg/95 px-4 py-2 text-sm text-em backdrop-blur">{top}</p>}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {sites.map((x, i) => (
          <div key={x.id} {...dnd(i)} className="bd-gold-25 grid content-start gap-2 rounded-xl border p-3">
            {row[x.id] && <p className="rounded-lg bg-card px-3 py-2 text-sm text-em" role="status">{row[x.id]}</p>}
            <input className={inp} value={x.name} onChange={(e) => edit(x.id, { name: e.target.value })} placeholder="Name" />
            <input className={inp} value={x.url} onChange={(e) => edit(x.id, { url: e.target.value })} placeholder="https://..." autoCapitalize="none" />
            <textarea className={`${inp} min-h-[70px]`} value={x.description} onChange={(e) => edit(x.id, { description: e.target.value })} placeholder="Description" />
            <input className={inp} value={x.tags.join(", ")} onChange={(e) => edit(x.id, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="Tags, comma separated" />
            <div className="flex items-start gap-3">
              <div className="grid h-24 w-36 shrink-0 place-items-center overflow-hidden rounded-lg border bd-gold-30 bg-card text-xs text-muted">
                {x.screenshot_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.screenshot_url} alt="" className="h-full w-full object-cover" onError={() => say(x.id, "The picture link does not open. Upload the picture again.")} /> : "No picture yet"}
              </div>
              <div className="grid flex-1 gap-2">
                <label className={`${btn} cursor-pointer text-center`}>{busy === x.id ? "Working…" : "Upload screenshot"}<input type="file" accept="image/*" hidden disabled={busy === x.id} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(x, f); e.target.value = ""; }} /></label>
                <button className={btn} disabled={busy === x.id} onClick={() => fromSite(x)}>Use the site’s own preview image</button>
                <CaptureButton id={x.id} url={x.url} onDone={(u) => setImage(x, u)} onError={(m) => say(x.id, m)} />
              </div>
            </div>
            <input className={inp} value={x.screenshot_url ?? ""} onChange={(e) => edit(x.id, { screenshot_url: e.target.value })} placeholder="Or paste a picture link (https://…)" autoCapitalize="none" />
            <div className="flex flex-wrap items-center gap-3">
              <label className={chk}><input type="checkbox" className="h-5 w-5" checked={x.live_preview} onChange={(e) => edit(x.id, { live_preview: e.target.checked })} /> Live preview</label>
              <label className={chk}><input type="checkbox" className="h-5 w-5" checked={x.hidden} onChange={(e) => edit(x.id, { hidden: e.target.checked })} /> Hide</label>
              <button className={btn} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button className={btn} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button className={btn} onClick={() => del(x.id)}>Delete</button>
              <button className="border-em rounded-full border px-4 py-2 text-sm text-em" onClick={() => save(x)}>Save</button>
            </div>
          </div>
        ))}
      </div>
      <button className={`${btn} mt-4`} onClick={add}>+ Add website</button>
    </main>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
