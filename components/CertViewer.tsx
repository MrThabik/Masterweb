"use client";
import { useMemo, useState } from "react";
import { T, U } from "@/components/T";

export type Cert = { id: string; title: string; issuer: string | null; issued_on: string | null; category: string | null; description: string | null; credential_url: string | null; url: string; file_type: string | null; downloadable: boolean };

// Certificate wall with a full-screen viewer. "View only" files are shown with a watermark and without download links.
export default function CertViewer({ certs, resume, watermark, layout }: { certs: Cert[]; resume: Cert | null; watermark: string; layout: string }) {
  const cats = useMemo(() => Array.from(new Set(certs.map((c) => c.category).filter(Boolean))) as string[], [certs]);
  const [cat, setCat] = useState("All");
  const [sel, setSel] = useState<Cert | null>(null);
  const list = cat === "All" ? certs : certs.filter((c) => c.category === cat);
  const isPdf = (c: Cert) => c.file_type === "pdf";
  const wm = watermark ? (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[.16]"><div className="absolute -inset-1/2 -rotate-[28deg] text-center font-serif text-xl leading-[90px] tracking-[.25em] text-gray-500">{Array(80).fill(`${watermark}   `).join("")}</div></div>
  ) : null;
  const safeHttps = (u?: string | null) => (u && /^https:\/\//i.test(u) ? u : "");
  const chip = (on: boolean) => `rounded-full border px-4 py-1.5 text-sm ${on ? "bg-gold text-black border-gold" : "bd-gold-30 text-fg"}`;

  const card = (c: Cert) => (
    <article key={c.id} className="bd-gold-25 r-card adm-card flex flex-col overflow-hidden border bg-card">
      <button onClick={() => setSel(c)} className={`relative block text-left ${layout === "list" ? "hidden" : ""}`} aria-label={`View ${c.title}`}>
        {isPdf(c) ? <div className="grid aspect-[4/3] place-items-center bg-[color-mix(in_srgb,var(--gold)_10%,var(--bg))] font-serif text-4xl text-gold">PDF</div>
          : /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.url} alt={c.title} loading="lazy" draggable={false} className="aspect-[4/3] w-full object-cover" onContextMenu={(e) => !c.downloadable && e.preventDefault()} />}
        {!c.downloadable && wm}
      </button>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {c.category && <p className="text-xs uppercase tracking-wider text-em">{c.category}</p>}
        <h3 className="font-serif text-xl text-gold">{c.title}</h3>
        {(c.issuer || c.issued_on) && <p className="text-sm text-muted">{c.issuer && <><U k="issuedBy" /> {c.issuer}</>}{c.issuer && c.issued_on ? " · " : ""}{c.issued_on ? new Date(c.issued_on).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : ""}</p>}
        {c.description && <p className="text-sm text-muted">{c.description}</p>}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button className="border-em rounded-full border px-4 py-2 text-sm text-em" onClick={() => setSel(c)}><U k="viewIt" /></button>
          {safeHttps(c.credential_url) && <a className="bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold" href={safeHttps(c.credential_url)} target="_blank" rel="noopener"><U k="verifyIt" /></a>}
          {c.downloadable && <a className="bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold" href={c.url} download target="_blank" rel="noopener"><U k="downloadIt" /></a>}
        </div>
      </div>
    </article>
  );

  return (
    <>
      {resume && (
        <section className="bd-gold-40 r-card mb-8 flex flex-wrap items-center justify-between gap-3 border bg-card p-5">
          <div><p className="text-xs uppercase tracking-wider text-em"><U k="resumeLabel" /></p><h2 className="font-serif text-2xl text-gold">{resume.title}</h2></div>
          <div className="flex flex-wrap gap-2">
            <button className="border-em rounded-full border px-5 py-2 text-em" onClick={() => setSel(resume)}><U k="viewIt" /></button>
            {resume.downloadable && <a className="bd-gold-40 rounded-full border px-5 py-2 text-gold" href={resume.url} download target="_blank" rel="noopener"><U k="downloadIt" /></a>}
          </div>
        </section>
      )}
      {cats.length > 0 && <div className="mb-5 flex flex-wrap gap-2"><button className={chip(cat === "All")} onClick={() => setCat("All")}><U k="allItems" /></button>{cats.map((c) => <button key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{c}</button>)}</div>}
      <div className={layout === "list" ? "grid gap-4" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}>{list.map(card)}</div>
      {!list.length && <p className="text-center text-muted">No certificates yet.</p>}

      {sel && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-3" onClick={() => setSel(null)} role="dialog" aria-label={sel.title}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()} onContextMenu={(e) => !sel.downloadable && e.preventDefault()}>
            <div className="mb-2 flex items-center justify-between gap-3 text-white">
              <p className="font-serif text-xl">{sel.title}{!sel.downloadable && <span className="ml-3 text-xs uppercase tracking-wider text-white/60"><U k="viewOnly" /></span>}</p>
              <div className="flex gap-2">
                {sel.downloadable && <a className="rounded-full border border-white/40 px-4 py-2 text-sm" href={sel.url} download target="_blank" rel="noopener"><U k="downloadIt" /></a>}
                <button className="rounded-full border border-white/40 px-4 py-2 text-sm" onClick={() => setSel(null)}><U k="closeIt" /></button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-white">
              {isPdf(sel)
                ? <iframe title={sel.title} src={sel.downloadable ? sel.url : `${sel.url}#toolbar=0&navpanes=0`} className="h-[78vh] w-full" />
                : /* eslint-disable-next-line @next/next/no-img-element */ <img src={sel.url} alt={sel.title} draggable={false} className="mx-auto max-h-[78vh] max-w-full select-none" />}
              {!sel.downloadable && wm}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
