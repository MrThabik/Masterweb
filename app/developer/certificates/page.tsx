"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import SaveBar from "@/components/SaveBar";
import { Tips } from "@/components/Tour";
import { useSettings } from "@/hooks/useSettings";
import { useDnD } from "@/hooks/useDnD";
import { resizeImage } from "@/lib/image";
import { uploadImage } from "@/lib/uploadImage";

type Row = { id: string; title: string; issuer: string | null; issued_on: string | null; category: string | null; description: string | null; credential_url: string | null; file_path: string | null; file_type: string | null; hidden: boolean; downloadable: boolean; featured: boolean; sort: number };
const inp = "rounded-lg border bd-gold-30 bg-field p-2.5 text-base text-fg sm:text-sm";
const btn = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";
const chk = "flex items-center gap-2 text-sm text-fg";
const url = (p: string) => supabase.storage.from("gallery").getPublicUrl(p).data.publicUrl;
const hint = (m: string) => (/relation|schema cache|does not exist/i.test(m) ? "Run the Update 9 SQL in Supabase first (creates the certificates table), then try again." : m);

function Manager() {
  const S = useSettings();
  const { v, set } = S;
  const [rows, setRows] = useState<Row[]>([]);
  const [top, setTop] = useState("");
  const [row, setRow] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const say = (id: string, m: string) => setRow((r) => ({ ...r, [id]: m }));
  const load = async () => { const { data, error } = await supabase.from("certificates").select("*").order("sort"); if (error) setTop(hint(error.message)); setRows((data as Row[]) ?? []); };
  useEffect(() => { load(); }, []);
  const edit = (id: string, p: Partial<Row>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const categories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[];

  const persist = async (x: Row, over: Partial<Row> = {}) => {
    const w = { ...x, ...over };
    const { error } = await supabase.from("certificates").update({ title: w.title, issuer: w.issuer || null, issued_on: w.issued_on || null, category: w.category || null, description: w.description || null, credential_url: w.credential_url || null, file_path: w.file_path, file_type: w.file_type, hidden: w.hidden, downloadable: w.downloadable, featured: w.featured }).eq("id", x.id);
    return error ? hint(error.message) : "";
  };
  const save = async (x: Row) => { const e = await persist(x); say(x.id, e || "Saved."); };
  const add = async () => {
    const { error } = await supabase.from("certificates").insert({ title: "New certificate", hidden: true, sort: rows.length });
    setTop(error ? hint(error.message) : "Added. It stays hidden until you add the file and untick Hide.");
    load();
  };
  const del = async (x: Row) => { if (!confirm("Delete this certificate?")) return; if (x.file_path) await supabase.storage.from("gallery").remove([x.file_path]); await supabase.from("certificates").delete().eq("id", x.id); load(); };
  const upload = async (x: Row, f: File) => {
    setBusy(x.id); say(x.id, "Uploading…");
    const isPdf = f.type === "application/pdf";
    const file = isPdf ? f : await resizeImage(f, 2000, 0.88);
    const path = `cert/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`;
    const up = await uploadImage("gallery", path, file);
    setBusy("");
    if (up.error) { say(x.id, hint(up.error)); return; }
    edit(x.id, { file_path: path, file_type: isPdf ? "pdf" : "image" });
    const e = await persist(x, { file_path: path, file_type: isPdf ? "pdf" : "image" });
    say(x.id, e || "File saved.");
  };
  const reorder = async (next: Row[]) => { setRows(next); await Promise.all(next.map((x, k) => supabase.from("certificates").update({ sort: k }).eq("id", x.id))); };
  const dnd = useDnD(rows, reorder);
  const move = (i: number, d: number) => { const a = [...rows]; if (!a[i + d]) return; [a[i], a[i + d]] = [a[i + d], a[i]]; reorder(a); };

  const uploadResume = async (f: File) => {
    if (f.type !== "application/pdf") { setTop("The resume must be a PDF file."); return; }
    setTop("Uploading the resume…");
    const path = `resume/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`;
    const up = await uploadImage("gallery", path, f);
    if (up.error) { setTop(up.error); return; }
    set("resume_path", path);
    setTop("Resume uploaded. Press Save changes at the bottom.");
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-gold">Certificates &amp; Resume</h1>
      <div className="mt-3"><Tips id="certs" items={["Add a certificate, choose its file (a picture or a PDF), fill the title, issuer and date, untick Hide, then press Save on that card.", "View only (default) shows the file with a watermark and no download button. Tick Downloadable to let visitors save it. Nothing can fully stop a screenshot.", "Add a verify link (https) so visitors can confirm the certificate with the issuer.", "Categories group certificates on the public page. Drag cards or use ↑ ↓ to reorder.", "The resume is one PDF shown at the top of the Certificates page."]} /></div>
      {top && <p className="bd-gold-30 r-card sticky top-2 z-20 mt-3 border bg-bg/95 px-4 py-2 text-sm text-em backdrop-blur">{top}</p>}

      <section className="bd-gold-25 mt-4 grid gap-3 rounded-xl border p-4 md:grid-cols-2">
        <h2 className="font-serif text-2xl text-gold md:col-span-2">Resume and page look</h2>
        <div className="grid gap-2">
          <label className={`${btn} w-fit cursor-pointer`}>{v.resume_path ? "Replace resume (PDF)" : "Upload resume (PDF)"}<input type="file" accept="application/pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadResume(f); e.target.value = ""; }} /></label>
          {v.resume_path && <a className="text-sm text-em underline" href={url(v.resume_path)} target="_blank" rel="noopener">Open current resume</a>}
          <label className="grid gap-1 text-sm text-muted">Resume title<input className={inp} value={v.resume_title} onChange={(e) => set("resume_title", e.target.value)} /></label>
          <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.resume_enabled} onChange={(e) => set("resume_enabled", e.target.checked)} /> Show the resume on the website</label>
          <label className={chk}><input type="checkbox" className="h-5 w-5" checked={v.resume_download} onChange={(e) => set("resume_download", e.target.checked)} /> Allow visitors to download the resume</label>
        </div>
        <div className="grid content-start gap-2">
          <label className="grid gap-1 text-sm text-muted">Page title<input className={inp} value={v.cert_title} onChange={(e) => set("cert_title", e.target.value)} /></label>
          <label className="grid gap-1 text-sm text-muted">Intro text (optional)<input className={inp} value={v.cert_intro} onChange={(e) => set("cert_intro", e.target.value)} /></label>
          <label className="grid gap-1 text-sm text-muted">Watermark on view-only files (empty = none)<input className={inp} value={v.cert_watermark} onChange={(e) => set("cert_watermark", e.target.value)} /></label>
          <label className="grid gap-1 text-sm text-muted">Layout<select className={inp} value={v.cert_layout} onChange={(e) => set("cert_layout", e.target.value as "grid" | "list")}><option value="grid">Cards with pictures</option><option value="list">Simple list</option></select></label>
        </div>
      </section>

      <div className="mt-5"><button className={btn} onClick={add}>+ Add certificate</button></div>
      <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
      <div className="mt-3 grid gap-4 xl:grid-cols-2">
        {rows.map((x, i) => (
          <div key={x.id} {...dnd(i)} className={`grid content-start gap-2 rounded-xl border p-3 ${x.hidden ? "bd-gold-20 opacity-70" : "bd-gold-25"}`}>
            {row[x.id] && <p className="rounded-lg bg-card px-3 py-2 text-sm text-em" role="status">{row[x.id]}</p>}
            <input className={inp} value={x.title} onChange={(e) => edit(x.id, { title: e.target.value })} placeholder="Title" />
            <div className="flex flex-wrap gap-2">
              <input className={`${inp} min-w-[140px] flex-1`} value={x.issuer ?? ""} onChange={(e) => edit(x.id, { issuer: e.target.value })} placeholder="Issued by" />
              <input type="date" className={inp} value={x.issued_on ?? ""} onChange={(e) => edit(x.id, { issued_on: e.target.value })} />
            </div>
            <input className={inp} list="cats" value={x.category ?? ""} onChange={(e) => edit(x.id, { category: e.target.value })} placeholder="Category (for example Training, Internship, Course)" />
            <textarea className={`${inp} min-h-[60px]`} value={x.description ?? ""} onChange={(e) => edit(x.id, { description: e.target.value })} placeholder="Short description (optional)" />
            <input className={inp} value={x.credential_url ?? ""} onChange={(e) => edit(x.id, { credential_url: e.target.value })} placeholder="Verify link (https://…, optional)" autoCapitalize="none" />
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid h-20 w-28 place-items-center overflow-hidden rounded-lg border bd-gold-30 bg-card text-xs text-muted">
                {x.file_path ? (x.file_type === "pdf" ? "PDF file" : /* eslint-disable-next-line @next/next/no-img-element */ <img src={url(x.file_path)} alt="" className="h-full w-full object-cover" />) : "No file yet"}
              </div>
              <label className={`${btn} cursor-pointer`}>{busy === x.id ? "Working…" : x.file_path ? "Replace file" : "Choose file (picture or PDF)"}<input type="file" accept="image/*,application/pdf" hidden disabled={busy === x.id} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(x, f); e.target.value = ""; }} /></label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className={chk}><input type="checkbox" className="h-5 w-5" checked={x.hidden} onChange={(e) => edit(x.id, { hidden: e.target.checked })} /> Hide</label>
              <label className={chk}><input type="checkbox" className="h-5 w-5" checked={x.downloadable} onChange={(e) => edit(x.id, { downloadable: e.target.checked })} /> Downloadable</label>
              <button className={btn} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button className={btn} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button className={btn} onClick={() => del(x)}>Delete</button>
              <button className="border-em rounded-full border px-4 py-2 text-sm text-em" onClick={() => save(x)}>Save</button>
            </div>
          </div>
        ))}
      </div>
      <SaveBar dirty={S.dirty} msg={S.msg} onSave={S.save} onUndo={S.undo} onRedo={S.redo} canUndo={S.canUndo} canRedo={S.canRedo} />
    </div>
  );
}

export default function Page() { return <Gate><Manager /></Gate>; }
