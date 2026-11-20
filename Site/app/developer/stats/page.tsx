"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Gate from "@/components/Gate";
import { Tips } from "@/components/Tour";

type KV = { k: string; v: number };
type S = { total: number; visitors: number; live: number; daily: { d: string; v: number; u: number }[]; pages: KV[]; refs: KV[]; countries: KV[]; devices: KV[]; langs: KV[] };
const region = (c: string) => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(c) ?? c; } catch { return c; } };

function Bars({ title, rows, map }: { title: string; rows: KV[]; map?: (k: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.v));
  return (
    <section className="bd-gold-25 r-card border bg-card p-4">
      <h2 className="font-serif text-xl text-gold">{title}</h2>
      {rows.length === 0 && <p className="mt-2 text-sm text-muted">No data yet.</p>}
      <ul className="mt-2 grid gap-2">
        {rows.map((r) => (
          <li key={r.k} className="text-sm">
            <div className="flex justify-between gap-3"><span className="min-w-0 truncate text-fg">{map ? map(r.k) : r.k}</span><span className="text-muted">{r.v}</span></div>
            <div className="mt-1 h-2 rounded-full bg-[color-mix(in_srgb,var(--fg)_10%,transparent)]"><div className="h-2 rounded-full bg-gold" style={{ width: `${(r.v / max) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stats() {
  const [days, setDays] = useState(30);
  const [d, setD] = useState<S | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    setErr("");
    supabase.rpc("stats_summary", { p_days: days }).then(({ data, error }) => {
      if (error || !data) { setErr("Visitor statistics are not set up yet. Run the Update 8 SQL in Supabase, then reload."); setD(null); } else setD(data as S);
    });
  }, [days]);
  const max = Math.max(1, ...(d?.daily.map((x) => x.v) ?? [1]));
  const pill = (on: boolean) => `rounded-full border px-4 py-2 text-sm ${on ? "bg-gold text-black border-gold" : "bd-gold-40 text-gold"}`;
  return (
    <div>
      <h1 className="adm-title font-serif text-3xl">Visitor statistics</h1>
      <p className="mt-1 text-sm text-muted">Anonymous visits to your public website: no cookies, no names, no IP addresses.</p>
      <div className="mt-3"><Tips id="stats" items={["Views count every page opened; visitors count different devices.", "“Right now” shows devices active in the last 5 minutes.", "Switch the period with the buttons. Developer Space visits and search-engine robots are not counted.", "You can turn counting off in Site Settings > Visitors, privacy and install."]} /></div>
      <div className="mt-3 flex flex-wrap gap-2">{[7, 30, 90, 365].map((n) => <button key={n} className={pill(days === n)} onClick={() => setDays(n)}>{n === 365 ? "1 year" : `${n} days`}</button>)}</div>
      {err && <p className="mt-4 text-red-400">{err}</p>}
      {d && (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[["Page views", d.total], ["Visitors", d.visitors], ["Right now", d.live]].map(([t, n]) => (
              <div key={String(t)} className="bd-gold-25 r-card adm-card border bg-card p-5"><p className="text-sm text-muted">{t}</p><p className="font-serif text-5xl text-gold">{n}</p></div>
            ))}
          </div>
          <section className="bd-gold-25 r-card mt-4 border bg-card p-4">
            <h2 className="font-serif text-xl text-gold">Views per day</h2>
            {d.daily.length === 0 ? <p className="mt-2 text-sm text-muted">No visits yet.</p> : (
              <>
                <svg viewBox={`0 0 ${Math.max(300, d.daily.length * 14)} 150`} className="mt-3 h-40 w-full" preserveAspectRatio="none" role="img" aria-label="Views per day">
                  {d.daily.map((x, i) => { const h = Math.max(2, (x.v / max) * 130); return <rect key={x.d} x={i * 14 + 2} y={140 - h} width={10} height={h} rx={2} fill="var(--gold)"><title>{`${x.d}: ${x.v} views, ${x.u} visitors`}</title></rect>; })}
                </svg>
                <div className="flex justify-between text-xs text-muted"><span>{d.daily[0].d}</span><span>{d.daily[d.daily.length - 1].d}</span></div>
              </>
            )}
          </section>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Bars title="Top pages" rows={d.pages} />
            <Bars title="Where visitors come from" rows={d.refs} />
            <Bars title="Countries" rows={d.countries} map={region} />
            <Bars title="Devices" rows={d.devices} />
            <Bars title="Language" rows={d.langs} map={(k) => (k === "ta" ? "தமிழ்" : "English")} />
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() { return <Gate><Stats /></Gate>; }
