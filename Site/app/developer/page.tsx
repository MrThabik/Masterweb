"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

const count = async (table: string, f?: (q: any) => any) => {
  let q: any = supabase.from(table).select("*", { count: "exact", head: true });
  if (f) q = f(q);
  const { count } = await q;
  return (count ?? 0) as number;
};

function Dashboard() {
  const [c, setC] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [test, setTest] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const [sites, art, moods, posts, pub, msgs, unread, subs] = await Promise.all([
        count("sites"), count("artworks"), count("moods"), count("posts"), count("posts", (q) => q.eq("published", true)),
        count("messages"), count("messages", (q) => q.eq("read", false)), count("subscribers"),
      ]);
      setC({ sites, art, moods, posts, pub, msgs, unread, subs });
    })();
  }, []);
  const refresh = async () => {
    setNote("Refreshing…");
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token}` } });
    setNote(r.ok ? "The public website was refreshed." : "Could not refresh.");
  };
  const testStorage = async () => {
    setTest(["Testing…"]);
    const out: string[] = [];
    const why = (m: string) => (/not found/i.test(m) ? "bucket missing: run the Update 7 SQL" : /row-level|policy|unauthor|permission/i.test(m) ? "no permission: run the Update 7 SQL and check MASTER_EMAIL matches your Supabase user email" : m);
    for (const bucket of ["screenshots", "gallery"]) {
      const path = `_test/${Date.now()}.txt`;
      const up = await supabase.storage.from(bucket).upload(path, new Blob(["ok"], { type: "text/plain" }));
      if (up.error) { out.push(`${bucket}: upload FAILED, ${why(up.error.message)}`); continue; }
      const link = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      const r = await fetch(link).catch(() => null);
      out.push(`${bucket}: upload OK, public link ${r && r.ok ? "OK" : `NOT public (status ${r?.status ?? "none"}): run the Update 7 SQL`}`);
      await supabase.storage.from(bucket).remove([path]);
    }
    setTest(out);
  };
  const cards: [string, number | undefined, string, string][] = [
    ["Websites", c.sites, "cards on your home page", "/developer/websites"],
    ["Gallery photos", c.art, "in the cinematic gallery", "/developer/gallery"],
    ["Mood-board", c.moods, "photos", "/developer/moodboard"],
    ["Blog posts", c.pub, `published, ${(c.posts ?? 0) - (c.pub ?? 0)} drafts`, "/developer/blog"],
    ["Messages", c.unread, `unread of ${c.msgs ?? 0}`, "/developer/messages"],
    ["Subscribers", c.subs, "want new posts", "/developer/subscribers"],
  ];
  const act = "bd-gold-40 r-card adm-card border bg-card px-4 py-4 text-left text-base text-gold";
  return (
    <div>
      <h1 className="adm-title font-serif text-4xl">Dashboard</h1>
      <p className="mt-1 text-muted">Everything about your website at a glance.</p>
      <div className="mt-5"><Tips id="dashboard" items={["Tap a card to open that manager.", "Use the Guide button for a short tour, or the Voice button to say “open gallery”.", "Design & Layout has a live preview and an AI helper that applies changes you describe.", "Every save in Design and Settings is kept in History, so you can go back."]} /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([t, n, sub, href]) => (
          <Link key={t} href={href} className="bd-gold-25 r-card adm-card border bg-card p-5">
            <p className="text-sm text-muted">{t}</p>
            <p className="font-serif text-5xl text-gold">{n ?? "–"}</p>
            <p className="text-sm text-muted">{sub}</p>
          </Link>
        ))}
      </div>
      <h2 className="mb-3 mt-8 font-serif text-2xl text-gold">Quick actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/developer/websites" className={act}>+ Add a website</Link>
        <Link href="/developer/gallery" className={act}>Upload photos</Link>
        <Link href="/developer/blog" className={act}>Write a blog post</Link>
        <Link href="/developer/design" className={act}>Edit the design</Link>
        <Link href="/developer/settings" className={act}>Site settings and SEO</Link>
        <Link href="/developer/history" className={act}>Restore an earlier version</Link>
        <Link href="/developer/stats" className={act}>Visitor statistics</Link>
        <Link href="/developer/backup" className={act}>Backup &amp; restore</Link>
        <button className={act} onClick={refresh}>Refresh the public website now</button>
        <a href="/" target="_blank" rel="noopener" className={act}>Open the public website ↗</a>
      </div>
      <p className="mt-3 text-em">{note}</p>
      <h2 className="mb-2 mt-8 font-serif text-2xl text-gold">Image upload check</h2>
      <p className="text-sm text-muted">If a picture will not upload or does not show, press this. It tests both image folders and tells you exactly what is wrong.</p>
      <button className={`${act} mt-3 w-fit`} onClick={testStorage}>Test image upload</button>
      <ul className="mt-3 grid gap-1 text-sm text-fg">{test.map((t) => <li key={t} className={t.includes("FAILED") || t.includes("NOT") ? "text-red-400" : "text-em"}>{t}</li>)}</ul>
    </div>
  );
}

export default function Page() { return <Gate><Dashboard /></Gate>; }
