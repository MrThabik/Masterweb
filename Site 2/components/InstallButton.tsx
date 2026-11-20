"use client";
import { useEffect, useState } from "react";
import { U } from "@/components/T";

export default function InstallButton() {
  const [ev, setEv] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  useEffect(() => {
    const on = (e: Event) => { e.preventDefault(); setEv(e); };
    window.addEventListener("beforeinstallprompt", on);
    return () => window.removeEventListener("beforeinstallprompt", on);
  }, []);
  if (!ev) return null;
  return <button onClick={async () => { await ev.prompt(); setEv(null); }} className="bd-gold-40 rounded-full border px-4 py-2 text-xs text-gold"><U k="installApp" /></button>;
}
