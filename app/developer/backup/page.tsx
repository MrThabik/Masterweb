"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

const btn = "bd-gold-40 rounded-full border px-5 py-3 text-sm text-gold";
const token = async () => (await supabase.auth.getSession()).data.session?.access_token;

function Backup() {
  const [subs, setSubs] = useState(false);
  const [msgs, setMsgs] = useState(false);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<{ name: string; text: string; tables: Record<string, unknown[]> } | null>(null);
  const [pick, setPick] = useState<string[]>([]);
  const [word, setWord] = useState("");

  const download = async (withSubs = subs, withMsgs = msgs, label = "backup") => {
    const r = await fetch(`/api/backup?${withSubs ? "subs=1&" : ""}${withMsgs ? "msgs=1" : ""}`, { headers: { Authorization: `Bearer ${await token()}` } });
    if (!r.ok) { setNote((await r.json().catch(() => ({}))).error || "Could not make the backup."); return false; }
    const blob = await r.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `thaseen-${label}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    return true;
  };
  const choose = async (f: File) => {
    try {
      const text = await f.text();
      const j = JSON.parse(text);
      if (j.app !== "thaseen-os" || !j.tables) throw new Error("not a backup");
      setFile({ name: f.name, text, tables: j.tables });
      setPick(Object.keys(j.tables).filter((t) => !["subscribers", "messages"].includes(t)));
      setNote("");
    } catch { setFile(null); setNote("That file is not a THASEEN OS backup."); }
  };
  const restore = async () => {
    if (!file || word !== "RESTORE" || !pick.length) return;
    setNote("Saving a safety copy of your current data first…");
    if (!(await download(true, true, "before-restore"))) return;
    setNote("Restoring…");
    const body = JSON.stringify({ ...JSON.parse(file.text), only: pick, confirm: "RESTORE" });
    const r = await fetch("/api/restore", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` }, body });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setNote(j.error || "Restore failed."); return; }
    await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${await token()}` } }).catch(() => null);
    setNote(Object.entries(j.results as Record<string, string>).map(([t, m]) => `${t}: ${m}`).join(" · "));
    setWord("");
  };
  return (
    <div>
      <h1 className="adm-title font-serif text-3xl">Backup &amp; Restore</h1>
      <div className="mt-3"><Tips id="backup" items={["A backup is one file with your settings, websites, gallery, mood-board and blog posts. Keep it somewhere safe.", "Pictures stay in Supabase storage; the backup keeps their links.", "Restoring replaces the chosen parts of your website with the file. A safety copy of the current data downloads first.", "Subscribers and messages hold personal information: include them only if you need them."]} /></div>
      <section className="bd-gold-25 r-card mt-4 grid gap-3 border bg-card p-4">
        <h2 className="font-serif text-2xl text-gold">Make a backup</h2>
        <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={subs} onChange={(e) => setSubs(e.target.checked)} /> Include subscribers (emails)</label>
        <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={msgs} onChange={(e) => setMsgs(e.target.checked)} /> Include contact messages</label>
        <button className={`${btn} w-fit`} onClick={async () => { setNote("Preparing…"); setNote((await download()) ? "Backup downloaded." : ""); }}>Download backup</button>
      </section>
      <section className="bd-gold-25 r-card mt-4 grid gap-3 border bg-card p-4">
        <h2 className="font-serif text-2xl text-gold">Restore from a backup</h2>
        <label className={`${btn} w-fit cursor-pointer`}>Choose backup file<input type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && choose(e.target.files[0])} /></label>
        {file && (
          <>
            <p className="text-sm text-muted">{file.name}. Tick what to restore (it replaces what is there now):</p>
            <div className="grid gap-1">{Object.entries(file.tables).map(([t, rows]) => (
              <label key={t} className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="h-5 w-5" checked={pick.includes(t)} onChange={(e) => setPick(e.target.checked ? [...pick, t] : pick.filter((x) => x !== t))} /> {t} <span className="text-muted">({(rows as unknown[]).length} rows)</span></label>
            ))}</div>
            <label className="grid gap-1 text-sm text-muted">Type RESTORE to confirm<input className="bd-gold-30 max-w-xs rounded-lg border bg-field p-2.5 text-base text-fg" value={word} onChange={(e) => setWord(e.target.value)} autoCapitalize="characters" /></label>
            <button className={`${btn} w-fit ${word === "RESTORE" && pick.length ? "" : "opacity-40"}`} disabled={word !== "RESTORE" || !pick.length} onClick={restore}>Restore now</button>
          </>
        )}
      </section>
      {note && <p className="mt-4 text-em" role="status">{note}</p>}
    </div>
  );
}

export default function Page() { return <Gate><Backup /></Gate>; }
